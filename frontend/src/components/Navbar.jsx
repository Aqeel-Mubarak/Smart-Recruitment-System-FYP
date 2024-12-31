// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';

const Navbar = () => {
  return (
    <nav className="p-4 fixed top-0 left-0 w-full z-50" style={{ backgroundColor: '#800080' }}>
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center" style={{ marginLeft: '0px' }}>
          <img src={logo} alt="Company Logo" className="h-8 w-8" />
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-8 text-white font-light text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
          <Link to="/about" className="hover:text-gray-300">About</Link>
          <Link to="/contact" className="hover:text-gray-300">Contact</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
