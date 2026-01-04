const express = require("express");
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const recipeRoutes = require("./routes/recipeRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/user", userRoutes); // ADD THIS

// Test route
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "Server running",
    endpoints: {
      auth: "/api/auth",
      recipes: "/api/recipes",
      user: "/api/user"
    }
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Endpoints:`);
  console.log(`  - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`  - Recipes: http://localhost:${PORT}/api/recipes`);
  console.log(`  - User: http://localhost:${PORT}/api/user`);
  console.log(`  - Test: http://localhost:${PORT}/api/test`);
});