import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  FaClock, 
  FaHistory, 
  FaHeart, 
  FaSignOutAlt, 
  FaSearch,
  FaListAlt,
  FaChartBar,
  FaTrash,
  FaEye,
  FaUtensils,
  FaUsers,
  FaBookOpen,
  FaArrowRight,
  FaSyncAlt
} from "react-icons/fa";
import "./RecentSearches.css";

const API = import.meta.env.VITE_API_BASE_URL;

const RecentSearches = () => {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchRecentSearches(token);
  }, [navigate]);

  const fetchRecentSearches = async (token) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/api/user/recent-searches`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setSearches(res.data.recentSearches || []);
      }
    } catch {
      setError("Failed to load recent searches");
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = (item) => {
    const recipe = item.recipeId || item;
    const id = recipe?._id || recipe?.id || recipe;
    if (id) navigate(`/recipes/${id}`);
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Clear all recent searches?")) return;
    const token = localStorage.getItem("token");
    await axios.delete(
      "http://localhost:5000/api/user/recent-searches",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setSearches([]);
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
      <div className="recent-loading">
        <div className="spinner" />
        <p>Loading your recent searches…</p>
      </div>
    );
  }

  return (
    <div className="recent-container">
      {/* Header */}
      <div className="recent-header">
        <div>
          <h1><FaHistory /> Your Recent Searches</h1>
          <p>Recipes you've recently viewed</p>
        </div>

        <div className="recent-header-actions">
          <button className="btn btn-primary" onClick={() => navigate("/recipes")}>
            <FaSearch /> Browse Recipes
          </button>
          <button className="btn btn-danger" onClick={() => navigate("/favorites")}>
            <FaHeart /> Favorites
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/login")}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {error && <div className="recent-error">{error}</div>}

      {/* Empty State */}
      {searches.length === 0 ? (
        <div className="recent-empty">
          <div className="icon-wrapper"><FaListAlt /></div>
          <h3>No recent searches yet</h3>
          <p>Start exploring recipes and they'll appear here.</p>
          <button className="btn btn-primary" onClick={() => navigate("/recipes")}>
            <FaArrowRight /> Browse Recipes
          </button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="recent-stats">
            <div className="stat-card green">
              <h4><FaChartBar /> Total Viewed</h4>
              <p>{searches.length}</p>
            </div>
            <div className="stat-card soft">
              <h4><FaClock /> Last Viewed</h4>
              <p>{formatTime(searches[0]?.timestamp)}</p>
            </div>
            <button
              className="btn btn-warning"
              onClick={handleClearHistory}
            >
              <FaTrash /> Clear All History
            </button>
          </div>

          {/* Grid */}
          <div className="recent-grid">
            {searches.map((item, idx) => {
              const r = item.recipeId || item;
              return (
                <div
                  key={idx}
                  className="recent-card"
                  onClick={() => handleRecipeClick(item)}
                >
                  <img
                    src={r.imageUrl || r.image}
                    alt={r.name}
                  />
                  <div className="recent-card-body">
                    <h3>{r.name}</h3>
                    <div className="meta">
                      <FaClock /> {(r.prepTime || 0) + (r.cookTime || 0)} min • <FaUsers />{" "}
                      {r.servings || 2}
                    </div>
                    <div className="recent-card-footer">
                      <span><FaEye /> Viewed {formatTime(item.timestamp)}</span>
                      <button className="btn btn-link">
                        View <FaArrowRight />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="recent-footer">
        <p className="recent-footer-text">
          <FaSyncAlt /> Recent searches are automatically saved when you view recipes.
        </p>

        <div className="recent-footer-actions">
          <button
            onClick={() => navigate("/favorites")}
            className="recent-footer-link"
          >
            <FaHeart /> View Your Favorites
          </button>

          <button
            onClick={() => navigate("/recipes")}
            className="recent-footer-link"
          >
            <FaBookOpen /> Browse More Recipes
          </button>
        </div>

        <p className="recent-footer-note">
          Your recent searches are synced to your account.
        </p>
      </div>
    </div>
  );
};

export default RecentSearches;