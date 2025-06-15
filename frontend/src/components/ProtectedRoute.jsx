import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Correct import

/**
 * Validates if a JWT token is still valid and not expired
 * @param {string} token - The JWT token to validate
 * @returns {boolean} - Returns true if token is valid and not expired, false otherwise
 */
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

/**
 * ProtectedRoute Component
 * A higher-order component that protects routes from unauthorized access
 * - Checks for the presence of a valid JWT token in localStorage
 * - If authenticated, renders the child routes using Outlet
 * - If not authenticated, redirects to the login page
 * @returns {JSX.Element} - Either the protected content or a redirect to login
 */
function ProtectedRoute() {
  const token = localStorage.getItem("accessToken");
  const isAuthenticated = token && isTokenValid(token);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;
