
import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background2.jpg';
import logo from '../assets/logo.jpg';
import Navbar from '../components/Navbar';
import axios from 'axios';



const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    cell_phone: "",
    company_name: "",
    city: "",
    country: "",
    gender: "",
    email: "",
    password: "",
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
   // Handle form submission
   const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Required for FormData
        },
      });

      setSuccessMessage("Signup successful!");
      setErrorMessage(""); // Clear any previous error
      console.log("Response:", response.data);
      navigate('/');
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setErrorMessage("Email is already registered.");
      } else {
        setErrorMessage("An error occurred during signup.");
      }
      setSuccessMessage(""); // Clear any previous success message
      console.error("Error:", error);
    }
  };

  const handleSignIn = () => {
    navigate('/'); // Redirect to Login page
  };

  return (
    <div className="h-screen flex flex-col overflow-y-auto">
      <Navbar/>

      {/* Main Content */}
      <div className="flex flex-1  relative items-start justify-start">
        {/* Full-Width Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'top center',
            backgroundRepeat: 'no-repeat',
            minHeight: '100%',
          }}
        />

        {/* Signup Form */}
        <div className="relative z-10 w-full md:w-[calc(25%+.7in)] bg-white p-4 pl-4 pr-8 shadow-lg rounded-lg max-w-lg ml-[.8in] mt-24 mb-8">
        <h1 className="text-3xl font-bold mb-2 text-left" style={{ color: '#000000' }}>Sign up</h1>
          <form onSubmit={handleSubmit}>
            {/* First Name */}
            <div className="mb-2">
              <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="firstName">
                First Name
              </label>
              <input
                name="first_name"
                className="shadow border rounded w-full py-1 px-2 text-gray-700 focus:outline-none focus:shadow-outline text-xs"
                id="firstName"
                type="text"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Last Name */}
            <div className="mb-2">
              <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="lastName">
                Last Name
              </label>
              <input
                name="last_name"
                className="shadow border rounded w-full py-1 px-2 text-gray-700 focus:outline-none focus:shadow-outline text-xs"
                id="lastName"
                type="text"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Cell Phone */}
            <div className="mb-2">
              <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="cellPhone">
                Cell Phone
              </label>
              <input
                name= "cell_phone"
                className="shadow border rounded w-full py-1 px-2 text-gray-700 focus:outline-none focus:shadow-outline text-xs"
                id="cellPhone"
                type="text"
                placeholder="123-456-7890"
                value={formData.cell_phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* Company Name */}
            <div className="mb-2">
              <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="companyName">
                Company Name
              </label>
              <input
                name = "company_name"
                className="shadow border rounded w-full py-1 px-2 text-gray-700 focus:outline-none focus:shadow-outline text-xs"
                id="companyName"
                type="text"
                placeholder="Your Company"
                value={formData.company_name}
                onChange={handleChange}
                required
              />
            </div>

            {/* City and Country */}
            <div className="mb-2 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="city">
                  City
                </label>
                <input
                  name="city"
                  className="shadow border rounded w-full py-1 px-2 text-gray-700 focus:outline-none focus:shadow-outline text-xs"
                  id="city"
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="country">
                  Country
                </label>
                <input
                  name="country"
                  className="shadow border rounded w-full py-1 px-2 text-gray-700 focus:outline-none focus:shadow-outline text-xs"
                  id="country"
                  type="text"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Gender */}
            <div className="mb-2">
              <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="gender">
                Gender
              </label>
              <div className="flex space-x-2">
                <label className="inline-flex items-center">
                  <input type="radio" name="gender" value="male" checked={formData.gender === "male"} onChange={handleChange}className="form-radio" required/>
                  <span className="ml-1 text-xs">Male</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" name="gender" value="female" checked={formData.gender === "female"} onChange={handleChange} className="form-radio" required/>
                  <span className="ml-1 text-xs">Female</span>
                </label>
              </div>
            </div>

            {/* Email */}
            <div className="mb-2">
              <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="email">
                Email
              </label>
              <input
                name="email"
                className="shadow border rounded w-full py-1 px-2 text-gray-700 focus:outline-none focus:shadow-outline text-xs"
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-2">
              <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="email">
                Password
              </label>
              <input
                name="password"
                className="shadow border rounded w-full py-1 px-2 text-gray-700 focus:outline-none focus:shadow-outline text-xs"
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Sign Up Button */}
            <div className="mb-2">
              <button
                className="bg-black text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline hover:bg-gray-800 text-xs"
                type="submit"
              >
                Sign Up
              </button>
            </div>

            {/* Sign In Link */}
            {/* Already have an account and Sign In Button */}
<div className="text-left mb-2">
  <p className="text-gray-700 text-xs font-bold mb-1">Already have an account?</p>
  <button
    onClick={handleSignIn}
    className="bg-black text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline hover:bg-gray-800 text-xs"
  >
    Sign In
  </button>
</div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

