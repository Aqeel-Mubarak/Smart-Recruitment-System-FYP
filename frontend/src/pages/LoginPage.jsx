/**
 * LoginPage Component
 * 
 * A responsive login page with animated UI elements that handles user authentication.
 * Features:
 * - Email and password form validation
 * - Error handling and display
 * - JWT token storage
 * - Responsive design with mobile optimization
 * - Animated transitions using Framer Motion
 */

// Import necessary dependencies
import React, {useState} from 'react';
import backgroundImage from '../assets/background2.jpg';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { motion } from 'framer-motion';
import { fadeIn, slideUp, formFieldVariants, buttonVariants } from '../components/animations';
import AdminLoginPage from './AdminLoginPage';

const LoginPage = () => {
  // State management for form inputs and error handling
  const [email, setEmail] = useState('');        // Stores user's email input
  const [password, setPassword] = useState('');  // Stores user's password input
  const [errorMessage, setErrorMessage] = useState(''); // Stores any error messages to display

  /**
   * Handles the login form submission
   * Makes an API call to authenticate the user
   * On success:
   * - Stores JWT token in localStorage
   * - Redirects to home page
   * On failure:
   * - Displays appropriate error message
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
  
    try {
      // Make POST request to login endpoint
      const response = await axios.post(`${API_BASE_URL}/login`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 200) {
        // On successful login, store tokens and redirect
        const { access_token, token_type } = response.data;
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('tokenType', token_type);
        window.location.href = '/home';
      }
    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        setErrorMessage(error.response.data.detail || 'Login failed. Please try again.');
      } else {
        setErrorMessage('Network error. Please try again later.');
      }
    }
  };

  return (
    // Main container with fade-in animation
    <motion.div 
      className="min-h-screen overflow-hidden flex flex-col bg-gray-50"
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
      <Navbar />

      <div className="flex flex-1 relative">
        {/* Background image with fade-in animation */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        />

        {/* Main login form container with slide-up animation */}
        <motion.div 
          className="relative z-10 w-full md:w-1/2 flex items-center justify-center min-h-screen py-20 px-4 sm:px-6"
          variants={slideUp}
        >
          {/* Login form card with glassmorphism effect and animations */}
          <motion.div
            className="bg-white/80 backdrop-blur-lg p-4 sm:p-8 shadow-xl rounded-xl w-full max-w-md mx-auto border border-white/20"
            variants={formFieldVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Error message display with animation */}
            {errorMessage && (
              <motion.div 
                className="bg-red-50 text-red-600 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errorMessage}
              </motion.div>
            )}
            
            {/* Welcome heading */}
            <motion.h2 
              className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800"
              variants={formFieldVariants}
            >
              Welcome Back
            </motion.h2>
            
            {/* Login form with animated fields */}
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
              {/* Email input field with animation */}
              <motion.div variants={formFieldVariants}>
                <label className="block text-gray-700 text-sm font-medium mb-1 sm:mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  id="email"
                  type="email"
                  value={email}
                  placeholder="name@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </motion.div>

              {/* Password input field with animation */}
              <motion.div variants={formFieldVariants}>
                <label className="block text-gray-700 text-sm font-medium mb-1 sm:mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </motion.div>

              {/* Forgot password link with animation */}
              <motion.div 
                className="flex items-center justify-between"
                variants={formFieldVariants}
              >
                <Link 
                  to="/resetpassword" 
                  className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot your password?
                </Link>
              </motion.div>

              {/* Submit button with hover and tap animations */}
              <motion.button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Sign In
              </motion.button>

              {/* Sign up link for new users with animation */}
              <motion.div 
                className="text-center mt-4 sm:mt-6"
                variants={formFieldVariants}
              >
                <span className="text-gray-600 text-xs sm:text-sm">Don't have an account? </span>
                <Link 
                  to="/signup" 
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors text-xs sm:text-sm"
                >
                  Sign up
                </Link>
              </motion.div>
              <motion.div 
                className="text-center mt-4 sm:mt-6"
                variants={formFieldVariants}
              >
                <span className="text-gray-600 text-xs sm:text-sm"> </span>
                <Link 
                  to="/adminlogin" 
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors text-xs sm:text-sm"
                >
                  Login as Admin Here !
                </Link>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoginPage;