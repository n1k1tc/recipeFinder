// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Recent searches with timestamp
  recentSearches: [{
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true
    }
  }],
  // Favorites with timestamp
  favorites: [{
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now,
      required: true
    }
  }],
  // Keep existing fields
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better performance
//userSchema.index({ email: 1 });
userSchema.index({ "recentSearches.timestamp": -1 });
userSchema.index({ "favorites.addedAt": -1 });

module.exports = mongoose.model("User", userSchema);