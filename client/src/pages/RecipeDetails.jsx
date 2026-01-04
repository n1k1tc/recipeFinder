import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  FaSearch, 
  FaShoppingCart, 
  FaHeart, 
  FaRegHeart,
  FaCheck, 
  FaTimes, 
  FaBolt,
  FaArrowLeft,
  FaClock,
  FaUtensils,
  FaListUl,
  FaBookOpen
} from "react-icons/fa";
import "./RecipeDetails.css";

const API = import.meta.env.VITE_API_BASE_URL;

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  // Add this useEffect to RecipeDetails.jsx (place it with your other useEffects)
  useEffect(() => {
    const saveToRecentSearches = async () => {
      const token = localStorage.getItem("token");
      
      // Only save if user is logged in AND recipe exists
      if (!token || !recipe) return;
      
      try {
        console.log("Saving to recent searches:", recipe._id);
        
        const response = await axios.post(
          `${API}/api/user/recent-searches`,
          { recipeId: recipe._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          console.log("✅ Recipe saved to recent searches");
        }
      } catch (error) {
        console.error("❌ Error saving to recent searches:", error);
      }
    };
    
    // Call this when recipe loads
    if (recipe) {
      saveToRecentSearches();
    }
  }, [recipe]); // This runs every time recipe changes

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token || !recipe?._id) return;
      
      try {
        const response = await axios.get(
          `http://localhost:5000/api/user/favorites/check/${recipe._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setIsFavorite(response.data.isFavorite);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };
    
    if (recipe) {
      checkFavoriteStatus();
    }
  }, [recipe]);

  // Add this function to handle favorite toggle
  const handleFavoriteToggle = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
  
    setFavoriteLoading(true);
    
    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await axios.delete(
          `http://localhost:5000/api/user/favorites/${recipe._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setIsFavorite(false);
          alert("Removed from favorites!");
        }
      } else {
        // Add to favorites
        const response = await axios.post(
          "http://localhost:5000/api/user/favorites",
          { recipeId: recipe._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setIsFavorite(true);
          alert("Added to favorites!");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert(error.response?.data?.message || "Error saving favorite");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch recipe details ONLY
      const response = await axios.get(`http://localhost:5000/api/recipes/${id}`);
      setRecipe(response.data);
      
      // REMOVED: saveToRecentSearches() call - no longer saving to recent searches
      
    } catch (error) {
      console.error("Error fetching recipe:", error);
      setError("Failed to load recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientToggle = (ingredientName) => {
    setAvailableIngredients(prev => {
      if (prev.includes(ingredientName)) {
        return prev.filter(item => item !== ingredientName);
      } else {
        return [...prev, ingredientName];
      }
    });
  };

  // Select all ingredients
  const selectAllIngredients = () => {
    if (!recipe || !recipe.ingredients) return;
    const allIngredientNames = recipe.ingredients.map(ing => ing.name);
    setAvailableIngredients(allIngredientNames);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setAvailableIngredients([]);
  };

  // Quick select common ingredients
  const quickSelectCommon = () => {
    if (!recipe || !recipe.ingredients) return;
    
    const commonIngredients = [
      'salt', 'pepper', 'oil', 'water', 'sugar', 'flour', 
      'butter', 'garlic', 'onion', 'eggs', 'milk',
      'vinegar', 'honey', 'baking powder', 'baking soda', 'yeast', 'vanilla'
    ];
    
    const recipeIngredientNames = recipe.ingredients.map(ing => ing.name.toLowerCase());
    const commonMatches = recipeIngredientNames.filter(ingName => 
      commonIngredients.some(common => ingName.includes(common) || common.includes(ingName))
    );
    
    const actualIngredientNames = recipe.ingredients
      .filter(ing => commonMatches.includes(ing.name.toLowerCase()))
      .map(ing => ing.name);
    
    setAvailableIngredients(actualIngredientNames);
  };

  const findRecipesWithAvailableIngredients = async () => {
  if (availableIngredients.length === 0) {
    alert("Please select at least one ingredient you have");
    return;
  }
  
  try {
    console.log("Original selected ingredients:", availableIngredients);
    
    // Show loading state
    const findButton = document.querySelector('.find-recipes-btn');
    const originalText = findButton?.textContent || "Find Recipes with These Ingredients";
    
    if (findButton) {
      findButton.textContent = "Searching...";
      findButton.disabled = true;
      findButton.style.opacity = "0.7";
    }
    
    // ===== NEW: IMPROVED INGREDIENT CLEANING =====
    const cleanIngredients = availableIngredients.map(ingredient => {
      // First, clean the ingredient string
      let cleaned = ingredient
        // Remove quantities like "2 cups", "1/2", "3 tbsp"
        .replace(/^\d+\s*\/?\s*\d*\s*(cup|teaspoon|tablespoon|tbsp|tsp|oz|g|kg|lb|ml|l|piece|pieces|slice|slices)\s*/gi, '')
        // Remove standalone numbers at beginning
        .replace(/^\d+\s*/, '')
        // Remove parentheses and content inside them (like "chopped" in "onion (chopped)")
        .replace(/\s*\(.*?\)\s*/g, ' ')
        // Remove extra words like "fresh", "chopped", "diced" etc.
        .replace(/\b(fresh|chopped|diced|sliced|minced|grated|crushed|ground|powdered|dried|frozen|canned)\b/gi, '')
        // Normalize spaces and commas
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
      
      // Remove special characters but keep spaces
      cleaned = cleaned.replace(/[^\w\s]/g, ' ');
      
      // Final trim and cleanup
      cleaned = cleaned.replace(/\s+/g, ' ').trim();
      
      // For ingredients like "salt and pepper", keep them as single units
      // Don't split them - keep them as whole phrases
      
      console.log(`Cleaned: "${ingredient}" → "${cleaned}"`);
      return cleaned;
    }).filter(ingredient => ingredient.length > 0); // Remove empty strings
    
    console.log("Cleaned ingredients array:", cleanIngredients);
    
    // ===== NEW: SMART INGREDIENT HANDLING =====
    // Handle multi-word ingredients properly
    const finalIngredients = cleanIngredients.map(ing => {
      // For ingredients that should stay together (like "salt and pepper")
      const keepTogetherPhrases = [
        'salt and pepper', 'salt & pepper', 'salt and black pepper',
        'oil', 'water', 'sugar', 'flour', 'butter', 'eggs', 'milk',
        'vanilla extract', 'baking powder', 'baking soda'
      ];
      
      // Check if this is a "keep together" phrase
      for (const phrase of keepTogetherPhrases) {
        if (ing.includes(phrase) || phrase.includes(ing)) {
          return phrase; // Return the standardized phrase
        }
      }
      
      // For other ingredients, return as is
      return ing;
    });
    
    console.log("Final ingredients for search:", finalIngredients);
    
    // ===== NEW: BETTER QUERY STRING FORMATTING =====
    // Instead of joining with commas, use a more reliable format
    // We'll send each ingredient individually encoded
    const queryString = finalIngredients
      .map(ing => encodeURIComponent(ing))
      .join(',');
    
    console.log("Query string:", queryString);
    
    const apiUrl = `http://localhost:5000/api/recipes/available?ingredients=${queryString}`;
    console.log("API URL:", apiUrl);
    
    // Call the backend
    const response = await axios.get(apiUrl);
    
    console.log("API Response received:", {
      totalFound: response.data.totalFound,
      completeMatches: response.data.completeMatches,
      partialMatches: response.data.partialMatches,
      recipesCount: response.data.recipes?.length || 0
    });
    
    // Restore button
    if (findButton) {
      setTimeout(() => {
        findButton.textContent = originalText;
        findButton.disabled = false;
        findButton.style.opacity = "1";
      }, 300);
    }
    
    // Handle no results
    if (!response.data.recipes || response.data.recipes.length === 0) {
      alert(`No recipes found containing "${availableIngredients.join('", "')}". Try selecting different ingredients.`);
      return;
    }
    
    // ===== NEW: ADDITIONAL FRONTEND FILTERING FOR SAFETY =====
    // Even though backend filters, we add extra safety check
    const filteredRecipes = response.data.recipes.filter(recipe => {
      if (!recipe.ingredients) return false;
      
      // Get all recipe ingredient names in lowercase
      const recipeIngredientNames = recipe.ingredients.map(ing => 
        typeof ing === 'string' ? ing.toLowerCase() : 
        ing.name ? ing.name.toLowerCase() : ''
      );
      
      // Count how many user ingredients are in this recipe
      const matchedCount = finalIngredients.filter(userIngredient => {
        return recipeIngredientNames.some(recipeIngredient => {
          // Check for matches
          const userIng = userIngredient.toLowerCase().trim();
          const recipeIng = recipeIngredient.toLowerCase().trim();
          
          // Exact match
          if (userIng === recipeIng) return true;
          
          // Partial match (one contains the other)
          if (recipeIng.includes(userIng) || userIng.includes(recipeIng)) {
            return true;
          }
          
          // Word-by-word matching for multi-word ingredients
          const userWords = userIng.split(' ');
          const recipeWords = recipeIng.split(' ');
          
          if (userWords.length > 1) {
            // Check if all user words appear in recipe ingredient
            return userWords.every(word => 
              word.length > 2 && recipeIng.includes(word)
            );
          }
          
          return false;
        });
      }).length;
      
      // Only include recipes that match at least ONE ingredient
      return matchedCount > 0;
    });
    
    console.log(`After frontend filtering: ${filteredRecipes.length} recipes`);
    
    if (filteredRecipes.length === 0) {
      alert(`Found ${response.data.recipes.length} recipes but none contain your exact ingredients. Try selecting common ingredients.`);
      return;
    }
    
    // ===== NEW: SORT BY BEST MATCH =====
    // Sort recipes by match percentage (from backend) or by number of matching ingredients
    const sortedRecipes = [...filteredRecipes].sort((a, b) => {
      // Prefer recipes with higher matchPercentage from backend
      if (a.matchPercentage !== undefined && b.matchPercentage !== undefined) {
        return b.matchPercentage - a.matchPercentage;
      }
      
      // Fallback: count matching ingredients
      const countA = finalIngredients.filter(ing => 
        JSON.stringify(a.ingredients || []).toLowerCase().includes(ing)
      ).length;
      
      const countB = finalIngredients.filter(ing => 
        JSON.stringify(b.ingredients || []).toLowerCase().includes(ing)
      ).length;
      
      return countB - countA;
    });
    
    // Calculate matches for display
    const completeMatches = sortedRecipes.filter(recipe => 
      recipe.hasAllIngredients || recipe.matchPercentage === 100
    ).length;
    
    const partialMatches = sortedRecipes.length - completeMatches;
    
    // Navigate to recipes page with the properly filtered results
    navigate("/recipes", {
      state: { 
        filteredRecipes: sortedRecipes,
        message: completeMatches > 0 
          ? `Found ${completeMatches} recipes with ALL your ingredients and ${partialMatches} with some matches`
          : `Found ${sortedRecipes.length} recipes containing some of your ingredients`,
        userIngredients: availableIngredients, // Keep original for display
        cleanedIngredients: finalIngredients, // Send cleaned version
        matchInfo: true,
        completeMatches: completeMatches,
        partialMatches: partialMatches,
        isIngredientSearch: true, // Flag to indicate this is an ingredient search
        returnFilters: location.state?.returnFilters || {},
        returnSearch: location.state?.returnSearch || ''
      }
    });
    
  } catch (error) {
    console.error("Error finding recipes:", error);
    
    // Restore button
    const findButton = document.querySelector('.find-recipes-btn');
    if (findButton) {
      findButton.textContent = "Find Recipes with These Ingredients";
      findButton.disabled = false;
      findButton.style.opacity = "1";
    }
    
    // Better error messages
    if (error.response) {
      console.error("Response error:", error.response.data);
      if (error.response.status === 400) {
        alert(error.response.data.message || "Please check your ingredient selection.");
      } else if (error.response.status === 500) {
        alert("Server error. Please try again later.");
      }
    } else if (error.request) {
      alert("Network error. Please check your connection.");
    } else {
      alert("An unexpected error occurred. Please try again.");
    }
  }
};

  const goToMissingIngredients = () => {
    if (!recipe) return;
    
    const missing = recipe.ingredients
      .filter(ing => !availableIngredients.includes(ing.name))
      .map(ing => ing.name);
    
    if (missing.length === 0) {
      alert("You have all ingredients! No missing items to buy.");
      return;
    }
    
    navigate(`/missing-ingredients`, {
      state: { 
        missingIngredients: missing, 
        recipeName: recipe.name,
        recipeId: id,
        returnFilters: location.state?.returnFilters || {},
        returnSearch: location.state?.returnSearch || ''
      }
    });
  };

  const saveToFavorites = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Please login to save recipes to favorites");
      navigate("/login", { 
        state: { 
          from: `/recipe/${id}`,
          returnFilters: location.state?.returnFilters || {},
          returnSearch: location.state?.returnSearch || ''
        } 
      });
      return;
    }
    
    try {
      await axios.post(
        "http://localhost:5000/api/user/favorites",
        { recipeId: id },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      alert("Recipe saved to favorites!");
    } catch (error) {
      if (error.response?.status === 400) {
        alert("This recipe is already in your favorites");
      } else {
        console.error("Error saving recipe:", error);
        alert("Could not save recipe. Please try again.");
      }
    }
  };

  const goBackToRecipes = () => {
    if (location.state?.returnFilters || location.state?.returnSearch) {
      navigate("/recipes", {
        state: {
          returnFilters: location.state.returnFilters,
          returnSearch: location.state.returnSearch
        }
      });
    } else {
      navigate("/recipes");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading recipe details...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="error-container">
        <h2>{error || "Recipe not found"}</h2>
        <button 
          onClick={goBackToRecipes}
          className="btn btn-primary"
        >
          <FaArrowLeft /> Back to Recipes
        </button>
      </div>
    );
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const selectedCount = availableIngredients.length;
  const totalIngredients = recipe.ingredients?.length || 0;
  const selectionPercentage = totalIngredients > 0 
    ? Math.round((selectedCount / totalIngredients) * 100) 
    : 0;

  return (
    <div className="recipe-details-page">
      {/* Recipe Header */}
      <div className="recipe-header">
        <img 
          src={recipe.imageUrl || recipe.image || "https://via.placeholder.com/300x300?text=Recipe+Image"} 
          alt={recipe.name} 
          className="recipe-image"
        />
        <div className="recipe-header-info">
          <h1>{recipe.name}</h1>
          <p className="recipe-description">
            {recipe.description || "A delicious recipe"}
          </p>
          
          <div className="recipe-tags">
            {recipe.category && (
              <span className="recipe-tag">{recipe.category}</span>
            )}
            {recipe.difficulty && (
              <span className="recipe-tag">{recipe.difficulty}</span>
            )}
            {recipe.dietary && Array.isArray(recipe.dietary) && recipe.dietary.map(diet => (
              <span key={diet} className="recipe-tag">{diet}</span>
            ))}
          </div>

          <div className="recipe-meta-grid">
            <div className="recipe-meta-item">
              <p><FaClock /> Prep Time</p>
              <p>{recipe.prepTime || 0} min</p>
            </div>
            <div className="recipe-meta-item">
              <p><FaClock /> Cook Time</p>
              <p>{recipe.cookTime || 0} min</p>
            </div>
            <div className="recipe-meta-item">
              <p><FaClock /> Total Time</p>
              <p>{totalTime} min</p>
            </div>
            <div className="recipe-meta-item">
              <p><FaUtensils /> Servings</p>
              <p>{recipe.servings || 2}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients Section */}
      <div className="recipe-section">
        <h2><FaListUl /> Ingredients</h2>
        <p className="selection-info">
          Check ingredients you <strong>already have</strong>:
          <span className="selection-count">
            {selectedCount}/{totalIngredients} selected ({selectionPercentage}%)
          </span>
        </p>
        
        {/* Quick Selection Buttons */}
        <div className="button-row">
          <button 
            onClick={selectAllIngredients}
            className="btn btn-success"
          >
            <FaCheck />
            <span>Select All</span>
          </button>
          
          <button 
            onClick={clearAllSelections}
            className="btn btn-danger"
          >
            <FaTimes />
            <span>Clear All</span>
          </button>
          
          <button 
            onClick={quickSelectCommon}
            className="btn btn-primary"
          >
            <FaBolt />
            <span>Quick Select Common</span>
          </button>
        </div>
        
        {recipe.ingredients && recipe.ingredients.length > 0 ? (
          <>
            <div className="ingredients-box">
              {recipe.ingredients.map((ingredient, index) => (
                <div 
                  key={index} 
                  className={`ingredient-row ${availableIngredients.includes(ingredient.name) ? 'selected' : ''}`}
                >
                  <label>
                    <input
                      type="checkbox"
                      checked={availableIngredients.includes(ingredient.name)}
                      onChange={() => handleIngredientToggle(ingredient.name)}
                      className="ingredient-checkbox"
                    />
                    <span>
                      <strong className="ingredient-name">
                        {ingredient.name}
                      </strong>
                      {ingredient.quantity && (
                        <span className="ingredient-quantity">
                          - {ingredient.quantity} {ingredient.unit || ''}
                        </span>
                      )}
                    </span>
                  </label>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="primary-actions">
              <button 
                onClick={findRecipesWithAvailableIngredients}
                disabled={selectedCount === 0}
                className="find-recipes-btn btn btn-success"
              >
                <FaSearch />
                <span>Find Recipes with These Ingredients</span>
                <span className="selected-count-badge">
                  {selectedCount} selected
                </span>
              </button>

              <button 
                onClick={goToMissingIngredients}
                disabled={selectedCount === totalIngredients}
                className="btn btn-primary"
              >
                <FaShoppingCart />
                <span>See Missing Items to Buy</span>
              </button>

              <button
                onClick={handleFavoriteToggle}
                disabled={favoriteLoading}
                className={`favorite-btn btn ${isFavorite ? 'btn-remove' : 'btn-add'}`}
              >
                {favoriteLoading ? (
                  <>
                    <div className="favorite-spinner"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {isFavorite ? <FaHeart /> : <FaRegHeart />}
                    <span>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="no-ingredients-message">
            No ingredients listed for this recipe.
          </div>
        )}
      </div>

      {/* Cooking Steps */}
      {recipe.steps && recipe.steps.length > 0 && (
        <div className="recipe-section">
          <h2><FaBookOpen /> Cooking Instructions</h2>
          <div className="steps-box">
            {recipe.steps.map((step, index) => (
              <div key={index} className="step-row">
                <div className="step-number">
                  {index + 1}
                </div>
                <p className="step-text">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons - SIMPLIFIED (No Recent Searches Button) */}
      <div className="details-footer">
        <button 
          onClick={goBackToRecipes}
          className="btn btn-success"
        >
          <FaArrowLeft /> Back to All Recipes
        </button>
        
        <button 
          onClick={() => window.history.back()}
          className="btn btn-secondary"
        >
          <FaArrowLeft /> Go Back
        </button>
      </div>
    </div>
  );
};

export default RecipeDetails;