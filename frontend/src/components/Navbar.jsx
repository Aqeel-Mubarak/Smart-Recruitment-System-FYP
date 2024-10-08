import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.jpg'; // Ensure the path to your logo image is correct

const Navbar = () => {
  const location = useLocation(); // Get the current route
  const [activeLink, setActiveLink] = useState('/Home'); // Set initial active link to '/Home'

  useEffect(() => {
    setActiveLink(location.pathname); // Update active link when the route changes
  }, [location.pathname]);

  return (
    <nav className="p-4 fixed top-0 left-0 w-full z-50 bg-blue-600 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo on the left */}
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Company Logo" className="h-10 w-10 rounded-full" />
        </div>

        {/* Navigation links on the right */}
        <div className="flex space-x-8 ml-auto text-white font-semibold" style={{ fontSize: '1.125rem' }}>
          <Link
            to="/Home"
            className={`hover:text-gray-200 ${activeLink === '/Home' ? 'border-b-2 border-white' : ''}`}
            onClick={() => setActiveLink('/Home')}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`hover:text-gray-200 ${activeLink === '/about' ? 'border-b-2 border-white' : ''}`}
            onClick={() => setActiveLink('/about')}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`hover:text-gray-200 ${activeLink === '/contact' ? 'border-b-2 border-white' : ''}`}
            onClick={() => setActiveLink('/contact')}
          >
            Contact
          </Link>
          <Link
            to="/"
            className={`hover:text-gray-200 ${activeLink === '/' ? 'border-b-2 border-white' : ''}`}
            onClick={() => setActiveLink('/')}
          >
            Logout
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
