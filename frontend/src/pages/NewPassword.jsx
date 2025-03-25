import React, { useState } from 'react';
import backgroundImage from '../assets/background2.jpg';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { motion } from 'framer-motion';
import { fadeIn, slideUp, formFieldVariants, buttonVariants } from '../components/animations';

const NewPassword = () => {
  const [password, setPassword] = useState('');
  const [Cpassword, setCPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== Cpassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('password', password);
    formData.append('token', token);

    try {
      const response = await axios.post(`${API_BASE_URL}/create-new-password`, formData);
      setLoading(false);
      navigate('/');
    } catch (error) {
      setLoading(false);
      setErrorMessage("An error occurred while resetting the password. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <motion.div 
      className="min-h-screen overflow-hidden flex flex-col bg-gray-50"
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
      <Navbar />

      <div className="flex flex-1 relative">
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        />

        <motion.div 
          className="relative z-10 w-full md:w-1/2 flex items-center justify-center min-h-screen py-20"
          variants={slideUp}
        >
          <motion.div
            className="bg-white/80 backdrop-blur-lg p-8 shadow-xl rounded-xl w-full max-w-md mx-4 border border-white/20"
            variants={formFieldVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {errorMessage && (
              <motion.div 
                className="bg-red-50 text-red-600 p-4 rounded-lg mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errorMessage}
              </motion.div>
            )}
            
            <motion.h2 
              className="text-3xl font-bold mb-6 text-gray-800"
              variants={formFieldVariants}
            >
              Create New Password
            </motion.h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={formFieldVariants}>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                />
              </motion.div>

              <motion.div variants={formFieldVariants}>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="Cpassword">
                  Confirm Password
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  id="Cpassword"
                  type="password"
                  value={Cpassword}
                  onChange={(e) => setCPassword(e.target.value)}
                  placeholder="Confirm your new password"
                />
              </motion.div>

              <motion.button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </motion.button>

              <motion.div 
                className="text-center mt-6"
                variants={formFieldVariants}
              >
                <span className="text-gray-600">Don't have an account? </span>
                <Link 
                  to="/signup" 
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NewPassword;