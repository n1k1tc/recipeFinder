const express = require("express");
const Recipe = require("../models/Recipe");
const verifyToken = require("../middleware/verifyToken");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// POST - Create new recipe
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const recipe = new Recipe(req.body);
    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    res.status(400).json({ 
      message: "Failed to add recipe",
      error: error.message 
    });
  }
});

// GET - All recipes with advanced filtering
router.get("/", async (req, res) => {
  try {
    const { 
      search, 
      ingredients, 
      category, 
      maxPrepTime, 
      maxCookTime,
      maxTotalTime,
      difficulty,
      dietary,
      servings,
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    // Text search (recipe name or ingredient names)
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by ingredients (EXACT match - for "recipes I can make")
    if (ingredients) {
      const ingredientArray = ingredients.split(",").map(i => i.trim().toLowerCase());
      query['ingredients.name'] = { $all: ingredientArray };
    }

    // Filter by category
    if (category) {
      query.category = category.toLowerCase();
    }

    // Filter by difficulty
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Filter by dietary preferences
    if (dietary) {
      const dietaryArray = dietary.split(",");
      query.dietary = { $in: dietaryArray };
    }

    // Filter by prep time
    if (maxPrepTime) {
      query.prepTime = { $lte: Number(maxPrepTime) };
    }

    // Filter by cook time
    if (maxCookTime) {
      query.cookTime = { $lte: Number(maxCookTime) };
    }

    // Filter by servings
    if (servings) {
      query.servings = { $lte: Number(servings) };
    }

    // Regular find for simple queries
    const recipes = await Recipe.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Recipe.countDocuments(query);

    res.json({
      recipes,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalRecipes: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Failed to fetch recipes",
      error: error.message 
    });
  }
});


// GET - Recipes by available ingredients
router.get("/available", async (req, res) => {
  try {
    const { ingredients } = req.query;
    
    if (!ingredients) {
      return res.status(400).json({ message: "Ingredients parameter is required" });
    }

    // Clean ingredients: remove commas from ingredient names before splitting
    const cleanedIngredients = ingredients
      .replace(/,\s+/g, '+') // Replace commas in ingredient names with +
      .split(',')
      .map(i => i.trim().toLowerCase().replace(/\+/g, ' ')); // Convert back to spaces
    
    console.log("Cleaned user ingredients:", cleanedIngredients);
    
    // Get ALL recipes
    const allRecipes = await Recipe.find({});
    console.log(`Found ${allRecipes.length} total recipes in database`);
    
    if (allRecipes.length === 0) {
      return res.json({
        recipes: [],
        totalFound: 0,
        userIngredients: cleanedIngredients,
        message: "No recipes in database"
      });
    }
    
    // Calculate match for each recipe
    const recipesWithMatch = allRecipes.map(recipe => {
      const recipeIngredients = recipe.ingredients.map(i => i.name.toLowerCase());
      console.log(`Recipe: ${recipe.name}`);
      console.log(`Recipe ingredients: ${recipeIngredients}`);
      
      // Count how many user ingredients are found in the recipe
      let matchedUserIngredients = 0;
      const matchedIngredients = [];
      
      // For EACH user ingredient, check if it exists in recipe
      cleanedIngredients.forEach(userIngredient => {
        const found = recipeIngredients.some(recipeIngredient => {
          // Normalize both
          const normalizedUserIng = userIngredient.toLowerCase().trim();
          const normalizedRecipeIng = recipeIngredient.toLowerCase().trim();
          
          // Check for exact or partial match
          if (normalizedRecipeIng.includes(normalizedUserIng) || 
              normalizedUserIng.includes(normalizedRecipeIng)) {
            return true;
          }
          
          // Also check for common ingredient variations
          const userWords = normalizedUserIng.split(' ');
          const recipeWords = normalizedRecipeIng.split(' ');
          
          // If any word matches
          return userWords.some(word => 
            word.length > 2 && recipeWords.some(rWord => rWord.includes(word))
          );
        });
        
        if (found) {
          matchedUserIngredients++;
          matchedIngredients.push(userIngredient);
        }
      });
      
      // Calculate how many of the USER's ingredients are in this recipe
      const userMatchPercentage = cleanedIngredients.length > 0 
        ? Math.round((matchedUserIngredients / cleanedIngredients.length) * 100)
        : 0;
      
      // Calculate how many of RECIPE's ingredients the user has
      const recipeMatchPercentage = recipeIngredients.length > 0
        ? Math.round((matchedIngredients.length / recipeIngredients.length) * 100)
        : 0;
      
      const hasAllUserIngredients = matchedUserIngredients === cleanedIngredients.length;
      
      console.log(`User ingredients matched: ${matchedUserIngredients}/${cleanedIngredients.length}`);
      
      return {
        ...recipe.toObject(),
        matchPercentage: userMatchPercentage, // How many of USER's ingredients are in recipe
        recipeMatchPercentage, // How many of RECIPE's ingredients user has
        matchedIngredients,
        hasAllUserIngredients,
        userIngredientsCount: cleanedIngredients.length,
        userIngredientsMatched: matchedUserIngredients,
        canMakeWithSubstitutes: userMatchPercentage >= 70
      };
    })
    // Filter: show recipes that contain at least ONE user ingredient
    .filter(recipe => recipe.userIngredientsMatched > 0)
    // Sort by highest match percentage first
    .sort((a, b) => b.matchPercentage - a.matchPercentage);

    console.log(`Found ${recipesWithMatch.length} matching recipes`);
    
    // Separate complete matches (recipes that contain ALL user ingredients)
    const completeMatches = recipesWithMatch.filter(r => r.hasAllUserIngredients);
    const partialMatches = recipesWithMatch.filter(r => !r.hasAllUserIngredients);

    res.json({
      recipes: recipesWithMatch,
      completeMatches: completeMatches.length,
      partialMatches: partialMatches.length,
      totalFound: recipesWithMatch.length,
      userIngredients: cleanedIngredients,
      message: recipesWithMatch.length === 0 
        ? `No recipes found containing your selected ingredients. Try different ingredients.`
        : completeMatches.length > 0
          ? `Found ${completeMatches.length} recipes that contain ALL your ingredients`
          : `Found ${recipesWithMatch.length} recipes with some of your ingredients`
    });
  } catch (error) {
    console.error("Error in /available endpoint:", error);
    res.status(500).json({ 
      message: "Failed to find matching recipes",
      error: error.message 
    });
  }
});

// GET - Single recipe by ID
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json(recipe);
  } catch (error) {
    res.status(400).json({ 
      message: "Invalid recipe ID",
      error: error.message 
    });
  }
});

// PUT - Update recipe by ID (Admin)
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({
      message: "Recipe updated successfully",
      recipe: updatedRecipe
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update recipe",
      error: error.message
    });
  }
});

// DELETE - Remove recipe by ID (Admin)
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);

    if (!deletedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({
      message: "Recipe deleted successfully",
      recipe: deletedRecipe
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete recipe",
      error: error.message
    });
  }
});

// POST - Seed multiple recipes (for development)
router.post("/seed", async (req, res) => {
  try {
    const recipes = req.body;
    
    if (!Array.isArray(recipes)) {
      return res.status(400).json({ message: "Request body must be an array of recipes" });
    }

    const insertedRecipes = await Recipe.insertMany(recipes);
    res.status(201).json({
      message: `Successfully seeded ${insertedRecipes.length} recipes`,
      recipes: insertedRecipes
    });
  } catch (error) {
    res.status(400).json({ 
      message: "Failed to seed recipes",
      error: error.message 
    });
  }
});

module.exports = router;