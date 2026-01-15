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
  FaBookOpen,
} from "react-icons/fa";
import "./RecipeDetails.css";

const API = import.meta.env.VITE_API_BASE_URL;

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // State variables
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Clean ingredient name
  const cleanIngredientName = (name) => {
    if (!name) return "";
    return name.trim().replace(/\s+/g, ' ');
  };

  // EFFECT 1: Fetch recipe data
  useEffect(() => {
    fetchRecipe();
  }, [id]);

  // EFFECT 2: Restore checked ingredients
  useEffect(() => {
    if (
      location.state?.preservedCheckedIngredients &&
      Array.isArray(location.state.preservedCheckedIngredients)
    ) {
      setAvailableIngredients(location.state.preservedCheckedIngredients);
      
      navigate(location.pathname, {
        replace: true,
        state: {
          returnFilters: location.state.returnFilters || {},
          returnSearch: location.state.returnSearch || "",
        },
      });
    }

    if (
      location.state?.returnToRecipe &&
      location.state.returnToRecipe.id === id
    ) {
      setAvailableIngredients(
        location.state.returnToRecipe.checkedIngredients || []
      );

      navigate(location.pathname, {
        replace: true,
        state: {
          returnFilters: location.state.returnFilters || {},
          returnSearch: location.state.returnSearch || "",
        },
      });
    }
  }, [location.state, navigate, id]);

  // EFFECT 3: Save to recent searches
  useEffect(() => {
    const saveToRecentSearches = async () => {
      const token = localStorage.getItem("token");
      if (!token || !recipe) return;

      try {
        await axios.post(
          `${API}/api/user/recent-searches`,
          { recipeId: recipe._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Error saving to recent searches:", error);
      }
    };

    if (recipe) {
      saveToRecentSearches();
    }
  }, [recipe]);

  // EFFECT 4: Check favorite status
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

  // FUNCTION 1: Fetch recipe
  const fetchRecipe = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `http://localhost:5000/api/recipes/${id}`
      );
      setRecipe(response.data);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      setError("Failed to load recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // FUNCTION 2: Toggle ingredient checkbox
  const handleIngredientToggle = (ingredientName) => {
    const cleanedName = cleanIngredientName(ingredientName);
    setAvailableIngredients((prev) => {
      if (prev.includes(cleanedName)) {
        return prev.filter((item) => cleanIngredientName(item) !== cleanedName);
      } else {
        return [...prev, cleanedName];
      }
    });
  };

  // FUNCTION 3: Check all ingredients
  const selectAllIngredients = () => {
    if (!recipe || !recipe.ingredients) return;
    const allIngredientNames = recipe.ingredients.map(ing => 
      cleanIngredientName(ing.name)
    );
    setAvailableIngredients(allIngredientNames);
  };

  // FUNCTION 4: Clear all selections
  const clearAllSelections = () => {
    setAvailableIngredients([]);
  };

  // FUNCTION 5: Quick select common ingredients
  const quickSelectCommon = () => {
    if (!recipe || !recipe.ingredients) return;

    const commonIngredients = [
      "salt", "pepper", "oil", "water", "sugar", "flour", 
      "butter", "garlic", "onion", "eggs", "milk",
      "vinegar", "honey", "baking powder", "baking soda", "yeast", "vanilla"
    ];

    const recipeIngredientNames = recipe.ingredients.map(ing =>
      cleanIngredientName(ing.name).toLowerCase()
    );
    const commonMatches = recipeIngredientNames.filter(ingName =>
      commonIngredients.some(
        common => ingName.includes(common) || common.includes(ingName)
      )
    );

    const actualIngredientNames = recipe.ingredients
      .filter(ing => commonMatches.includes(cleanIngredientName(ing.name).toLowerCase()))
      .map(ing => cleanIngredientName(ing.name));

    setAvailableIngredients(actualIngredientNames);
  };

  // FUNCTION 6: Find recipes with available ingredients
  const findRecipesWithAvailableIngredients = async () => {
    if (availableIngredients.length === 0) {
      alert("Please select at least one ingredient you have");
      return;
    }

    try {
      const findButton = document.querySelector(".find-recipes-btn");
      const originalText = "Find Recipes with These Ingredients";

      if (findButton) {
        findButton.textContent = "Searching...";
        findButton.disabled = true;
        findButton.style.opacity = "0.7";
      }

      const cleanIngredients = availableIngredients
        .map(ingredient => cleanIngredientName(ingredient).split(",")[0].toLowerCase())
        .filter(ingredient => ingredient.length > 0);

      const queryString = cleanIngredients
        .map(ing => encodeURIComponent(ing))
        .join(",");

      const apiUrl = `http://localhost:5000/api/recipes/available?ingredients=${queryString}`;
      const response = await axios.get(apiUrl);

      if (findButton) {
        setTimeout(() => {
          findButton.textContent = originalText;
          findButton.disabled = false;
          findButton.style.opacity = "1";
        }, 300);
      }

      if (!response.data.recipes || response.data.recipes.length === 0) {
        alert("No recipes found containing your selected ingredients. Try selecting different ingredients.");
        return;
      }

      const filteredRecipes = response.data.recipes.filter(recipe => {
        if (!recipe.ingredients) return false;

        const recipeIngredientNames = recipe.ingredients.map(ing =>
          typeof ing === "string"
            ? ing.toLowerCase()
            : ing.name
            ? cleanIngredientName(ing.name).toLowerCase()
            : ""
        );

        const matchedCount = cleanIngredients.filter(userIngredient => {
          return recipeIngredientNames.some(recipeIngredient => {
            const userIng = cleanIngredientName(userIngredient);
            const recipeIng = cleanIngredientName(recipeIngredient);
            
            if (userIng === recipeIng) return true;
            if (recipeIng.includes(userIng) || userIng.includes(recipeIng))
              return true;

            return false;
          });
        }).length;

        return matchedCount > 0;
      });

      if (filteredRecipes.length === 0) {
        alert("Found recipes but none contain your exact ingredients.");
        return;
      }

      const sortedRecipes = [...filteredRecipes].sort((a, b) => {
        if (a.matchPercentage !== undefined && b.matchPercentage !== undefined) {
          return b.matchPercentage - a.matchPercentage;
        }
        return 0;
      });

      const completeMatches = sortedRecipes.filter(
        recipe => recipe.hasAllIngredients || recipe.matchPercentage === 100
      ).length;
      const partialMatches = sortedRecipes.length - completeMatches;

      navigate("/recipes", {
        state: {
          filteredRecipes: sortedRecipes,
          message:
            completeMatches > 0
              ? `Found ${completeMatches} recipes with ALL your ingredients and ${partialMatches} with some matches`
              : `Found ${sortedRecipes.length} recipes containing some of your ingredients`,
          userIngredients: availableIngredients,
          cleanedIngredients: cleanIngredients,
          matchInfo: true,
          completeMatches,
          partialMatches,
          isIngredientSearch: true,
          cameFromRecipeDetails: true,
          sourceRecipeId: id,
          sourceRecipeName: recipe.name,
          sourceCheckedIngredients: availableIngredients,
          returnToRecipe: {
            id: id,
            checkedIngredients: availableIngredients,
          },
          returnFilters: location.state?.returnFilters || {},
          returnSearch: location.state?.returnSearch || "",
        },
      });
    } catch (error) {
      console.error("Error finding recipes:", error);

      const findButton = document.querySelector(".find-recipes-btn");
      if (findButton) {
        findButton.textContent = "Find Recipes with These Ingredients";
        findButton.disabled = false;
        findButton.style.opacity = "1";
      }

      if (error.response?.status === 400) {
        alert(error.response.data.message || "Please check your ingredient selection.");
      } else if (error.response?.status === 500) {
        alert("Server error. Please try again later.");
      } else if (error.request) {
        alert("Network error. Please check your connection.");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  // FUNCTION 7: Go to missing ingredients
  const goToMissingIngredients = () => {
    if (!recipe) return;

    const missing = recipe.ingredients
      .filter(ing => !availableIngredients.includes(cleanIngredientName(ing.name)))
      .map(ing => cleanIngredientName(ing.name));

    if (missing.length === 0) {
      alert("You have all ingredients! No missing items to buy.");
      return;
    }

    navigate(`/missing-ingredients`, {
      state: {
        missingIngredients: missing,
        recipeName: recipe.name,
        recipeId: id,
        preservedCheckedIngredients: availableIngredients,
        returnFilters: location.state?.returnFilters || {},
        returnSearch: location.state?.returnSearch || "",
      },
    });
  };

  // FUNCTION 8: Toggle favorite
  const handleFavoriteToggle = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setFavoriteLoading(true);

    try {
      if (isFavorite) {
        const response = await axios.delete(
          `http://localhost:5000/api/user/favorites/${recipe._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setIsFavorite(false);
          alert("Removed from favorites!");
        }
      } else {
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

  // FUNCTION 9: Go back to recipes
  const goBackToRecipes = () => {
    if (location.state?.returnFilters || location.state?.returnSearch) {
      navigate("/recipes", {
        state: {
          returnFilters: location.state.returnFilters,
          returnSearch: location.state.returnSearch,
        },
      });
    } else {
      navigate("/recipes");
    }
  };

  // ===== RENDER STATES =====

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
        <button onClick={goBackToRecipes} className="btn btn-primary">
          <FaArrowLeft /> Back to Recipes
        </button>
      </div>
    );
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const selectedCount = availableIngredients.length;
  const totalIngredients = recipe.ingredients?.length || 0;
  const selectionPercentage =
    totalIngredients > 0
      ? Math.round((selectedCount / totalIngredients) * 100)
      : 0;

  return (
    <div className="recipe-details-page">
      {/* Recipe Header */}
      <div className="recipe-header">
        <img
          src={
            recipe.imageUrl ||
            recipe.image ||
            "https://via.placeholder.com/300x300?text=Recipe+Image"
          }
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
            {recipe.dietary &&
              Array.isArray(recipe.dietary) &&
              recipe.dietary.map((diet) => (
                <span key={diet} className="recipe-tag">
                  {diet}
                </span>
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
          <button onClick={selectAllIngredients} className="btn btn-success">
            <FaCheck />
            <span>Select All</span>
          </button>

          <button onClick={clearAllSelections} className="btn btn-danger">
            <FaTimes />
            <span>Clear All</span>
          </button>

          <button onClick={quickSelectCommon} className="btn btn-primary">
            <FaBolt />
            <span>Quick Select Common</span>
          </button>
        </div>

        {recipe.ingredients && recipe.ingredients.length > 0 ? (
          <>
            <div className="ingredients-box">
              {recipe.ingredients.map((ingredient, index) => {
                const ingredientName = cleanIngredientName(ingredient.name);
                const isSelected = availableIngredients.includes(ingredientName);

                return (
                  <div
                    key={index}
                    className={`ingredient-row ${isSelected ? "selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      id={`ingredient-${index}`}
                      checked={isSelected}
                      onChange={() => handleIngredientToggle(ingredient.name)}
                      className="ingredient-checkbox"
                    />
                    <label htmlFor={`ingredient-${index}`} className="ingredient-label">
                      <span className="ingredient-name">
                        {ingredientName}
                      </span>
                      {ingredient.quantity && (
                        <span className="ingredient-quantity">
                          - {ingredient.quantity} {ingredient.unit || ""}
                        </span>
                      )}
                    </label>
                  </div>
                );
              })}
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
                className={`favorite-btn btn ${isFavorite ? "btn-remove" : "btn-add"}`}
              >
                {favoriteLoading ? (
                  <>
                    <div className="favorite-spinner"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {isFavorite ? <FaHeart /> : <FaRegHeart />}
                    <span>
                      {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    </span>
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
                <div className="step-number">{index + 1}</div>
                <p className="step-text">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="details-footer">
        <button onClick={goBackToRecipes} className="btn btn-success">
          <FaArrowLeft /> Back to All Recipes
        </button>

        <button onClick={() => window.history.back()} className="btn btn-secondary">
          <FaArrowLeft /> Go Back
        </button>
      </div>
    </div>
  );
};

export default RecipeDetails;