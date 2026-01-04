import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

const API = import.meta.env.VITE_API_BASE_URL;

export const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
  };

  const isValidName = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const nameRegex = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;
    return nameRegex.test(trimmed);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!isValidName(formData.name)) {
      setError("Please enter a valid name (letters and spaces only)");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${API}/api/auth/signup`, formData);
      localStorage.setItem("userName", formData.name);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Account creation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    setIsGuestLoading(true);
    localStorage.setItem("isGuest", "true");
    const guestUser = {
      isGuest: true,
      accessTime: new Date().toISOString(),
    };
    localStorage.setItem("guestUser", JSON.stringify(guestUser));
    setTimeout(() => {
      navigate("/recipes");
      setIsGuestLoading(false);
    }, 500);
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
              Start Your <span>Cooking Journey</span>
            </h2>
            <p>Create an account to discover recipes and find missing ingredients</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <div className="input-icon"></div>
            </div>

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
                placeholder="Password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
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
                  CREATING ACCOUNT...
                </>
              ) : (
                "CREATE ACCOUNT"
              )}
            </button>

            <div className="divider">
              <span className="divider-line"></span>
              <span className="divider-text">OR</span>
              <span className="divider-line"></span>
            </div>

            <button
              type="button"
              className="guest-btn"
              onClick={handleGuestAccess}
              disabled={isGuestLoading}
            >
              {isGuestLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  CONTINUING AS GUEST...
                </>
              ) : (
                <>
                  <div className="guest-icon"></div>
                  CONTINUE AS GUEST
                </>
              )}
            </button>
          </form>
        </div>

        <div className="auth-right">
          <div className="auth-right-content">
            <div className="food-icon signup-food-icon"></div>
            <h2>Already Have an Account?</h2>
            <p>
              Sign in to search thousands of recipes, find missing ingredients, 
              and get direct links to purchase them online
            </p>
            <button
              className="outline-btn"
              onClick={() => navigate("/login")}
            >
              SIGN IN HERE
            </button>
          </div>
        </div>
      </div>

      {success && (
        <div className="success-message">
          Account created successfully! Redirecting...
        </div>
      )}
    </div>
  );
};