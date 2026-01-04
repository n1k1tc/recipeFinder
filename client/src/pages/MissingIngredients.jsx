import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./MissingIngredients.css";

const MissingIngredients = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ url: "", service: "", ingredient: "" });

  // Get data passed from RecipeDetails page
  const {
    missingIngredients = [],
    recipeName = "Recipe",
    recipeId = null,
  } = location.state || {};

  // Function to clean ingredient names (remove everything after first comma)
  const cleanIngredientName = (ingredient) => {
    // Remove everything after the first comma (including the comma)
    const cleaned = ingredient.split(',')[0].trim();
    return cleaned;
  };

  // Grocery service configuration
  const groceryServices = [
    {
      name: "Blinkit",
      icon: "🚚",
      color: "#FF6B35",
      description: "10-15 min delivery",
      url: (ingredient) =>
        `https://blinkit.com/s/?q=${encodeURIComponent(cleanIngredientName(ingredient))}`,
    },
    {
      name: "BigBasket",
      icon: "🧺",
      color: "#FF9F43",
      description: "90 min delivery",
      url: (ingredient) =>
        `https://www.bigbasket.com/ps/?q=${encodeURIComponent(cleanIngredientName(ingredient))}`,
    },
  ];

  // Handle grocery link click with confirmation modal
  const handleGroceryLinkClick = (e, service, ingredient, url) => {
    e.preventDefault();
    setModalData({
      url,
      service: service.name,
      ingredient: cleanIngredientName(ingredient),
    });
    setShowModal(true);
  };

  // Handle modal proceed (open external link)
  const handleProceed = () => {
    window.open(modalData.url, '_blank', 'noopener,noreferrer');
    setShowModal(false);
  };

  // Handle modal cancel
  const handleCancel = () => {
    setShowModal(false);
  };

  // Handle empty state (no missing ingredients)
  if (!missingIngredients || missingIngredients.length === 0) {
    return (
      <div className="missing-ingredients-container empty-state">
        <div className="empty-icon">🎉</div>
        <h1>You have all ingredients!</h1>
        <p className="empty-message">
          Great news! You already have all the ingredients for{" "}
          <strong>{recipeName}</strong>.
        </p>
        <div className="empty-actions">
          {recipeId ? (
            <button
              onClick={() => navigate(`/recipes/${recipeId}`)}
              className="btn btn-primary"
            >
              ← Back to Recipe Details
            </button>
          ) : (
            <button
              onClick={() => navigate("/recipes")}
              className="btn btn-primary"
            >
              ← Back to All Recipes
            </button>
          )}
          <button
            onClick={() => navigate("/recipes")}
            className="btn btn-secondary"
          >
            Browse More Recipes →
          </button>
        </div>
      </div>
    );
  }

  // Handle case where user refreshes page and loses state
  if (location.state === undefined) {
    return (
      <div className="missing-ingredients-container error-state">
        <div className="error-icon">⚠️</div>
        <h1>No Data Found</h1>
        <p className="error-message">
          No ingredient data found. Please select ingredients again from the
          recipe page.
        </p>
        <div className="error-actions">
          <button
            onClick={() => navigate("/recipes")}
            className="btn btn-primary"
          >
            Browse Recipes
          </button>
        </div>
      </div>
    );
  }

  // Copy shopping list to clipboard
  const copyShoppingList = () => {
    const list = missingIngredients.map(cleanIngredientName).join(", ");
    navigator.clipboard
      .writeText(list)
      .then(() => {
        const copyBtn = document.querySelector(".btn-copy");
        if (copyBtn) {
          const originalText = copyBtn.textContent;
          copyBtn.textContent = "✓ Copied!";
          copyBtn.classList.add("copied");
          setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.classList.remove("copied");
          }, 2000);
        }
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        alert("Could not copy to clipboard. Please try again.");
      });
  };

  return (
    <>
      {/* External Link Confirmation Modal - COMPACT VERSION */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content compact">
            <div className="modal-header">
              <div className="modal-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h3 className="modal-title">Leaving RecipeFinder</h3>
            </div>
            
            <div className="modal-body">
              <p className="modal-message">
                You will search for <strong>{modalData.ingredient}</strong> on <strong>{modalData.service}</strong>
              </p>
              
              <div className="modal-warning">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>This is an external website. RecipeFinder is not responsible for its content or services.</p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                onClick={handleCancel}
                className="btn btn-outline modal-btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleProceed}
                className="btn btn-primary modal-btn-proceed"
              >
                Proceed to {modalData.service}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="missing-ingredients-container">
        {/* Header Section */}
        <div className="page-header">
          <h1 className="page-title">Missing Ingredients</h1>
          <p className="page-subtitle">
            For recipe: <strong>{recipeName}</strong>
          </p>
         <div className="disclaimer">
  <span className="disclaimer-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  </span>
  <p>
    These links open external grocery services in new tabs. 
    <span className="disclaimer-note"> (Clicking will show a confirmation)</span>
  </p>
</div>
        </div>

        {/* Shopping List Summary */}
        <div className="shopping-summary">
          <div className="summary-header">
            <h2>Shopping List ({missingIngredients.length} items)</h2>
            <button
              onClick={copyShoppingList}
              className="btn btn-copy"
              title="Copy all ingredients to clipboard"
            >
              📋 Copy Shopping List
            </button>
          </div>

          <div className="ingredients-preview">
            <p className="ingredients-text">
              {missingIngredients.map(cleanIngredientName).join(", ")}
            </p>
          </div>
        </div>

        {/* Ingredients Grid */}
        <div className="ingredients-grid">
          {missingIngredients.map((ingredient, index) => {
            const cleanedIngredient = cleanIngredientName(ingredient);
            return (
              <div key={index} className="ingredient-card">
                <div className="ingredient-header">
                  <span className="ingredient-number">#{index + 1}</span>
                  <div>
                    <h3 className="ingredient-name">{cleanedIngredient}</h3>
                  </div>
                </div>

                <div className="grocery-links">
                  {groceryServices.map((service) => (
                    <button
                      key={`${ingredient}-${service.name}`}
                      onClick={(e) => handleGroceryLinkClick(e, service, ingredient, service.url(ingredient))}
                      className="grocery-link"
                      style={{ backgroundColor: service.color }}
                      title={`Search "${cleanedIngredient}" on ${service.name}`}
                    >
                      <div className="grocery-link-content">
                        <div className="grocery-info">
                          <span className="grocery-icon">{service.icon}</span>
                          <span className="grocery-name">{service.name}</span>
                        </div>
                        {service.description && (
                          <span className="grocery-description">
                            {service.description}
                          </span>
                        )}
                        <span className="external-icon">↗</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Actions */}
        <div className="page-actions">
          <div className="action-buttons">
            {recipeId ? (
              <button
                onClick={() => navigate(`/recipes/${recipeId}`)}
                className="btn btn-outline"
              >
                ← Back to Recipe Details
              </button>
            ) : (
              <button
                onClick={() => navigate("/recipes")}
                className="btn btn-outline"
              >
                ← Back to All Recipes
              </button>
            )}

            <button
              onClick={() => navigate("/recipes")}
              className="btn btn-primary"
            >
              Browse More Recipes →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MissingIngredients;