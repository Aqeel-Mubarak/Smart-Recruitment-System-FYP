// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { buttonVariants } from './animations';
import { Home, Info, Mail, LogIn } from 'lucide-react';
import logo from '../assets/logo.jpg';

const Navbar = () => {
  const navVariants = {
    hidden: { y: -100 },
    visible: { 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  const logoVariants = {
    initial: { rotate: 0 },
    hover: { rotate: 360, transition: { duration: 0.8 } }
  };

  return (
    <motion.nav 
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className="p-4 fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-indigo-600 to-indigo-800 backdrop-blur-sm bg-opacity-90 shadow-lg"
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.img 
              src={logo} 
              alt="Company Logo" 
              className="h-10 w-10 rounded-full border-2 border-white/20"
              variants={logoVariants}
              whileHover="hover"
              initial="initial"
            />
            <motion.span 
              className="text-white font-semibold text-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Smart Recruitment System
            </motion.span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <motion.div 
              className="flex space-x-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Link to="/about">
                <motion.span 
                  className="text-white/90 hover:text-white font-medium transition-colors inline-flex items-center space-x-1"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Info className="w-4 h-4" />
                  <span>About</span>
                </motion.span>
              </Link>
              <a href="mailto:aqeelmubarak2003@gmail.com" target="_blank" rel="noopener noreferrer">
                <motion.span 
                  className="text-white/90 hover:text-white font-medium transition-colors inline-flex items-center space-x-1"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact</span>
                </motion.span>
              </a>
            </motion.div>
            
            <Link to="/">
              <motion.button
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium backdrop-blur-sm transition-colors inline-flex items-center space-x-2"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <LogIn className="w-4 h-4" />
                <span>Get Started</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
