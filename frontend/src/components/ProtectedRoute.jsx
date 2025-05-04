import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Correct import

function isTokenValid(token) {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false; // Ensure exp exists

    const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
    return decoded.exp > currentTime; // Check if token is expired
  } catch (error) {
    console.error("Invalid Token:", error);
    return false; // Return false if token is invalid or expired
  }
}

function ProtectedRoute() {
  const token = localStorage.getItem("accessToken");
  const isAuthenticated = token && isTokenValid(token);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;
