import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import SearchFilter from "../components/SearchFilter";
import { 
  Clock, 
  Users, 
  TrendingUp,
  ChefHat,
  ArrowLeft
} from "lucide-react";
import "./Recipes.css";

const API = import.meta.env.VITE_API_BASE_URL;

const Recipes = () => {
  // STATE VARIABLES
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [displayedRecipes, setDisplayedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  
  // ROUTER HOOKS
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // CONSTANTS
  const DEFAULT_DISPLAY_LIMIT = 30;
  
  // REFS - CRITICAL: Use refs for synchronous checks
  const isInitialMount = useRef(true);
  const cameFromNavigationRef = useRef(false); // Synchronous flag
  const processedNavigationRef = useRef(false); // Prevent double processing

  // ============================================
  // NEW: Go Back to Recipe Function
  // ============================================
  const handleGoBackToRecipe = () => {
    if (!location.state?.cameFromRecipeDetails) return;
    
    // Navigate back to the recipe with preserved state
    navigate(`/recipes/${location.state.sourceRecipeId}`, {
      state: {
        preservedCheckedIngredients: location.state.sourceCheckedIngredients,
        returnFilters: location.state.returnFilters || {},
        returnSearch: location.state.returnSearch || '',
        // Pass along any other needed state
        cameFromRecipes: true // Optional flag for RecipeDetails
      }
    });
  };

  // ============================================
  // HELPER FUNCTIONS (remain the same)
  // ============================================

  const updateURLWithFilters = useCallback(
    (filters) => {
      const newParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value) && value.length > 0) {
            value.forEach((v) => newParams.append(key, v));
          } else if (!Array.isArray(value)) {
            newParams.set(key, value);
          }
        }
      });

      setSearchParams(newParams, { replace: true });
    },
    [setSearchParams]
  );

  const parseFiltersFromURL = useCallback(() => {
    const params = {};

    for (const [key, value] of searchParams.entries()) {
      if (key === "dietary") {
        if (!params.dietary) params.dietary = [];
        params.dietary.push(value);
      } else {
        params[key] = value;
      }
    }

    return params;
  }, [searchParams]);

  const recipeMatchesSearch = useCallback((recipe, searchTerm) => {
    if (!searchTerm) return false;
    
    const searchLower = searchTerm.toLowerCase();
    
    if (recipe.name && typeof recipe.name === 'string' && 
        recipe.name.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    if (recipe.description && typeof recipe.description === 'string' && 
        recipe.description.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    if (recipe.ingredients) {
      if (typeof recipe.ingredients === 'string') {
        return recipe.ingredients.toLowerCase().includes(searchLower);
      }
      
      if (Array.isArray(recipe.ingredients)) {
        return recipe.ingredients.some(ingredient => {
          if (ingredient && ingredient.name && typeof ingredient.name === 'string' && 
              ingredient.name.toLowerCase().includes(searchLower)) {
            return true;
          }
          
          if (ingredient && typeof ingredient === 'string' && 
              ingredient.toLowerCase().includes(searchLower)) {
            return true;
          }
          
          return false;
        });
      }
    }
    
    return false;
  }, []);

  const updateDisplayedRecipes = useCallback(
    (allRecipes, searchTerm) => {
      if (searchTerm && searchTerm.trim() !== '') {
        const filtered = allRecipes.filter(recipe => 
          recipeMatchesSearch(recipe, searchTerm)
        );
        setFilteredRecipes(filtered);
        setDisplayedRecipes(filtered);
      } else {
        setFilteredRecipes(allRecipes);
        setDisplayedRecipes(allRecipes.slice(0, DEFAULT_DISPLAY_LIMIT));
      }
    },
    [DEFAULT_DISPLAY_LIMIT, recipeMatchesSearch]
  );

  // ============================================
  // DATA FETCHING - WITH REF CHECK
  // ============================================

  const fetchRecipes = useCallback(async (params = {}) => {
    // CRITICAL: Check ref FIRST (synchronous)
    if (cameFromNavigationRef.current) {
      console.log("⛔ fetchRecipes: Blocked - came from navigation");
      return;
    }
    
    try {
      setLoading(true);
      setError("");

      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              queryParams.append(key, value.join(","));
            }
          } else {
            queryParams.append(key, value);
          }
        }
      });

      if (!queryParams.has("limit")) {
        queryParams.append("limit", "100");
      }

      const url = `${API}/api/recipes?${queryParams.toString()}`;
      const response = await axios.get(url);

      let fetchedRecipes = [];
      if (response.data.recipes) {
        fetchedRecipes = response.data.recipes;
      } else if (Array.isArray(response.data)) {
        fetchedRecipes = response.data;
      }

      setRecipes(fetchedRecipes);
      
      const searchTerm = params.search || searchParams.get("search") || "";
      updateDisplayedRecipes(fetchedRecipes, searchTerm);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Failed to load recipes. Please try again.");
      setRecipes([]);
      setFilteredRecipes([]);
      setDisplayedRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams, updateDisplayedRecipes]);

  // ============================================
  // USE EFFECTS - FIXED WITH SYNCHRONOUS REFS
  // ============================================

  // EFFECT 1: Handle navigation state - RUNS FIRST
  useEffect(() => {
    console.log("🚨 EFFECT 1: Checking for navigation data");
    console.log("Location state:", location.state);
    
    // Prevent double processing
    if (processedNavigationRef.current) {
      console.log("⏭️ Already processed navigation");
      return;
    }
    
    // Check for filtered recipes from navigation
    if (location.state?.filteredRecipes && Array.isArray(location.state.filteredRecipes)) {
      console.log("🎯 NAVIGATION DETECTED!");
      console.log("Filtered recipes count:", location.state.filteredRecipes.length);
      console.log("Came from RecipeDetails:", location.state.cameFromRecipeDetails);
      
      // CRITICAL: Set refs synchronously
      processedNavigationRef.current = true;
      cameFromNavigationRef.current = true;
      
      // Update state with filtered recipes
      const filteredRecipesFromState = location.state.filteredRecipes;
      setRecipes(filteredRecipesFromState);
      setFilteredRecipes(filteredRecipesFromState);
      
      // Apply 30-limit
      const limitedRecipes = filteredRecipesFromState.slice(0, DEFAULT_DISPLAY_LIMIT);
      setDisplayedRecipes(limitedRecipes);
      
      // Stop loading immediately
      setLoading(false);
      
      // Update URL to reflect this is an ingredient search
      if (location.state.userIngredients?.length > 0) {
        const searchText = `ingredients: ${location.state.userIngredients.join(', ')}`;
        setSearchParams({ search: searchText }, { replace: true });
      }
      
      // Clear navigation state but keep return info and RecipeDetails info
      navigate(location.pathname, {
        replace: true,
        state: {
          cameFromRecipeDetails: location.state.cameFromRecipeDetails || false,
          sourceRecipeId: location.state.sourceRecipeId,
          sourceRecipeName: location.state.sourceRecipeName,
          sourceCheckedIngredients: location.state.sourceCheckedIngredients,
          returnFilters: location.state.returnFilters || {},
          returnSearch: location.state.returnSearch || '',
        }
      });
      
      console.log("✅ Navigation processed. cameFromNavigationRef = true");
      console.log("Displaying", limitedRecipes.length, "recipes");
      
      // CRITICAL: Return here to prevent other effects from running
      return;
    }
    
    console.log("ℹ️ No navigation data");
  }, [location.state, navigate, DEFAULT_DISPLAY_LIMIT, setSearchParams]);

  // EFFECT 2: Handle URL parameter changes - CHECK REF SYNCHRONOUSLY
  useEffect(() => {
    // Skip initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // CRITICAL: Check ref synchronously
    if (cameFromNavigationRef.current) {
      console.log("⛔ EFFECT 2: Blocked - came from navigation (ref check)");
      return;
    }
    
    console.log("🔄 EFFECT 2: URL changed, fetching...");
    const filters = parseFiltersFromURL();
    fetchRecipes(filters);
  }, [searchParams, parseFiltersFromURL, fetchRecipes]);

  // EFFECT 3: Initial load - CHECK REF SYNCHRONOUSLY
  useEffect(() => {
    console.log("🚀 EFFECT 3: Initial load check");
    
    // CRITICAL: Check ref synchronously
    if (cameFromNavigationRef.current) {
      console.log("⛔ EFFECT 3: Blocked - came from navigation (ref check)");
      setLoading(false);
      return;
    }
    
    // Don't fetch if we already have navigation data
    if (location.state?.filteredRecipes && !processedNavigationRef.current) {
      console.log("⏭️ EFFECT 3: Skipping - navigation data present");
      setLoading(false);
      return;
    }
    
    const initialFetch = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const response = await axios.get(
          "http://localhost:5000/api/recipes?limit=100"
        );
        const allRecipes = response.data.recipes || response.data || [];
        
        const uniqueCategories = [
          ...new Set(allRecipes.map((r) => r.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
        
        const filters = parseFiltersFromURL();
        await fetchRecipes(filters);
      } catch (err) {
        console.error("Initial fetch error:", err);
        setError("Failed to load recipes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initialFetch();
  }, [location.state, parseFiltersFromURL, fetchRecipes]);

  // ============================================
  // EVENT HANDLERS - Reset refs when user interacts
  // ============================================

  const handleClearAllFilters = useCallback(() => {
    console.log("🧹 Clearing all filters - resetting navigation refs");
    // Reset the refs when user explicitly interacts
    cameFromNavigationRef.current = false;
    processedNavigationRef.current = false;
    setSearchParams({}, { replace: true });
    fetchRecipes({});
  }, [setSearchParams, fetchRecipes]);

  const handleSearch = useCallback(
    async (searchTerm) => {
      console.log("🔍 User searching - resetting navigation refs");
      // Reset the refs when user explicitly interacts
      cameFromNavigationRef.current = false;
      processedNavigationRef.current = false;
      
      const currentFilters = parseFiltersFromURL();
      const updatedFilters = {
        ...currentFilters,
        search: searchTerm || undefined,
      };

      if (!searchTerm) {
        delete updatedFilters.search;
      }

      updateURLWithFilters(updatedFilters);
      
      if (searchTerm && searchTerm.trim() !== '') {
        const filtered = recipes.filter(recipe => 
          recipeMatchesSearch(recipe, searchTerm)
        );
        setFilteredRecipes(filtered);
        setDisplayedRecipes(filtered);
      } else {
        setFilteredRecipes(recipes);
        setDisplayedRecipes(recipes.slice(0, DEFAULT_DISPLAY_LIMIT));
      }
      
      fetchRecipes(updatedFilters);
    },
    [parseFiltersFromURL, updateURLWithFilters, fetchRecipes, recipes, DEFAULT_DISPLAY_LIMIT, recipeMatchesSearch]
  );

  const handleFilterChange = useCallback(
    (filters) => {
      console.log("🎛️ User filtering - resetting navigation refs");
      // Reset the refs when user explicitly interacts
      cameFromNavigationRef.current = false;
      processedNavigationRef.current = false;
      
      updateURLWithFilters(filters);
      
      const searchTerm = filters.search || "";
      
      if (searchTerm && searchTerm.trim() !== '') {
        const filtered = recipes.filter(recipe => 
          recipeMatchesSearch(recipe, searchTerm)
        );
        setFilteredRecipes(filtered);
        setDisplayedRecipes(filtered);
      } else {
        setFilteredRecipes(recipes);
        setDisplayedRecipes(recipes.slice(0, DEFAULT_DISPLAY_LIMIT));
      }
      
      fetchRecipes(filters);
    },
    [updateURLWithFilters, fetchRecipes, recipes, DEFAULT_DISPLAY_LIMIT, recipeMatchesSearch]
  );

  const handleRetry = () => {
    cameFromNavigationRef.current = false;
    processedNavigationRef.current = false;
    const filters = parseFiltersFromURL();
    fetchRecipes(filters);
  };

  const getInitialFilters = () => {
    return parseFiltersFromURL();
  };

  const getInitialSearchTerm = () => {
    return searchParams.get("search") || "";
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty || typeof difficulty !== 'string') return '#6B7280';
    
    switch(difficulty.toLowerCase()) {
      case 'easy':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'hard':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading recipes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3 className="error-title">Error</h3>
        <p className="error-message">{error}</p>
        <button onClick={handleRetry} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="recipes-page">
      <div className="recipes-header">
        <h1 className="page-title">Browse Recipes</h1>
        <p className="page-subtitle">Discover delicious recipes to cook today</p>
      </div>

      {/* NEW: Go Back to Recipe Button */}
      {location.state?.cameFromRecipeDetails && location.state.sourceRecipeName && (
        <div className="recipe-back-button-container">
          <button 
            onClick={handleGoBackToRecipe}
            className="btn btn-recipe-back"
          >
            <ArrowLeft size={16} />
            Back to Recipe: {location.state.sourceRecipeName}
          </button>
        </div>
      )}

      <SearchFilter
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        categories={categories}
        initialFilters={getInitialFilters()}
        initialSearchQuery={getInitialSearchTerm()}
      />

      {displayedRecipes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <ChefHat size={64} />
          </div>
          <h3 className="empty-title">No recipes found</h3>
          <p className="empty-message">Try adjusting your search or filters</p>
          <button onClick={handleClearAllFilters} className="clear-btn">
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="results-header">
            <div className="results-count">
              <span className="count">{filteredRecipes.length}</span>
              <span className="label">recipes found</span>
            </div>
            
            {/* NEW: Show match info if available */}
            {location.state?.matchInfo && (
              <div className="match-info-badge">
                <span className="complete-matches">
                  {location.state.completeMatches} exact matches
                </span>
                {location.state.partialMatches > 0 && (
                  <span className="partial-matches">
                    • {location.state.partialMatches} partial matches
                  </span>
                )}
              </div>
            )}
            
            {!searchParams.get("search") && 
             filteredRecipes.length > DEFAULT_DISPLAY_LIMIT && 
             displayedRecipes.length < filteredRecipes.length && (
              <button 
                onClick={() => setDisplayedRecipes(filteredRecipes)} 
                className="show-all-btn"
              >
                Show All {filteredRecipes.length} Recipes
              </button>
            )}
            
            <button onClick={handleClearAllFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>

          <div className="recipes-grid">
            {displayedRecipes.map((recipe) => {
              const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
              const servings = recipe.servings || 2;
              const difficulty = recipe.difficulty || '';

              return (
                <div
                  key={recipe._id || recipe.id}
                  className="recipe-card"
                  onClick={() => {
                    const currentFilters = parseFiltersFromURL();
                    const currentSearch = searchParams.get("search") || "";
                    
                    navigate(`/recipes/${recipe._id || recipe.id}`, {
                      state: {
                        returnFilters: currentFilters,
                        returnSearch: currentSearch,
                      },
                    });
                  }}
                >
                  <div className="card-image-container">
                    <img
                      src={
                        recipe.imageUrl ||
                        recipe.image ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"
                      }
                      alt={recipe.name}
                      className="card-image"
                    />
                    {recipe.category && (
                      <span className="category-tag">{recipe.category}</span>
                    )}
                    <div className="time-badge">
                      <Clock size={12} />
                      <span>{totalTime} min</span>
                    </div>
                  </div>

                  <div className="card-content">
                    <div className="card-header">
                      <h3 className="card-title">{recipe.name}</h3>
                      {difficulty && (
                        <span 
                          className="difficulty-badge"
                          style={{ 
                            backgroundColor: `${getDifficultyColor(difficulty)}15`,
                            color: getDifficultyColor(difficulty),
                            borderColor: `${getDifficultyColor(difficulty)}30`
                          }}
                        >
                          <TrendingUp size={12} />
                          {difficulty}
                        </span>
                      )}
                    </div>

                    <div className="meta-info">
                      <div className="meta-item">
                        <Users size={14} className="meta-icon" />
                        <span className="meta-text">{servings} {servings === 1 ? 'serving' : 'servings'}</span>
                      </div>
                      {recipe.cuisine && (
                        <div className="meta-item">
                          <div className="cuisine-dot"></div>
                          <span className="meta-text">{recipe.cuisine}</span>
                        </div>
                      )}
                    </div>

                    {recipe.description && (
                      <p className="card-description">
                        {recipe.description.length > 90
                          ? `${recipe.description.substring(0, 90)}...`
                          : recipe.description}
                      </p>
                    )}

                    <div className="card-actions">
                      <button className="btn btn-primary btn-full">
                        View Recipe →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Recipes;