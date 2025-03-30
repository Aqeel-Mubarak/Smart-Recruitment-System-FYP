import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background2.jpg';
import logo from '../assets/logo.jpg';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideUp, formFieldVariants, buttonVariants } from '../components/animations';
import { UserPlus, Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';

const Modal = ({ message, onClose, status }) => {
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div 
          className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-[90%] max-w-md"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <motion.div 
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${
              status === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}
            initial={{ rotate: 180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {status === 'success' ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </motion.div>

          <motion.h2
            className={`text-2xl font-bold text-center mb-2 ${
              status === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {status === 'success' ? 'Success!' : 'Error'}
          </motion.h2>

          <motion.p
            className="text-center text-gray-600 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {message}
          </motion.p>

          {status === 'success' && (
            <>
              <motion.div
                className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  className="h-full bg-green-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </motion.div>

              <motion.p
                className="text-sm text-center text-gray-500 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Redirecting to sign in...
              </motion.p>
            </>
          )}

          <motion.button
            className={`w-full py-3 px-6 rounded-lg font-medium shadow-lg flex items-center justify-center gap-2 ${
              status === 'success' 
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-300' 
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-300'
            } text-white focus:ring-4 transition-all`}
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {status === 'success' ? 'Sign In' : 'Try Again'}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage("Account created successfully! Please sign in to continue.");
      setStatus('success');
      setShowPopup(true);
      setTimeout(() => {
        navigate('/');
      }, 2500);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setErrorMessage("Email is already registered.");
      } else {
        setErrorMessage("An error occurred during signup.");
      }
      setStatus('error');
      setShowPopup(true);
      setSuccessMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    if (status === 'success') {
      navigate('/');
    } else {
      setShowPopup(false);
    }
  };

  return (
    <motion.div 
      className="min-h-screen overflow-y-auto bg-gray-50"
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
      <Navbar />

      <div className="relative min-h-screen py-20 px-4">
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        />

        <motion.div 
          className="relative z-10 max-w-2xl mx-auto"
          variants={slideUp}
        >
          <motion.div
            className="bg-white/80 backdrop-blur-lg p-8 shadow-xl rounded-xl border border-white/20"
            variants={formFieldVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {errorMessage && (
              <motion.div 
                className="bg-red-50 text-red-600 p-4 rounded-lg mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errorMessage}
              </motion.div>
            )}
            
            <motion.h2 
              className="text-3xl font-bold mb-6 text-gray-800"
              variants={formFieldVariants}
            >
              Create Account
            </motion.h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={formFieldVariants}>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    First Name
                  </label>
                  <input
                    name="first_name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </motion.div>

                <motion.div variants={formFieldVariants}>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Last Name
                  </label>
                  <input
                    name="last_name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </motion.div>
              </div>

              <motion.div variants={formFieldVariants}>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  name="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </motion.div>

              <motion.div variants={formFieldVariants}>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  name="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </motion.div>

              <motion.div variants={formFieldVariants}>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  name="cell_phone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  type="tel"
                  required
                  value={formData.cell_phone}
                  onChange={handleChange}
                />
              </motion.div>

              <motion.div variants={formFieldVariants}>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Company Name
                </label>
                <input
                  name="company_name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={handleChange}
                />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={formFieldVariants}>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    City
                  </label>
                  <input
                    name="city"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleChange}
                  />
                </motion.div>

                <motion.div variants={formFieldVariants}>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Country
                  </label>
                  <input
                    name="country"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                    type="text"
                    required
                    value={formData.country}
                    onChange={handleChange}
                  />
                </motion.div>
              </div>

              <motion.div variants={formFieldVariants}>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </motion.div>

              <motion.button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </motion.button>

              <motion.div 
                className="text-center mt-6"
                variants={formFieldVariants}
              >
                <span className="text-gray-600">Already have an account? </span>
                <Link 
                  to="/" 
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </div>

      {showPopup && (
        <Modal 
          message={status === 'success' ? successMessage : errorMessage}
          status={status}
          onClose={handleSignIn}
        />
      )}
    </motion.div>
  );
};

export default SignupPage;
