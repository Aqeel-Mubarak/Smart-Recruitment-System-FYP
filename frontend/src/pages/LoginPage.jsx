import React, {useState} from 'react';
import backgroundImage from '../assets/background2.jpg';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { motion } from 'framer-motion';
import { fadeIn, slideUp, formFieldVariants, buttonVariants } from '../components/animations';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
  
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 200) {
        const { access_token, token_type } = response.data;
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('tokenType', token_type);
        window.location.href = '/home';
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.detail || 'Login failed. Please try again.');
      } else {
        setErrorMessage('Network error. Please try again later.');
      }
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
              Welcome Back
            </motion.h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <motion.div variants={formFieldVariants}>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  id="email"
                  type="email"
                  value={email}
                  placeholder="name@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </motion.div>

              <motion.div variants={formFieldVariants}>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </motion.div>

              <motion.div 
                className="flex items-center justify-between"
                variants={formFieldVariants}
              >
                <Link 
                  to="/resetpassword" 
                  className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot your password?
                </Link>
              </motion.div>

              <motion.button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Sign In
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

export default LoginPage;
