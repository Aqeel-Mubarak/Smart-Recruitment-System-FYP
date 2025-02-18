import React, { useState } from 'react';
import backgroundImage from '../assets/background1.jpg';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

const ForgetPassword = () => {
    const [email, setEmail] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false); // Add loading state
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();

    const handleSubmit = async () => {
        setErrorMessage("");
        setLoading(true); // Set loading to true when the request starts
        const formData = new FormData();
        formData.append("email", email);

        try {
            const response = await axios.post(`${API_BASE_URL}/send-reset-link`, formData, { });
            if (response){
                setSuccessMessage("Reset password email sent successfully!");
                setErrorMessage("");
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
            setSuccessMessage(""); // Clear any previous success message
            console.error("Error:", error);
        } finally {
            setLoading(false); // Set loading to false when the request completes
        }
    };

    return (
        <div className="h-screen flex flex-col overflow-y-auto">
            {/* Navigation Bar */}
            <Navbar />

            {/* Main Content Section */}
            <div className={`h-screen flex flex-col overflow-y-auto ${showPopup ? 'blur-sm' : ''}`}>
                {/* Full-screen Background Image */}
                <div
                    className="absolute inset-0 bg-center"
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: '100%',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                />

                {/* Left Section with Login Form */}
                <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center min-h-screen">
                    <div
                        className="bg-white p-8 shadow-lg rounded-lg max-w-sm w-full"
                        style={{
                            transform: 'scale(0.8)',
                            marginTop: '-1in',
                            marginLeft: '-1in',
                        }}
                    >
                        <p className='font-bold text-red-700'>{errorMessage}</p>
                        <h2 className="text-3xl font-bold mb-6 text-left" style={{ color: '#000000' }}>Reset Password</h2>
                        <form>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    style={{ backgroundColor: '#ffffff', color: '#333333' }}
                                />
                            </div>
                            <div className="mb-6">
                                <button
                                    className="hover:bg-gray-800 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline"
                                    type="button"
                                    onClick={handleSubmit}
                                    style={{ backgroundColor: '#000000' }}
                                    disabled={loading} // Disable the button when loading
                                >
                                    {loading ? "Sending..." : "Send Code"} {/* Show "Sending..." when loading */}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[80%] max-w-md text-center">
                        <h1 className="text-lg font-semibold mb-4">Reset Password email sent</h1>
                        <div className="flex justify-center gap-4 mt-4">
                            <a
                                href="https://mail.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Go to Gmail
                            </a>
                            <button
                                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                                onClick={() => navigate('/')}
                            >
                                Go to Login page
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForgetPassword;