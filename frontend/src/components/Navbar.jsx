import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { buttonVariants } from './animations';
import { Home, Info, Mail, LogIn, Menu, X } from 'lucide-react';
import logo from '../assets/logo.jpg';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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

  const mobileMenuVariants = {
    closed: { 
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3
      }
    },
    open: { 
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3
      }
    }
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
              <span className="hidden sm:inline">Smart Recruitment System</span>
              <span className="sm:hidden">Smart Recruitment System</span>
            </motion.span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
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

          {/* Mobile Menu Button */}
          <motion.button 
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10"
            onClick={toggleMenu}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileMenuVariants}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 flex flex-col space-y-4 border-t border-white/10 mt-4">
                <Link to="/about" onClick={() => setIsMenuOpen(false)}>
                  <motion.div 
                    className="text-white/90 hover:text-white font-medium py-2 transition-colors flex items-center space-x-2"
                    whileTap={{ scale: 0.98 }}
                  >
                    <Info className="w-5 h-5" />
                    <span>About</span>
                  </motion.div>
                </Link>
                <a 
                  href="mailto:aqeelmubarak2003@gmail.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <motion.div 
                    className="text-white/90 hover:text-white font-medium py-2 transition-colors flex items-center space-x-2"
                    whileTap={{ scale: 0.98 }}
                  >
                    <Mail className="w-5 h-5" />
                    <span>Contact</span>
                  </motion.div>
                </a>
                <Link to="/" onClick={() => setIsMenuOpen(false)}>
                  <motion.div
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 w-full"
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Get Started</span>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;