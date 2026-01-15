import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaTrash,
  FaSearch,
  FaSave,
  FaEdit,
  FaTimes,
  FaSpinner,
  FaUtensils,
  FaClock,
  FaUsers,
  FaChartBar,
  FaListUl,
  FaBookOpen,
  FaImage,
  FaTag
} from "react-icons/fa";
import "./Admin.css";

const API = import.meta.env.VITE_API_BASE_URL;

const Admin = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("userRole");
      
      if (!token) {
        console.log("No token found, redirecting to login");
        navigate("/login");
        return;
      }
      
      if (userRole !== "admin") {
        console.log("User is not admin, redirecting to home");
        navigate("/");
        return;
      }
      
      setIsChecking(false);
    };
    
    checkAuth();
  }, [navigate]);

  // States for Create Recipe - SIMPLIFIED
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    category: "",
    prepTime: "",
    cookTime: "",
    servings: "",
    difficulty: "easy",
    dietary: [],
    imageUrl: "",
    ingredients: [{ name: "", quantity: "", unit: "" }],
    steps: [""]
  });

  const [recipeId, setRecipeId] = useState("");
  const [recipeData, setRecipeData] = useState(null);
  const [updateForm, setUpdateForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("create");
  const [message, setMessage] = useState({ type: "", text: "" });

  // Get token for API calls
  const token = localStorage.getItem("token");

  // =============== SIMPLIFIED FORM HANDLERS ===============
  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle dietary selection
  const handleDietaryChange = (diet) => {
    setCreateForm(prev => {
      const newDietary = prev.dietary.includes(diet)
        ? prev.dietary.filter(d => d !== diet)
        : [...prev.dietary, diet];
      return { ...prev, dietary: newDietary };
    });
  };

  // Clean ingredient inputs
  const cleanIngredient = (ing) => ({
    name: (ing.name || "").trim(),
    quantity: (ing.quantity || "").trim(),
    unit: (ing.unit || "").trim()
  });

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...createForm.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value.trim() };
    setCreateForm(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...createForm.steps];
    newSteps[index] = value.trim();
    setCreateForm(prev => ({ ...prev, steps: newSteps }));
  };

  const addIngredient = () => {
    setCreateForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", quantity: "", unit: "" }]
    }));
  };

  const removeIngredient = (index) => {
    const newIngredients = [...createForm.ingredients];
    newIngredients.splice(index, 1);
    setCreateForm(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addStep = () => {
    setCreateForm(prev => ({
      ...prev,
      steps: [...prev.steps, ""]
    }));
  };

  const removeStep = (index) => {
    const newSteps = [...createForm.steps];
    newSteps.splice(index, 1);
    setCreateForm(prev => ({ ...prev, steps: newSteps }));
  };

  // =============== CREATE RECIPE ===============
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Validate required fields
      if (!createForm.name.trim()) {
        throw new Error("Recipe name is required");
      }
      if (!createForm.category.trim()) {
        throw new Error("Category is required");
      }
      
      // Clean and validate ingredients
      const cleanedIngredients = createForm.ingredients
        .map(cleanIngredient)
        .filter(ing => ing.name.trim() !== "");

      if (cleanedIngredients.length === 0) {
        throw new Error("At least one ingredient is required");
      }

      // Clean and validate steps
      const cleanedSteps = createForm.steps
        .map(step => step.trim())
        .filter(step => step !== "");

      if (cleanedSteps.length === 0) {
        throw new Error("At least one cooking step is required");
      }

      // Prepare data for API
      const recipeData = {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        category: createForm.category.trim(),
        prepTime: parseInt(createForm.prepTime) || 0,
        cookTime: parseInt(createForm.cookTime) || 0,
        servings: parseInt(createForm.servings) || 1,
        difficulty: createForm.difficulty,
        dietary: createForm.dietary.filter(d => d.trim() !== ""),
        imageUrl: createForm.imageUrl.trim(),
        ingredients: cleanedIngredients,
        steps: cleanedSteps
      };

      console.log("Sending recipe data:", recipeData);

      const res = await fetch(`${API}/api/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(recipeData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Failed to create recipe: ${res.status}`);
      }

      setMessage({ 
        type: "success", 
        text: `Recipe created successfully! ID: ${data._id}` 
      });

      // Reset form
      setCreateForm({
        name: "",
        description: "",
        category: "",
        prepTime: "",
        cookTime: "",
        servings: "",
        difficulty: "easy",
        dietary: [],
        imageUrl: "",
        ingredients: [{ name: "", quantity: "", unit: "" }],
        steps: [""]
      });

    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // =============== SEARCH RECIPE ===============
  const handleSearch = async () => {
    if (!recipeId.trim()) {
      setMessage({ type: "error", text: "Please enter a Recipe ID" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });
    setRecipeData(null);
    setUpdateForm(null);

    try {
      const res = await fetch(`${API}/api/recipes/${recipeId}`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Recipe not found: ${res.status}`);
      }

      const data = await res.json();
      setRecipeData(data);
      setUpdateForm(data);
      setActiveSection("update");
      setMessage({ type: "success", text: "Recipe found successfully!" });

    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // =============== UPDATE RECIPE ===============
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateDietaryChange = (diet) => {
    setUpdateForm(prev => {
      const newDietary = prev.dietary.includes(diet)
        ? prev.dietary.filter(d => d !== diet)
        : [...prev.dietary, diet];
      return { ...prev, dietary: newDietary };
    });
  };

  const handleUpdateIngredientChange = (index, field, value) => {
    const newIngredients = [...updateForm.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value.trim() };
    setUpdateForm(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const handleUpdateStepChange = (index, value) => {
    const newSteps = [...updateForm.steps];
    newSteps[index] = value.trim();
    setUpdateForm(prev => ({ ...prev, steps: newSteps }));
  };

  const addUpdateIngredient = () => {
    setUpdateForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", quantity: "", unit: "" }]
    }));
  };

  const removeUpdateIngredient = (index) => {
    const newIngredients = [...updateForm.ingredients];
    newIngredients.splice(index, 1);
    setUpdateForm(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addUpdateStep = () => {
    setUpdateForm(prev => ({
      ...prev,
      steps: [...prev.steps, ""]
    }));
  };

  const removeUpdateStep = (index) => {
    const newSteps = [...updateForm.steps];
    newSteps.splice(index, 1);
    setUpdateForm(prev => ({ ...prev, steps: newSteps }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!recipeId || !updateForm) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Clean data before sending
      const cleanedData = {
        ...updateForm,
        name: updateForm.name?.trim() || "",
        description: updateForm.description?.trim() || "",
        category: updateForm.category?.trim() || "",
        ingredients: (updateForm.ingredients || []).map(cleanIngredient),
        steps: (updateForm.steps || []).map(step => step.trim()),
        dietary: (updateForm.dietary || []).filter(d => d.trim() !== "")
      };

      const res = await fetch(`${API}/api/recipes/${recipeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cleanedData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to update recipe: ${res.status}`);
      }

      const data = await res.json();
      setMessage({ type: "success", text: "Recipe updated successfully!" });
      setRecipeData(data);
      setUpdateForm(data);

    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // =============== DELETE RECIPE ===============
  const handleDelete = async () => {
    if (!recipeId || !window.confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API}/api/recipes/${recipeId}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to delete recipe: ${res.status}`);
      }

      await res.json();
      setMessage({ type: "success", text: "Recipe deleted successfully!" });
      setRecipeId("");
      setRecipeData(null);
      setUpdateForm(null);
      setActiveSection("create");

    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="admin-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Checking admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1><FaUtensils /> Recipe Admin Panel</h1>
        <p>Complete CRUD operations for recipe management</p>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeSection === "create" ? "active" : ""}`}
          onClick={() => setActiveSection("create")}
        >
          <FaPlus /> Create Recipe
        </button>
        <button 
          className={`tab-btn ${activeSection === "search" ? "active" : ""}`}
          onClick={() => setActiveSection("search")}
        >
          <FaSearch /> Search Recipe
        </button>
        {recipeData && (
          <button 
            className={`tab-btn ${activeSection === "update" ? "active" : ""}`}
            onClick={() => setActiveSection("update")}
          >
            <FaEdit /> Update/Delete Recipe
          </button>
        )}
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`admin-message ${message.type}`}>
          {message.type === "success" ? "✓" : "✗"} {message.text}
        </div>
      )}

      {/* CREATE RECIPE SECTION */}
      {activeSection === "create" && (
        <div className="admin-section">
          <h2><FaPlus /> Create New Recipe</h2>
          <form onSubmit={handleCreateSubmit} className="admin-form">
            
            <div className="form-grid">
              <div className="form-group">
                <label><FaTag /> Recipe Name *</label>
                <input
                  type="text"
                  name="name"
                  value={createForm.name}
                  onChange={handleCreateChange}
                  required
                  placeholder="e.g., Chicken Curry"
                />
              </div>

              <div className="form-group">
                <label><FaTag /> Category *</label>
                <input
                  type="text"
                  name="category"
                  value={createForm.category}
                  onChange={handleCreateChange}
                  required
                  placeholder="e.g., lunch, dinner, breakfast"
                />
              </div>

              <div className="form-group full-width">
                <label><FaBookOpen /> Description</label>
                <textarea
                  name="description"
                  value={createForm.description}
                  onChange={handleCreateChange}
                  placeholder="Brief description of the recipe"
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label><FaClock /> Prep Time (minutes)</label>
                <input
                  type="number"
                  name="prepTime"
                  value={createForm.prepTime}
                  onChange={handleCreateChange}
                  placeholder="20"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label><FaClock /> Cook Time (minutes)</label>
                <input
                  type="number"
                  name="cookTime"
                  value={createForm.cookTime}
                  onChange={handleCreateChange}
                  placeholder="30"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label><FaUsers /> Servings</label>
                <input
                  type="number"
                  name="servings"
                  value={createForm.servings}
                  onChange={handleCreateChange}
                  placeholder="4"
                  min="1"
                />
              </div>

              <div className="form-group">
                <label><FaChartBar /> Difficulty</label>
                <select
                  name="difficulty"
                  value={createForm.difficulty}
                  onChange={handleCreateChange}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label><FaImage /> Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={createForm.imageUrl}
                  onChange={handleCreateChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Dietary Options */}
              <div className="form-group full-width">
                <label>Dietary Restrictions</label>
                <div className="dietary-options">
                  {["vegetarian", "vegan", "gluten-free", "dairy-free", "nut-free"].map(diet => (
                    <label key={diet} className="dietary-checkbox">
                      <input
                        type="checkbox"
                        checked={createForm.dietary.includes(diet)}
                        onChange={() => handleDietaryChange(diet)}
                      />
                      <span>{diet}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Ingredients Section */}
            <div className="form-section">
              <h3><FaListUl /> Ingredients *</h3>
              <p className="section-note">Add at least one ingredient</p>
              {createForm.ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-row">
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                    required={index === 0}
                  />
                  <input
                    type="text"
                    placeholder="Quantity"
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(index, "quantity", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Unit (cups, tbsp, etc)"
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                  />
                  {createForm.ingredients.length > 1 && (
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={() => removeIngredient(index)}
                    >
                      <FaTimes /> Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addIngredient}>
                <FaPlus /> Add Ingredient
              </button>
            </div>

            {/* Steps Section */}
            <div className="form-section">
              <h3><FaBookOpen /> Cooking Steps *</h3>
              <p className="section-note">Add at least one step</p>
              {createForm.steps.map((step, index) => (
                <div key={index} className="step-row">
                  <textarea
                    placeholder={`Step ${index + 1}`}
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    rows="2"
                    required={index === 0}
                  />
                  {createForm.steps.length > 1 && (
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={() => removeStep(index)}
                    >
                      <FaTimes /> Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addStep}>
                <FaPlus /> Add Step
              </button>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <FaSpinner className="spin" /> : <FaSave />}
              {loading ? "Creating..." : "Create Recipe"}
            </button>
          </form>
        </div>
      )}

      {/* SEARCH RECIPE SECTION */}
      {activeSection === "search" && (
        <div className="admin-section">
          <h2><FaSearch /> Search Recipe by ID</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Enter Recipe ID"
              value={recipeId}
              onChange={(e) => setRecipeId(e.target.value)}
            />
            <button onClick={handleSearch} disabled={loading} className="search-btn">
              {loading ? <FaSpinner className="spin" /> : <FaSearch />}
              {loading ? "Searching..." : "Search Recipe"}
            </button>
          </div>

          {recipeData && (
            <div className="recipe-preview">
              <h3>Recipe Found</h3>
              <div className="preview-info">
                <p><strong>Name:</strong> {recipeData.name}</p>
                <p><strong>Category:</strong> {recipeData.category}</p>
                <p><strong>Difficulty:</strong> {recipeData.difficulty}</p>
                <p><strong>Total Time:</strong> {(recipeData.prepTime || 0) + (recipeData.cookTime || 0)} minutes</p>
              </div>
              <button 
                className="switch-btn"
                onClick={() => setActiveSection("update")}
              >
                <FaEdit /> Go to Update/Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* UPDATE/DELETE RECIPE SECTION */}
      {activeSection === "update" && updateForm && (
        <div className="admin-section">
          <div className="section-header">
            <h2><FaEdit /> Update/Delete Recipe</h2>
            <span className="recipe-id">ID: {recipeId}</span>
          </div>

          <form onSubmit={handleUpdateSubmit} className="admin-form">
            
            <div className="form-grid">
              <div className="form-group">
                <label><FaTag /> Recipe Name *</label>
                <input
                  type="text"
                  name="name"
                  value={updateForm.name || ""}
                  onChange={handleUpdateChange}
                  required
                />
              </div>

              <div className="form-group">
                <label><FaTag /> Category *</label>
                <input
                  type="text"
                  name="category"
                  value={updateForm.category || ""}
                  onChange={handleUpdateChange}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label><FaBookOpen /> Description</label>
                <textarea
                  name="description"
                  value={updateForm.description || ""}
                  onChange={handleUpdateChange}
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label><FaClock /> Prep Time (minutes)</label>
                <input
                  type="number"
                  name="prepTime"
                  value={updateForm.prepTime || ""}
                  onChange={handleUpdateChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label><FaClock /> Cook Time (minutes)</label>
                <input
                  type="number"
                  name="cookTime"
                  value={updateForm.cookTime || ""}
                  onChange={handleUpdateChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label><FaUsers /> Servings</label>
                <input
                  type="number"
                  name="servings"
                  value={updateForm.servings || ""}
                  onChange={handleUpdateChange}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label><FaChartBar /> Difficulty</label>
                <select
                  name="difficulty"
                  value={updateForm.difficulty || "easy"}
                  onChange={handleUpdateChange}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label><FaImage /> Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={updateForm.imageUrl || ""}
                  onChange={handleUpdateChange}
                />
              </div>

              {/* Dietary Options */}
              <div className="form-group full-width">
                <label>Dietary Restrictions</label>
                <div className="dietary-options">
                  {["vegetarian", "vegan", "gluten-free", "dairy-free", "nut-free"].map(diet => (
                    <label key={diet} className="dietary-checkbox">
                      <input
                        type="checkbox"
                        checked={updateForm.dietary?.includes(diet) || false}
                        onChange={() => handleUpdateDietaryChange(diet)}
                      />
                      <span>{diet}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Ingredients Section */}
            <div className="form-section">
              <h3><FaListUl /> Ingredients *</h3>
              {updateForm.ingredients?.map((ingredient, index) => (
                <div key={index} className="ingredient-row">
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={ingredient.name || ""}
                    onChange={(e) => handleUpdateIngredientChange(index, "name", e.target.value)}
                    required={index === 0}
                  />
                  <input
                    type="text"
                    placeholder="Quantity"
                    value={ingredient.quantity || ""}
                    onChange={(e) => handleUpdateIngredientChange(index, "quantity", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={ingredient.unit || ""}
                    onChange={(e) => handleUpdateIngredientChange(index, "unit", e.target.value)}
                  />
                  {updateForm.ingredients.length > 1 && (
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={() => removeUpdateIngredient(index)}
                    >
                      <FaTimes /> Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addUpdateIngredient}>
                <FaPlus /> Add Ingredient
              </button>
            </div>

            {/* Steps Section */}
            <div className="form-section">
              <h3><FaBookOpen /> Cooking Steps *</h3>
              {updateForm.steps?.map((step, index) => (
                <div key={index} className="step-row">
                  <textarea
                    placeholder={`Step ${index + 1}`}
                    value={step || ""}
                    onChange={(e) => handleUpdateStepChange(index, e.target.value)}
                    rows="2"
                    required={index === 0}
                  />
                  {updateForm.steps.length > 1 && (
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={() => removeUpdateStep(index)}
                    >
                      <FaTimes /> Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addUpdateStep}>
                <FaPlus /> Add Step
              </button>
            </div>

            <div className="action-buttons">
              <button type="submit" className="update-btn" disabled={loading}>
                {loading ? <FaSpinner className="spin" /> : <FaSave />}
                {loading ? "Updating..." : "Update Recipe"}
              </button>
              <button 
                type="button" 
                className="delete-btn"
                onClick={handleDelete}
                disabled={loading}
              >
                <FaTrash /> Delete Recipe
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Admin;