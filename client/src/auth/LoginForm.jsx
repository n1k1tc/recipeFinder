import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

const API = import.meta.env.VITE_API_BASE_URL;

export const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API}/api/auth/login`, formData);
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("userName", res.data.user.name);
      
      setTimeout(() => {
        navigate("/recipes");
      }, 800);
      
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="background-elements">
        <div className="floating-food-icon"></div>
        <div className="floating-food-icon"></div>
        <div className="floating-food-icon"></div>
        <div className="floating-food-icon"></div>
      </div>
      
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-header">
            <h2>
              Welcome to <span>RecipeFinder</span>
            </h2>
            <p>Sign in to find recipes and missing ingredients</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <div className="input-icon"></div>
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <div className="input-icon"></div>
            </div>

            {error && <div className="error-message">{error}</div>}
            
            <button 
              className="primary-btn" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  SIGNING IN...
                </>
              ) : (
                "SIGN IN TO RECIPES"
              )}
            </button>
          </form>
        </div>

        <div className="auth-right">
          <div className="auth-right-content">
            <div className="food-icon login-food-icon"></div>
            <h2>New to RecipeFinder?</h2>
            <p>
              Create an account to access thousands of recipes 
              and find where to buy missing ingredients
            </p>
            <button
              className="outline-btn"
              onClick={() => navigate("/signup")}
            >
              CREATE ACCOUNT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};