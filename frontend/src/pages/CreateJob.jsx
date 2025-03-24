import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbarapp from "../components/Navbarapp";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Calendar, FileText, CheckCircle } from 'lucide-react';

function CreateJob() {
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const today = new Date();
  today.setDate(today.getDate()+1);
  const formattedToday = today.toISOString().split("T")[0];

  useEffect(() => {
    document.title = "Create Job";
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setStatus("No access token found.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", jobTitle);
    formData.append("description", jobDescription);
    formData.append("deadline", deadline);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    try {
      await axios.post(`${API_BASE_URL}/create/add_job_description`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus("Job created successfully!");
      setShowSuccess(true);
      // Wait for success animation before redirecting
      setTimeout(() => {
        navigate("/open-jobs");
      }, 2500);
    } catch (error) {
      setStatus(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const inputVariants = {
    focus: { scale: 1.02 },
    blur: { scale: 1 }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 to-white">
      <Navbarapp />

      <motion.aside 
        className="fixed left-0 top-16 w-[19%] h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden bg-white/80 backdrop-blur-lg shadow-lg z-40"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <Sidebar />
      </motion.aside>

      <motion.div 
        className="fixed top-16 left-[19%] right-0 h-[calc(100vh-4rem)] p-6 md:p-8 flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="w-full max-w-4xl bg-white/80 backdrop-blur-lg shadow-lg rounded-xl p-8 h-[calc(100vh-8rem)] overflow-hidden"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900 flex items-center justify-center gap-3"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />
            Create New Job
          </motion.h1>
          
          <form onSubmit={handleCreateJob} className="h-[calc(100%-10rem)] flex flex-col">
            <div className="space-y-4 flex-1">
              <motion.div
                variants={inputVariants}
                whileFocus="focus"
                animate="blur"
              >
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  Job Title *
                </label>
                <input
                  id="jobTitle"
                  name="title"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                  placeholder="Enter job title"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all"
                />
              </motion.div>

              <motion.div
                variants={inputVariants}
                whileFocus="focus"
                animate="blur"
              >
                <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Job Description *
                </label>
                <textarea
                  id="jobDescription"
                  name="description"
                  rows="3"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  required
                  placeholder="Enter job description"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all resize-none"
                />
              </motion.div>

              <motion.div
                variants={inputVariants}
                whileFocus="focus"
                animate="blur"
              >
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Application Deadline *
                </label>
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all"
                  min={formattedToday}
                />
              </motion.div>
            </div>

            <div className="flex justify-center items-center gap-4 mt-6">
              <motion.button
                type="submit"
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <motion.div 
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Create Job
                  </>
                )}
              </motion.button>
            </div>
          </form>

          <AnimatePresence>
            {showSuccess && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <motion.div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                />
                <motion.div
                  className="bg-white rounded-xl p-8 shadow-xl w-[90%] max-w-md relative mx-auto"
                  initial={{ scale: 0.5, opacity: 0, y: 0 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", duration: 0.5 }}
                >
                  <motion.div 
                    className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6"
                    initial={{ rotate: 180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
                  >
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </motion.div>

                  <motion.h2
                    className="text-2xl font-bold text-center text-gray-900 mb-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Success!
                  </motion.h2>

                  <motion.p
                    className="text-center text-gray-600 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Your job has been created successfully
                  </motion.p>

                  <motion.div
                    className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.div
                      className="h-full bg-green-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                  </motion.div>

                  <motion.p
                    className="text-sm text-center text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    Redirecting to jobs page...
                  </motion.p>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default CreateJob;
