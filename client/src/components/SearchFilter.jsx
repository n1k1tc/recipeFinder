import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Check,
  Clock,
  Users,
  ChefHat,
  Zap,
  AlertCircle,
  Tag,
  Flame
} from "lucide-react";
import "./SearchFilter.css";

const SearchFilter = ({ 
  onSearch, 
  onFilterChange,
  initialFilters = {},
  categories = [],
  initialSearchQuery = ""
}) => {
  // Safely initialize state with defaults
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || "");
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Initialize filters with proper defaults
  const safeInitialFilters = {
    category: initialFilters?.category || "",
    maxPrepTime: initialFilters?.maxPrepTime || "",
    maxCookTime: initialFilters?.maxCookTime || "",
    maxTotalTime: initialFilters?.maxTotalTime || "",
    difficulty: initialFilters?.difficulty || "",
    dietary: Array.isArray(initialFilters?.dietary) ? initialFilters.dietary : [],
    servings: initialFilters?.servings || ""
  };
  
  const [localFilters, setLocalFilters] = useState(safeInitialFilters);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [activeFilters, setActiveFilters] = useState(safeInitialFilters);
  const [isTypingInSearch, setIsTypingInSearch] = useState(false);

  // Initialize from props
  useEffect(() => {
    if (initialFilters) {
      const safeFilters = {
        category: initialFilters.category || "",
        maxPrepTime: initialFilters.maxPrepTime || "",
        maxCookTime: initialFilters.maxCookTime || "",
        maxTotalTime: initialFilters.maxTotalTime || "",
        difficulty: initialFilters.difficulty || "",
        dietary: Array.isArray(initialFilters.dietary) ? initialFilters.dietary : [],
        servings: initialFilters.servings || ""
      };
      
      setLocalFilters(safeFilters);
      setActiveFilters(safeFilters);
    }
  }, [initialFilters]);

  // Initialize search query from props
  useEffect(() => {
    setSearchQuery(initialSearchQuery || "");
  }, [initialSearchQuery]);

  // ========== SEARCH HANDLERS ==========
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsTypingInSearch(true);
    
    // Only show pending changes if filters are expanded and we're changing filter inputs
    // NOT when typing in search bar
    if (isFiltersExpanded) {
      setHasPendingChanges(true);
    }
  };

  const handleSearchClick = () => {
    if (onSearch) {
      setIsSearching(true);
      onSearch(searchQuery);
      setHasPendingChanges(false);
      setIsTypingInSearch(false);
      
      // Reset searching state after a delay
      setTimeout(() => setIsSearching(false), 500);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) {
      setIsSearching(true);
      onSearch(searchQuery);
      setHasPendingChanges(false);
      setIsTypingInSearch(false);
      e.preventDefault();
      
      // Reset searching state after a delay
      setTimeout(() => setIsSearching(false), 500);
    }
  };

  // ========== FILTER HANDLERS ==========
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let newFilters = { ...localFilters };
    
    if (type === "checkbox") {
      if (name === "dietary") {
        const currentDietary = Array.isArray(newFilters.dietary) ? newFilters.dietary : [];
        newFilters.dietary = checked 
          ? [...currentDietary, value]
          : currentDietary.filter(item => item !== value);
      }
    } else {
      newFilters[name] = value;
    }
    
    setLocalFilters(newFilters);
    
    // Only show pending changes when filters are expanded
    if (isFiltersExpanded) {
      setHasPendingChanges(true);
    }
  };

  // Apply all filters at once
  const applyAllFilters = () => {
    if (onFilterChange) {
      onFilterChange(localFilters);
      setActiveFilters(localFilters);
      setHasPendingChanges(false);
    }
  };

  // ========== CLEAR & RESET ==========
  const clearAll = () => {
    const clearedFilters = {
      category: "",
      maxPrepTime: "",
      maxCookTime: "",
      maxTotalTime: "",
      difficulty: "",
      dietary: [],
      servings: ""
    };
    
    setLocalFilters(clearedFilters);
    setSearchQuery("");
    
    // IMPORTANT: Apply changes immediately when clearing all
    if (onFilterChange) onFilterChange(clearedFilters);
    if (onSearch) onSearch("");
    setActiveFilters(clearedFilters);
    setHasPendingChanges(false);
  };

  // Clear only applied filters (keep search query)
  const clearAppliedFilters = () => {
    const clearedFilters = {
      category: "",
      maxPrepTime: "",
      maxCookTime: "",
      maxTotalTime: "",
      difficulty: "",
      dietary: [],
      servings: ""
    };
    
    // IMPORTANT: Reset local filters to cleared state
    setLocalFilters(clearedFilters);
    setActiveFilters(clearedFilters);
    setHasPendingChanges(false);
    
    // CRITICAL: Immediately call onFilterChange with cleared filters
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  const cancelPendingChanges = () => {
    setLocalFilters(activeFilters);
    setHasPendingChanges(false);
  };

  // ========== FILTER REMOVAL ==========
  const removeActiveFilter = (filterName, value = "") => {
    let newFilters = { ...activeFilters };
    
    if (filterName === "dietary") {
      const currentDietary = Array.isArray(newFilters.dietary) ? newFilters.dietary : [];
      newFilters.dietary = currentDietary.filter(item => item !== value);
    } else {
      newFilters[filterName] = "";
    }
    
    // Update both local and active filters
    setLocalFilters(newFilters);
    setActiveFilters(newFilters);
    setHasPendingChanges(false);
    
    // CRITICAL: Immediately apply the updated filters
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Handle filter expansion
  const handleFilterToggle = () => {
    const newState = !isFiltersExpanded;
    setIsFiltersExpanded(newState);
    
    // Reset pending changes when collapsing filters
    if (!newState) {
      setHasPendingChanges(false);
    }
  };

  // Dietary options with icons
  const dietaryOptions = [
    { value: "vegetarian", label: "Vegetarian", icon: "🥬" },
    { value: "vegan", label: "Vegan", icon: "🌱" },
    { value: "gluten-free", label: "Gluten-Free", icon: "🌾" },
    { value: "dairy-free", label: "Dairy-Free", icon: "🥛" }
  ];

  // Difficulty options
  const difficultyOptions = [
    { value: "easy", label: "Easy", color: "#10B981" },
    { value: "medium", label: "Medium", color: "#F59E0B" },
    { value: "hard", label: "Hard", color: "#EF4444" }
  ];

  // Safely check if dietary includes a value
  const isDietaryChecked = (value) => {
    const dietaryArray = Array.isArray(localFilters.dietary) ? localFilters.dietary : [];
    return dietaryArray.includes(value);
  };

  const isDietaryApplied = (value) => {
    const dietaryArray = Array.isArray(activeFilters.dietary) ? activeFilters.dietary : [];
    return dietaryArray.includes(value);
  };

  // Count active filters
  const activeFiltersCount = Object.values(activeFilters).reduce((count, value) => {
    if (Array.isArray(value)) {
      return count + value.length;
    }
    return count + (value ? 1 : 0);
  }, 0);

  // Show pending changes banner only when filters are expanded AND there are pending changes
  // NOT when just typing in search bar
  const showPendingChanges = hasPendingChanges && isFiltersExpanded && !isTypingInSearch;

  return (
    <div className="search-filter-container">
      {/* Pending Changes Banner - Only shown for filter changes, not search typing */}
      {showPendingChanges && (
        <div className="pending-changes-banner">
          <AlertCircle size={16} />
          <span className="pending-text">Unsaved filter changes</span>
          <div className="pending-actions">
            <button 
              onClick={applyAllFilters}
              className="btn btn-apply-small"
            >
              Apply
            </button>
            <button 
              onClick={cancelPendingChanges}
              className="btn btn-cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ===== MAIN SEARCH BAR ===== */}
      <div className="search-section">
        <div className="search-bar">
          <div className="search-input-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search recipes, ingredients, or categories..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="clear-search-btn"
                onClick={() => {
                  setSearchQuery("");
                  if (onSearch) onSearch("");
                }}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
            <button 
              onClick={handleSearchClick}
              className="search-action-btn"
              disabled={isSearching}
            >
              <Search size={18} />
              <span>Search</span>
            </button>
          </div>
          
          {/* Quick Filter Toggle */}
          <button 
            className={`filter-toggle-btn ${isFiltersExpanded ? 'active' : ''}`}
            onClick={handleFilterToggle}
          >
            <Filter size={18} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="filter-count-badge">{activeFiltersCount}</span>
            )}
            {isFiltersExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* ===== COLLAPSIBLE FILTERS SECTION ===== */}
      <div className={`filters-section ${isFiltersExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="filters-header">
          <div className="filters-title">
            <Filter size={20} />
            <h3>Filter Recipes</h3>
          </div>
          <div className="filter-actions">
            {/* REMOVED: "Clear All" button from header - only kept Apply Filters button */}
            <button 
              onClick={applyAllFilters}
              className="btn btn-apply"
              disabled={!hasPendingChanges}
            >
              <Check size={16} />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Filters Grid - Two Columns */}
        <div className="filters-grid">
          {/* Category Filter */}
          <div className="filter-group">
            <label className="filter-label">
              <Tag size={16} />
              Category
            </label>
            <select
              name="category"
              value={localFilters.category || ""}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {Array.isArray(categories) && categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="filter-group">
            <label className="filter-label">
              <Flame size={16} />
              Difficulty
            </label>
            <div className="difficulty-buttons">
              {difficultyOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`difficulty-btn ${localFilters.difficulty === opt.value ? 'active' : ''}`}
                  onClick={() => {
                    const newFilters = { ...localFilters, difficulty: localFilters.difficulty === opt.value ? "" : opt.value };
                    setLocalFilters(newFilters);
                    setHasPendingChanges(true);
                  }}
                  style={localFilters.difficulty === opt.value ? { 
                    backgroundColor: `${opt.color}15`, 
                    borderColor: opt.color,
                    color: opt.color 
                  } : {}}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Filters */}
          <div className="filter-group">
            <label className="filter-label">
              <Clock size={16} />
              Max Prep Time
            </label>
            <div className="time-input-group">
              <input
                type="number"
                name="maxPrepTime"
                placeholder="Minutes"
                value={localFilters.maxPrepTime || ""}
                onChange={handleFilterChange}
                min="0"
                step="5"
                className="filter-input"
              />
              <span className="input-suffix">min</span>
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">
              <Clock size={16} />
              Max Cook Time
            </label>
            <div className="time-input-group">
              <input
                type="number"
                name="maxCookTime"
                placeholder="Minutes"
                value={localFilters.maxCookTime || ""}
                onChange={handleFilterChange}
                min="0"
                step="5"
                className="filter-input"
              />
              <span className="input-suffix">min</span>
            </div>
          </div>

          {/* Total Time Filter */}
          <div className="filter-group">
            <label className="filter-label">
              <Clock size={16} />
              Max Total Time
            </label>
            <div className="time-input-group">
              <input
                type="number"
                name="maxTotalTime"
                placeholder="Minutes"
                value={localFilters.maxTotalTime || ""}
                onChange={handleFilterChange}
                min="0"
                step="5"
                className="filter-input"
              />
              <span className="input-suffix">min</span>
            </div>
          </div>

          {/* Servings Filter */}
          <div className="filter-group">
            <label className="filter-label">
              <Users size={16} />
              Servings
            </label>
            <div className="servings-input-group">
              <input
                type="number"
                name="servings"
                placeholder="Number of people"
                value={localFilters.servings || ""}
                onChange={handleFilterChange}
                min="1"
                className="filter-input"
              />
              <span className="input-suffix">people</span>
            </div>
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="dietary-section">
          <label className="section-label">
            <ChefHat size={16} />
            Dietary Preferences
          </label>
          <div className="dietary-pills">
            {dietaryOptions.map(opt => (
              <label key={opt.value} className="dietary-pill">
                <input
                  type="checkbox"
                  name="dietary"
                  value={opt.value}
                  checked={isDietaryChecked(opt.value)}
                  onChange={handleFilterChange}
                  className="dietary-checkbox"
                />
                <span className="pill-content">
                  <span className="pill-icon">{opt.icon}</span>
                  <span className="pill-text">{opt.label}</span>
                  {isDietaryApplied(opt.value) && (
                    <Check className="applied-check" size={12} />
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Active Filters Display - Minimal */}
        {activeFiltersCount > 0 && (
          <div className="active-filters-section">
            <div className="active-filters-header">
              <span className="active-filters-title">
                Active Filters ({activeFiltersCount})
              </span>
              <button 
                onClick={clearAppliedFilters}
                className="clear-applied-btn"
              >
                Clear All
              </button>
            </div>
            <div className="active-filters-pills">
              {activeFilters.category && (
                <span className="active-filter-pill">
                  <Tag size={12} />
                  <span className="pill-label">Category:</span>
                  <span className="pill-value">{activeFilters.category}</span>
                  <button 
                    onClick={() => removeActiveFilter("category")}
                    className="pill-remove"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {activeFilters.difficulty && (
                <span className="active-filter-pill">
                  <Flame size={12} />
                  <span className="pill-label">Difficulty:</span>
                  <span className="pill-value">{activeFilters.difficulty}</span>
                  <button 
                    onClick={() => removeActiveFilter("difficulty")}
                    className="pill-remove"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {Array.isArray(activeFilters.dietary) && activeFilters.dietary.map(diet => (
                <span key={diet} className="active-filter-pill">
                  <ChefHat size={12} />
                  <span className="pill-value">{diet}</span>
                  <button 
                    onClick={() => removeActiveFilter("dietary", diet)}
                    className="pill-remove"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {activeFilters.maxPrepTime && (
                <span className="active-filter-pill">
                  <Clock size={12} />
                  <span className="pill-label">Prep ≤</span>
                  <span className="pill-value">{activeFilters.maxPrepTime}m</span>
                  <button 
                    onClick={() => removeActiveFilter("maxPrepTime")}
                    className="pill-remove"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {activeFilters.maxCookTime && (
                <span className="active-filter-pill">
                  <Clock size={12} />
                  <span className="pill-label">Cook ≤</span>
                  <span className="pill-value">{activeFilters.maxCookTime}m</span>
                  <button 
                    onClick={() => removeActiveFilter("maxCookTime")}
                    className="pill-remove"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {activeFilters.maxTotalTime && (
                <span className="active-filter-pill">
                  <Clock size={12} />
                  <span className="pill-label">Total ≤</span>
                  <span className="pill-value">{activeFilters.maxTotalTime}m</span>
                  <button 
                    onClick={() => removeActiveFilter("maxTotalTime")}
                    className="pill-remove"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {activeFilters.servings && (
                <span className="active-filter-pill">
                  <Users size={12} />
                  <span className="pill-label">Serves:</span>
                  <span className="pill-value">{activeFilters.servings}</span>
                  <button 
                    onClick={() => removeActiveFilter("servings")}
                    className="pill-remove"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Indicator - Minimal */}
      {(searchQuery || hasPendingChanges) && (
        <div className="status-indicator">
          {searchQuery && (
            <div className="status-item">
              <Search size={14} />
              <span>Searching for: <strong>{searchQuery}</strong></span>
            </div>
          )}
          {hasPendingChanges && isFiltersExpanded && (
            <div className="status-item pending">
              <Zap size={14} />
              <span>Filters ready to apply</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;