import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.jpg';

const Navbarapp = () => {
  const location = useLocation();

  // Determine if we are on the Home, About, or Contact page
  const isHomePage = location.pathname === '/home';
  const isAboutPage = location.pathname === '/about';
  const isContactPage = location.pathname === '/contact';

  return (
    <nav className="p-4 fixed top-0 left-0 w-full z-50" style={{ backgroundColor: '#800080' }}>
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center" style={{ marginLeft: '0px' }}>
          <img src={logo} alt="Company Logo" className="h-8 w-8" />
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-4 text-white font-light text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
          <Link 
            to="/home" 
            className={`hover:text-gray-300 ${isHomePage ? 'font-bold underline' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className={`hover:text-gray-300 ${isAboutPage ? 'font-bold underline' : ''}`}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className={`hover:text-gray-300 ${isContactPage ? 'font-bold underline' : ''}`}
          >
            Contact
          </Link>
          <span>|</span>
          <Link to="/" className="hover:text-gray-300">Logout</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbarapp;
