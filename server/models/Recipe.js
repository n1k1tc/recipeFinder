// models/Recipe.js
const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'main course'],
    lowercase: true
  },
  ingredients: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: mongoose.Schema.Types.Mixed, // Can be String or Number
      required: true
    },
    unit: {
      type: String,
      default: ""
    }
  }],
  prepTime: {
    type: Number,
    required: true,
    min: 0
  },
  cookTime: {
    type: Number,
    required: true,
    min: 0
  },
  servings: {
    type: Number,
    required: true,
    min: 1
  },
  steps: {
    type: [String],
    required: true,
    validate: [array => array.length > 0, 'At least one step is required']
  },
  imageUrl: {
    type: String,
    default: "https://via.placeholder.com/400x300?text=Recipe+Image"
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  dietary: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for total time
recipeSchema.virtual('totalTime').get(function() {
  return this.prepTime + this.cookTime;
});

// Index for faster searches
recipeSchema.index({ name: 'text', 'ingredients.name': 'text' });

module.exports = mongoose.model("Recipe", recipeSchema);