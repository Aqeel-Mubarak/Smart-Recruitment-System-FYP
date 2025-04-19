import React, { useState } from 'react';
import backgroundImage from '../assets/background2.jpg';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { motion } from 'framer-motion';
import { fadeIn, slideUp, formFieldVariants, buttonVariants } from '../components/animations';

const ForgetPassword = () => {
    const [email, setEmail] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setLoading(true);
        const formData = new FormData();
        formData.append("email", email);

        try {
            const response = await axios.post(`${API_BASE_URL}/send-reset-link`, formData, { });
            if (response){
                setShowPopup(true);
            } else {
                throw "Error sending email"
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setErrorMessage("Email Not Registered");
            } else {
                setErrorMessage("An error occurred during the process.");
            }
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            className="min-h-screen overflow-hidden flex flex-col bg-gray-50"
            initial="initial"
            animate="animate"
            variants={fadeIn}
        >
            <Navbar />

            <div className="flex flex-1 relative">
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
                    className="relative z-10 w-full md:w-1/2 flex items-center justify-center min-h-screen py-16 sm:py-20 px-4 sm:px-6"
                    variants={slideUp}
                >
                    <motion.div
                        className="bg-white/80 backdrop-blur-lg p-4 sm:p-8 shadow-xl rounded-xl w-full max-w-md mx-auto border border-white/20"
                        variants={formFieldVariants}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {errorMessage && (
                            <motion.div 
                                className="bg-red-50 text-red-600 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {errorMessage}
                            </motion.div>
                        )}
                        
                        <motion.h2 
                            className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800"
                            variants={formFieldVariants}
                        >
                            Reset Password
                        </motion.h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                            <motion.div variants={formFieldVariants}>
                                <label className="block text-gray-700 text-sm font-medium mb-1 sm:mb-2" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                />
                            </motion.div>

                            <motion.button
                                type="submit"
                                className="w-full bg-indigo-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </motion.button>

                            <motion.div 
                                className="text-center mt-4 sm:mt-6"
                                variants={formFieldVariants}
                            >
                                <Link 
                                    to="/" 
                                    className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors text-xs sm:text-sm"
                                >
                                    Back to Login
                                </Link>
                            </motion.div>
                        </form>
                    </motion.div>
                </motion.div>
            </div>

            {showPopup && (
                <motion.div 
                    className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div 
                        className="bg-white/90 backdrop-blur-lg p-4 sm:p-8 rounded-xl shadow-xl max-w-md w-full border border-white/20"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 100 }}
                    >
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">Reset Email Sent!</h2>
                        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Please check your email for the password reset link.</p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                            <motion.a
                                href="https://mail.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-indigo-700 transition-colors text-center text-sm sm:text-base"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Open Gmail
                            </motion.a>
                            <motion.button
                                className="bg-gray-800 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-900 transition-colors text-sm sm:text-base"
                                onClick={() => navigate('/')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Back to Login
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ForgetPassword;