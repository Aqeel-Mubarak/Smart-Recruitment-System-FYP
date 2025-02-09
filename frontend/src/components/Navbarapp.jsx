// src/components/Navbarapp.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.jpg';

const Navbarapp = () => {
  const location = useLocation();

  // Map paths to page titles.
  const pageTitles = {
    '/home': 'Home',
    '/about': 'About',
    '/contact': 'Contact',
    '/resume-upload': 'Resume Upload',
    '/create-job': 'Create Job',
    '/open-jobs': 'Open Jobs',
    '/shortlist-candidate': 'Shortlist Candidates',
    '/upcoming-interviews': 'Upcoming Interviews',
    '/reports': 'Reports',
  };

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/';
  };

  return (
    <nav className="p-4 fixed top-0 left-0 w-full z-50" style={{ backgroundColor: '#800080' }}>
      <div className="flex justify-between items-center">
        {/* Logo and Page Title */}
        <div className="flex items-center">
          <img src={logo} alt="Company Logo" className="h-8 w-8 mr-2" />
          <span className="text-white text-xl font-bold">{pageTitle}</span>
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-4 text-white font-light text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
          <Link to="/about" className="hover:text-gray-300">About</Link>
          <Link to="/contact" className="hover:text-gray-300">Contact</Link>
          <button onClick={handleLogout} className="hover:text-gray-300">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbarapp;
