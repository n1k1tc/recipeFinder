const express = require("express");
const User = require("../models/User");
const Recipe = require("../models/Recipe");

const router = express.Router();

// MIDDLEWARE: Extract user from JWT
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "No token provided. Please login again." 
      });
    }

    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token. Please login again." 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token expired. Please login again." 
      });
    }
    
    res.status(401).json({ 
      success: false,
      message: "Authentication failed" 
    });
  }
};

// ================= TEST ROUTE ================= //

// Test route to verify API is working
router.get("/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "User API is working!",
    endpoints: [
      "GET /favorites",
      "POST /favorites",
      "DELETE /favorites/:recipeId",
      "GET /favorites/check/:recipeId",
      "DELETE /favorites",
      "GET /recent-searches",
      "POST /recent-searches",
      "DELETE /recent-searches"
    ]
  });
});

// ================= RECENT SEARCHES ================= //

// GET user's recent searches
router.get("/recent-searches", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    // If user doesn't have recentSearches field yet, return empty
    const searches = user.recentSearches || [];
    
    console.log("Fetching recent searches for user:", user.email);
    console.log("Raw searches data:", searches);
    
    // If no searches, return empty array
    if (searches.length === 0) {
      return res.json({ 
        success: true,
        message: "No recent searches found",
        recentSearches: [] 
      });
    }
    
    // Filter out any invalid entries
    const validSearches = searches.filter(search => search && search.recipeId);
    
    if (validSearches.length === 0) {
      return res.json({ 
        success: true,
        message: "No valid recent searches found",
        recentSearches: [] 
      });
    }
    
    // Extract recipe IDs
    const recipeIds = validSearches.map(s => s.recipeId).filter(id => id);
    
    console.log("Fetching recipes with IDs:", recipeIds);
    
    // Fetch recipe details
    const recipes = await Recipe.find({ _id: { $in: recipeIds } })
      .select('name imageUrl category prepTime cookTime servings difficulty ingredients steps');
    
    console.log("Found recipes:", recipes.length);
    
    // Create a map for quick lookup
    const recipeMap = {};
    recipes.forEach(recipe => {
      recipeMap[recipe._id.toString()] = recipe;
    });
    
    // Combine searches with recipe data
    const populatedSearches = validSearches.map(search => {
      const recipeIdStr = search.recipeId.toString();
      const recipe = recipeMap[recipeIdStr] || { _id: search.recipeId };
      return {
        _id: search._id,
        recipeId: recipe,
        timestamp: search.timestamp || new Date()
      };
    });
    
    // Sort by timestamp (most recent first)
    const sortedSearches = populatedSearches.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    res.json({ 
      success: true,
      message: "Recent searches fetched successfully",
      count: sortedSearches.length,
      recentSearches: sortedSearches 
    });
  } catch (error) {
    console.error("Error fetching recent searches:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch recent searches",
      error: error.message 
    });
  }
});

// ADD to recent searches (call this when user views a recipe)
router.post("/recent-searches", authMiddleware, async (req, res) => {
  try {
    const { recipeId } = req.body;
    
    if (!recipeId) {
      return res.status(400).json({ 
        success: false,
        message: "Recipe ID is required" 
      });
    }
    
    console.log("Adding to recent searches:", recipeId);
    
    // Check if recipe exists
    const recipeExists = await Recipe.findById(recipeId);
    if (!recipeExists) {
      return res.status(404).json({ 
        success: false,
        message: "Recipe not found" 
      });
    }
    
    const user = await User.findById(req.user.id);
    
    // Initialize recentSearches if it doesn't exist
    if (!user.recentSearches) {
      user.recentSearches = [];
    }
    
    // Check if already exists
    const existingIndex = user.recentSearches.findIndex(
      search => search && search.recipeId && search.recipeId.toString() === recipeId
    );
    
    // If it exists, remove it (we'll add it fresh at the beginning)
    if (existingIndex !== -1) {
      user.recentSearches.splice(existingIndex, 1);
    }
    
    // Add new search to beginning
    user.recentSearches.unshift({
      recipeId,
      timestamp: new Date()
    });
    
    // Keep only last 50 searches
    if (user.recentSearches.length > 50) {
      user.recentSearches = user.recentSearches.slice(0, 50);
    }
    
    await user.save();
    
    console.log("Added to recent searches. Total:", user.recentSearches.length);
    
    res.json({ 
      success: true,
      message: "Added to recent searches",
      count: user.recentSearches.length 
    });
  } catch (error) {
    console.error("Error adding to recent searches:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to add to recent searches",
      error: error.message 
    });
  }
});

// CLEAR recent searches
router.delete("/recent-searches", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.recentSearches = [];
    await user.save();
    
    res.json({ 
      success: true,
      message: "Recent searches cleared successfully" 
    });
  } catch (error) {
    console.error("Error clearing recent searches:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to clear recent searches",
      error: error.message 
    });
  }
});

// ================= FAVORITES ================= //

// GET user's favorites
router.get("/favorites", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    // If user doesn't have favorites field yet, return empty
    const favorites = user.favorites || [];
    
    console.log("User favorites raw:", favorites);
    
    // If no favorites, return empty array
    if (favorites.length === 0) {
      return res.json({ 
        success: true,
        message: "No favorites found",
        favorites: [] 
      });
    }
    
    // STEP 1: Fix the data structure first
    const fixedFavorites = favorites.map(fav => {
      // If it's already in the correct structure, return as is
      if (fav && typeof fav === 'object' && fav.recipeId) {
        return fav;
      }
      // If it's just an ObjectId (old structure), convert to new structure
      return {
        recipeId: fav,  // fav is the ObjectId
        addedAt: new Date()
      };
    }).filter(fav => fav && fav.recipeId); // Remove any null entries
    
    console.log("Fixed favorites:", fixedFavorites);
    
    // STEP 2: Extract recipe IDs
    const recipeIds = fixedFavorites.map(fav => fav.recipeId).filter(id => id);
    
    console.log("Recipe IDs to fetch:", recipeIds);
    
    // STEP 3: Fetch recipe details
    const recipes = await Recipe.find({ _id: { $in: recipeIds } })
      .select('name imageUrl category prepTime cookTime servings difficulty ingredients steps');
    
    console.log("Found recipes:", recipes.length);
    
    // STEP 4: Create a map for quick lookup
    const recipeMap = {};
    recipes.forEach(recipe => {
      recipeMap[recipe._id.toString()] = recipe;
    });
    
    // STEP 5: Combine favorites with recipe data
    const populatedFavorites = fixedFavorites.map(favorite => {
      const recipeIdStr = favorite.recipeId.toString();
      const recipe = recipeMap[recipeIdStr] || { _id: favorite.recipeId };
      return {
        _id: favorite._id,
        recipeId: recipe,
        addedAt: favorite.addedAt || new Date()
      };
    });
    
    // STEP 6: Sort by added date (newest first)
    const sortedFavorites = populatedFavorites.sort(
      (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
    );
    
    res.json({ 
      success: true,
      message: "Favorites fetched successfully",
      count: sortedFavorites.length,
      favorites: sortedFavorites 
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch favorites",
      error: error.message 
    });
  }
});

// ADD to favorites
router.post("/favorites", authMiddleware, async (req, res) => {
  try {
    const { recipeId } = req.body;
    
    if (!recipeId) {
      return res.status(400).json({ 
        success: false,
        message: "Recipe ID is required" 
      });
    }
    
    console.log("Adding recipe to favorites:", recipeId);
    
    // Check if recipe exists
    const recipeExists = await Recipe.findById(recipeId);
    if (!recipeExists) {
      return res.status(404).json({ 
        success: false,
        message: "Recipe not found" 
      });
    }
    
    const user = await User.findById(req.user.id);
    
    // Initialize favorites if it doesn't exist
    if (!user.favorites) {
      user.favorites = [];
    }
    
    // Check if already favorited (handle both old and new data structures)
    let alreadyFavorited = false;
    
    for (const fav of user.favorites) {
      if (!fav) continue; // Skip null/undefined entries
      
      let existingRecipeId;
      
      if (typeof fav === 'object' && fav.recipeId) {
        // New structure: { recipeId: ObjectId, addedAt: Date }
        existingRecipeId = fav.recipeId.toString();
      } else {
        // Old structure: just the ObjectId
        existingRecipeId = fav.toString();
      }
      
      if (existingRecipeId === recipeId) {
        alreadyFavorited = true;
        break;
      }
    }
    
    if (alreadyFavorited) {
      return res.status(400).json({ 
        success: false,
        message: "Recipe already in favorites" 
      });
    }
    
    // Add to favorites with new structure
    user.favorites.push({
      recipeId,
      addedAt: new Date()
    });
    
    await user.save();
    
    console.log("Added to favorites successfully. Total favorites:", user.favorites.length);
    
    res.json({ 
      success: true,
      message: "Added to favorites successfully",
      count: user.favorites.length 
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to add to favorites",
      error: error.message 
    });
  }
});

// REMOVE from favorites
router.delete("/favorites/:recipeId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    // Initialize favorites if it doesn't exist
    if (!user.favorites) {
      user.favorites = [];
    }
    
    const initialCount = user.favorites.length;
    
    // Filter out the recipe (handle both old and new data structures)
    user.favorites = user.favorites.filter(fav => {
      if (!fav) return true; // Keep null entries to be safe
      
      let existingRecipeId;
      
      if (typeof fav === 'object' && fav.recipeId) {
        // New structure
        existingRecipeId = fav.recipeId.toString();
      } else {
        // Old structure
        existingRecipeId = fav.toString();
      }
      
      return existingRecipeId !== req.params.recipeId;
    });
    
    // Check if anything was removed
    if (user.favorites.length === initialCount) {
      return res.status(404).json({ 
        success: false,
        message: "Recipe not found in favorites" 
      });
    }
    
    await user.save();
    
    res.json({ 
      success: true,
      message: "Removed from favorites successfully",
      count: user.favorites.length 
    });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to remove from favorites",
      error: error.message 
    });
  }
});

// CHECK if recipe is favorite
router.get("/favorites/check/:recipeId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    // Initialize favorites if it doesn't exist
    if (!user.favorites) {
      user.favorites = [];
    }
    
    let isFavorite = false;
    
    // Check if recipe is in favorites (handle both old and new data structures)
    for (const fav of user.favorites) {
      if (!fav) continue; // Skip null/undefined entries
      
      let existingRecipeId;
      
      if (typeof fav === 'object' && fav.recipeId) {
        // New structure
        existingRecipeId = fav.recipeId.toString();
      } else {
        // Old structure
        existingRecipeId = fav.toString();
      }
      
      if (existingRecipeId === req.params.recipeId) {
        isFavorite = true;
        break;
      }
    }
    
    res.json({ 
      success: true,
      isFavorite: isFavorite 
    });
  } catch (error) {
    console.error("Error checking favorite status:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to check favorite status",
      error: error.message 
    });
  }
});

// BULK DELETE all favorites
router.delete("/favorites", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    const count = user.favorites ? user.favorites.length : 0;
    user.favorites = [];
    await user.save();
    
    res.json({ 
      success: true,
      message: `Cleared ${count} favorites successfully`,
      count: 0
    });
  } catch (error) {
    console.error("Error clearing all favorites:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to clear favorites",
      error: error.message 
    });
  }
});

module.exports = router;