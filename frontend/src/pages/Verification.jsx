import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AccountVerification = () => {
  const { token } = useParams(); 
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    try {
      const response = await axios.get(`${API_BASE_URL}/verify/${token}`);
      setMessage(response.data.message || "Account verified successfully!");
      setTimeout(() => navigate("/"), 2000); 
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Verification failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message === "Account verified successfully!") {
      setTimeout(() => navigate("/"), 2000);
    }
  }, [message, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Account Verification</h2>
        <p className="mb-4">Click the button below to verify your account.</p>
        <button
          onClick={handleVerify}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
        {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
};

export default AccountVerification;
