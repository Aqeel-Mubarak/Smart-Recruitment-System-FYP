import React from 'react';
import backgroundImage from '../assets/background2.jpg';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/home'); // Redirect to Home page
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content Section */}
      <div className="flex flex-1 relative">
        {/* Full-screen Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        />

        {/* Left Section with Login Form */}
        <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center min-h-screen">
          <div
            className="bg-white p-8 shadow-lg rounded-lg max-w-sm w-full"
            style={{
              transform: 'scale(0.8)',
              marginLeft: '-1in', // Reduced left margin to half of the previous value
            }}
          >
            <h2 className="text-3xl font-bold mb-6 text-left" style={{ color: '#000000' }}>Log in</h2>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  style={{ backgroundColor: '#ffffff', color: '#333333' }}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                  id="password"
                  type="password"
                  placeholder="***"
                  style={{ backgroundColor: '#ffffff', color: '#333333' }}
                />
              </div>
              <div className="flex items-center justify-between mb-4">
                <span style={{ color: '#000000' }}>Forgot your password? <a href="resetpassword" style={{ color: '#0000ff' }}>Reset here</a></span>
              </div>
              <div className="mb-6">
                <button
                  className="hover:bg-gray-800 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={handleLogin}
                  style={{ backgroundColor: '#000000' }}
                >
                  LOGIN
                </button>
              </div>
              <div className="flex items-center justify-start">
                <span style={{ color: '#000000' }}>Don’t have an account?&nbsp;</span>
                <Link to="/signup" className="font-normal" style={{ color: '#0000ff' }}>
                  Register here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
