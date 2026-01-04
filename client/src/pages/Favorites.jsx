import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  FaHeart, 
  FaRegHeart, 
  FaSearch, 
  FaTrash, 
  FaTimes,
  FaArrowRight,
  FaBookOpen,
  FaClock,
  FaUsers,
  FaSyncAlt
} from "react-icons/fa";
import "./Favorites.css";

const API = import.meta.env.VITE_API_BASE_URL;

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [removingIds, setRemovingIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/api/user/favorites`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setFavorites(res.data.favorites || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (recipeId, e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setRemovingIds(prev => [...prev, recipeId]);
    setFavorites(prev => prev.filter(f => f.recipeId?._id !== recipeId));

    try {
      await axios.delete(
        `http://localhost:5000/api/user/favorites/${recipeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      fetchFavorites();
    }
  };

  const clearAllFavorites = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    if (!window.confirm("Remove all favorite recipes?")) return;

    setFavorites([]);

    try {
      await axios.delete(
        "http://localhost:5000/api/user/favorites",
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      fetchFavorites();
    }
  };

  const formatTime = (ts) => {
    if (!ts) return "Recently";
    const diff = Math.floor((Date.now() - new Date(ts)) / 36e5);
    if (diff < 1) return "Just now";
    if (diff < 24) return `${diff}h ago`;
    return `${Math.floor(diff / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="favorites-loading">
        <div className="loading-spinner" />
        <p>Loading favorites…</p>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      {/* HEADER */}
      <div className="favorites-header">
        <div>
          <h1 className="favorites-title">
            <FaHeart className="heart-icon" />Your Favorites
          </h1>
          <p className="favorites-subtitle">
            Recipes you've saved for later.
          </p>
        </div>

        <div className="favorites-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/recipes")}
          >
            <FaSearch /> Browse Recipes
          </button>

          {favorites.length > 0 && (
            <button
              className="btn btn-danger"
              onClick={clearAllFavorites}
            >
              <FaTrash /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* EMPTY STATE */}
      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <div className="empty-heart">
            <FaRegHeart />
          </div>
          <h3>No favorites yet</h3>
          <p>Save recipes you love to find them here.</p>

          <button
            className="btn btn-primary empty-cta"
            onClick={() => navigate("/recipes")}
          >
            <FaArrowRight /> Browse Recipes
          </button>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(fav => {
            const recipe = fav.recipeId;
            if (!recipe) return null;

            const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
            const servings = recipe.servings || 2;

            return (
              <div
                key={recipe._id}
                className={`favorite-card ${
                  removingIds.includes(recipe._id) ? "removing" : ""
                }`}
                onClick={() => navigate(`/recipes/${recipe._id}`)}
              >
                {/* Keep the remove button unchanged */}
                <button
                  className="remove-favorite-btn"
                  onClick={(e) => removeFromFavorites(recipe._id, e)}
                >
                  <FaTimes />
                </button>

                <img
                  src={recipe.imageUrl}
                  alt={recipe.name}
                  className="favorite-image"
                />

                <div className="favorite-card-body">
                  <h3>{recipe.name}</h3>
                  {/* Add meta info like Recent Searches */}
                  <div className="meta">
                    <FaClock /> {totalTime} min • <FaUsers /> {servings} servings
                  </div>
                  <div className="favorite-card-footer">
                    <span>Saved {formatTime(fav.addedAt)}</span>
                    <button className="btn btn-link">
                      View <FaArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER */}
      <div className="favorites-footer">
        <p>
          <FaSyncAlt /> Your favorite recipes are saved securely to your account.
        </p>

        <div className="footer-actions">
          <button
            onClick={() => navigate("/recipes")}
            className="footer-link"
          >
            <FaBookOpen /> Browse More Recipes
          </button>
        </div>

        <p className="footer-note">
          Available on all your devices.
        </p>
      </div>
    </div>
  );
};

export default Favorites;