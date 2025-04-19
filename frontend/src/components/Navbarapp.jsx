// src/components/Navbarapp.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { buttonVariants } from './animations';
import { LogOut, Home, Info, Mail, FileText, BriefcaseIcon, Users, Calendar, BarChart2, Video, ClipboardList, MessageCircle, Menu, X } from 'lucide-react';
import logo from '../assets/logo.jpg';

const Navbarapp = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Map paths to page titles and icons
  const pageInfo = {
    '/home': { title: 'Home', icon: Home },
    '/about': { title: 'About', icon: Info },
    '/resume-upload': { title: 'Resume Upload', icon: FileText },
    '/create-job': { title: 'Create Job', icon: BriefcaseIcon },
    '/open-jobs': { title: 'Open Jobs', icon: BriefcaseIcon },
    '/shortlist-candidate': { title: 'Shortlist Candidates', icon: Users },
    '/upcoming-interviews': { title: 'Upcoming Interviews', icon: Calendar },
    '/reports': { title: 'Reports', icon: BarChart2 },
    '/video-analysis': { title: 'Analysis of Recorded Interview', icon: Video },
    '/admin/summaries': { title: 'AI Interviews Results', icon: ClipboardList },
    '/Create-Interview': { title: 'Create AI Interview', icon: MessageCircle },
  };

  const currentPage = pageInfo[location.pathname] || { title: 'Dashboard', icon: Home };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/';
  };

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

  const PageIcon = currentPage.icon;

  return (
    <motion.nav 
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className="p-4 fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-indigo-600 to-indigo-800 backdrop-blur-sm bg-opacity-90 shadow-lg"
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo and Page Title */}
          <div className="flex items-center space-x-2 md:space-x-4 overflow-hidden">
            <Link to="/home" className="flex items-center space-x-2">
              <motion.img 
                src={logo} 
                alt="Company Logo" 
                className="h-8 w-8 md:h-10 md:w-10 rounded-full border-2 border-white/20"
                variants={logoVariants}
                whileHover="hover"
                initial="initial"
              />
              <motion.span 
                className="text-white font-semibold text-base md:text-xl hidden sm:inline"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Smart Recruitment System
              </motion.span>
            </Link>
            <motion.div 
              className="flex items-center space-x-1 md:space-x-2 text-white/90 pl-2 md:pl-6 border-l border-white/20 text-sm md:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <PageIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-lg font-medium truncate max-w-[100px] sm:max-w-none">
                {currentPage.title}
              </span>
            </motion.div>
          </div>

          {/* Desktop Navigation Links */}
          <motion.div 
            className="hidden md:flex items-center space-x-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex space-x-6">
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
            </div>

            <motion.button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium backdrop-blur-sm transition-colors inline-flex items-center space-x-2"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </motion.button>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button 
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
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
                <motion.button
                  onClick={handleLogout}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 w-full"
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbarapp;