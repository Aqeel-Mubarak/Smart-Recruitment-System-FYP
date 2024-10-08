import React from 'react'; 
import { Link } from 'react-router-dom'; // Import Link for navigation
import backgroundImage from '../assets/background.jpg'; 
import logo from '../assets/logo.jpg'; 

const SignupPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
     {/* Navbar */}
<nav className="p-4 fixed top-0 left-0 w-full z-50" style={{ backgroundColor: 'rgb(92, 88, 178)' }}>
  <div className="container mx-auto flex justify-between items-center">
    {/* Logo */}
    <div className="flex items-center space-x-2">
      <img src={logo} alt="Company Logo" className="h-8 w-8 rounded-full" />
    </div>

    {/* Links */}
    <div className="flex space-x-8 text-white text-lg">
    <Link to="/home" className="hover:text-gray-300">Home</Link>
    <Link to="/about" className="hover:text-gray-300">About</Link>
      <Link to="/contact" className="hover:text-gray-300">Contact</Link>
      <Link to="/" className="hover:text-gray-300">Signin</Link> {/* Signin link */}
    </div>
  </div>
</nav>

      {/* Main Content */}
      <div className="flex flex-1 pt-20 relative"> {/* Increased padding top to 20 from 16 */}
        {/* Full-Width Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        />

        {/* Signup Form */}
        <div className="relative z-10 w-full md:w-2/5 flex items-center justify-start min-h-screen"> {/* Reduced width to 2/5 from 1/2 */}
          <div className="bg-white p-8 shadow-lg rounded-lg max-w-md w-full ml-10">
            <h2 className="text-2xl font-semibold mb-6">Signup</h2>
            <form>
              {/* First Name */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                  First Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                />
              </div>

              {/* Last Name */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                />
              </div>

              {/* Cell Phone */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cellPhone">
                  Cell Phone
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="cellPhone"
                  type="text"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Company Name */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="companyName">
                  Company Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="companyName"
                  type="text"
                  placeholder="Enter your company's name"
                />
              </div>

              {/* City and Country */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="city">
                    City
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="city"
                    type="text"
                    placeholder="Enter your city"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="country">
                    Country
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="country"
                    type="text"
                    placeholder="Enter your country"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                />
              </div>

              {/* Sign Up Button */}
              <div className="mb-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline" type="submit">
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
