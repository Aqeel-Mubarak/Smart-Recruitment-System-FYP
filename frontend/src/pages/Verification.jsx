import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Mail, Loader } from 'lucide-react';

const AccountVerification = () => {
  const { token } = useParams(); 
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("pending"); // pending, success, error

  const handleVerify = async () => {
    setLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    try {
      const response = await axios.get(`${API_BASE_URL}/verify/${token}`);
      setMessage(response.data.message || "Account verified successfully!");
      setStatus("success");
      setTimeout(() => navigate("/"), 2500); 
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Verification failed. Please try again."
      );
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "success") {
      setTimeout(() => navigate("/"), 2500);
    }
  }, [status, navigate]);

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.6 }}
      >
        <motion.div 
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center"
          initial={{ rotate: -180 }}
          animate={{ rotate: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
        >
          <Mail className="w-10 h-10 text-indigo-600" />
        </motion.div>

        <motion.h2 
          className="text-2xl font-bold text-center text-gray-900 mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Account Verification
        </motion.h2>

        <motion.p 
          className="text-center text-gray-600 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Please verify your email address to continue
        </motion.p>

        {!loading && status === "pending" && (
          <motion.button
            onClick={handleVerify}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Verify Email
          </motion.button>
        )}

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              className="flex items-center justify-center gap-3 text-indigo-600 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Verifying...
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              className="text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <motion.div 
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center"
                initial={{ rotate: 180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <CheckCircle className="w-8 h-8 text-green-600" />
              </motion.div>
              <motion.p 
                className="text-green-600 font-medium mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {message}
              </motion.p>
              <motion.div
                className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  className="h-full bg-green-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </motion.div>
              <motion.p
                className="text-sm text-gray-500 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Redirecting to login...
              </motion.p>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              className="text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <motion.div 
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center"
                initial={{ rotate: 180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <XCircle className="w-8 h-8 text-red-600" />
              </motion.div>
              <motion.p 
                className="text-red-600 font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {message}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default AccountVerification;
