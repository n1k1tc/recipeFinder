import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Admin from "./pages/Admin";
import Header from "./components/Header";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Recipes from "./pages/Recipes";
import RecipeDetails from "./pages/RecipeDetails";
import RecentSearches from "./pages/RecentSearches";
import MissingIngredients from "./pages/MissingIngredients";
import Favorites from "./pages/Favorites";
import Footer from "./components/Footer";
import "./index.css";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("userEmail");

  // Only allow logged-in admin
  if (!token || email !== "nikitapal580@gmail.com") {
    return <Login />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />

        <main className="main-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/recipes/:id" element={<RecipeDetails />} />
              <Route
                path="/missing-ingredients"
                element={<MissingIngredients />}
              />
              <Route path="/recent-searches" element={<RecentSearches />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/about" element={<About />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
