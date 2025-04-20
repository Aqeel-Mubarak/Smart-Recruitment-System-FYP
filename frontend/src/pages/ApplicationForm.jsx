import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { FiUploadCloud, FiUser, FiMail, FiFileText, FiBriefcase, FiAlignLeft, FiFile, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const Modal = ({ message, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-4 text-indigo-600">Success!</h2>
          <p className="text-gray-700">{message}</p>
          <div className="flex justify-end mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              onClick={onClose}
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ApplicationForm = () => {
  const { id } = useParams(); 
  const [formData, setFormData] = useState({
    Name: "",
    email: "",
    resume: null,
  });
  const [fileName, setFileName] = useState("");
  const [job, setJob] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/get_job_by_id/${id}`);
        setJob(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Error fetching job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // Check if the screen is mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, resume: file });
      setFileName(file.name);
    }
  };

  const removeFile = () => {
    setFormData({ ...formData, resume: null });
    setFileName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage("");

    if (!formData.resume) {
      setMessage("Please upload a resume.");
      setUploading(false);
      return;
    }

    const uploadData = new FormData();
    uploadData.append("file", formData.resume);
    uploadData.append("job_description_id", id);
    try {
      const response = await axios.post(`${API_BASE_URL}/application/upload_resume`, uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage("Your application has been received successfully!");
      setShowModal(true);
      setFormData({ Name: "", email: "", resume: null });
      setFileName("");
    } catch (error) {
      setMessage(error.response?.data?.detail || "Error uploading resume");
    } finally {
      setUploading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const toggleJobDetails = () => {
    setShowJobDetails(!showJobDetails);
  };

  const formContainerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="flex bg-gradient-to-br from-indigo-50 to-white flex-col min-h-screen">
      <Navbar/>

      <div className="p-4 md:p-8 mt-20 flex flex-col md:flex-row md:h-[calc(100vh-80px)]">
        {/* Job Details Section for Mobile */}
        {isMobile && (
          <motion.div
            variants={formContainerVariants}
            initial="hidden"
            animate="visible"
            className="w-full bg-white/80 backdrop-blur-md p-4 md:p-8 rounded-xl shadow-lg mb-4"
          >
            <motion.div 
              variants={itemVariants} 
              className="flex justify-between items-center cursor-pointer"
              onClick={toggleJobDetails}
            >
              <h2 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                <FiBriefcase className="inline" />
                Job Information
              </h2>
              {showJobDetails ? <FiChevronUp /> : <FiChevronDown />}
            </motion.div>

            <AnimatePresence>
              {showJobDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {loading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-center items-center py-8"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"
                      />
                    </motion.div>
                  ) : error ? (
                    <motion.p variants={itemVariants} className="text-red-600 mt-4">{error}</motion.p>
                  ) : (
                    <>
                      <motion.div variants={itemVariants} className="mt-4 mb-4">
                        <label className="block font-medium text-sm mb-2 text-gray-700 flex items-center gap-2">
                          <FiBriefcase className="inline text-indigo-600" />
                          Job Title
                        </label>
                        <div className="p-3 rounded-lg bg-indigo-50 text-gray-800 font-medium">
                          {job?.title || "Unknown Job"}
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <label className="block font-medium text-sm mb-2 text-gray-700 flex items-center gap-2">
                          <FiAlignLeft className="inline text-indigo-600" />
                          Job Description
                        </label>
                        <div className="p-3 rounded-lg bg-indigo-50 text-gray-700 max-h-60 overflow-y-auto">
                          {job?.description_text || "No description available."}
                        </div>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Application Form */}
        <motion.div
          variants={formContainerVariants}
          initial="hidden"
          animate="visible"
          className="w-full md:w-1/2 bg-white/80 backdrop-blur-md p-4 md:p-8 rounded-xl shadow-lg space-y-4 md:mr-6 overflow-y-auto"
        >
          <motion.h2 variants={itemVariants} className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-indigo-600 flex items-center gap-2">
            <FiBriefcase className="inline" />
            Application Form
          </motion.h2>

          <motion.div variants={itemVariants} className="relative">
            <label className="block font-medium text-sm mb-2 text-gray-700 flex items-center gap-2">
              <FiUser className="inline text-indigo-600" />
              Full Name *
            </label>
            <input
              className="w-full p-3 mb-4 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              placeholder="Enter your Name"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} className="relative">
            <label className="block font-medium text-sm mb-2 text-gray-700 flex items-center gap-2">
              <FiMail className="inline text-indigo-600" />
              Email *
            </label>
            <input
              className="w-full p-3 mb-4 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block font-medium text-sm mb-2 text-gray-700 flex items-center gap-2">
              <FiFileText className="inline text-indigo-600" />
              Upload your Resume *
            </label>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="flex flex-col gap-3"
            >
              <div className={`flex items-center justify-center gap-3 cursor-pointer ${fileName ? 'bg-green-50 border-green-600' : 'bg-indigo-50 border-indigo-600'} border-2 border-dashed p-4 md:p-6 rounded-lg transition-all hover:bg-indigo-100`}>
                {!fileName ? (
                  <div className="flex flex-col md:flex-row items-center gap-2 text-center md:text-left">
                    <FiUploadCloud size={24} className="text-indigo-600" />
                    <label htmlFor="resume-upload" className="font-medium text-indigo-600 cursor-pointer">
                      Drag and drop to upload or <span className="text-indigo-700 underline">Browse</span>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 max-w-[80%]">
                      <FiFile className="text-green-600 flex-shrink-0" />
                      <span className="text-green-700 font-medium truncate">{fileName}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <FiX size={18} />
                    </motion.button>
                  </div>
                )}
                <input type="file" id="resume-upload" name="resume" onChange={handleFileChange} className="hidden" required accept=".pdf,.doc,.docx" />
              </div>
              {fileName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-green-600 flex items-center gap-1"
                >
                  <FiFileText className="inline" />
                  Resume selected successfully
                </motion.p>
              )}
            </motion.div>
          </motion.div>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full mt-6 px-6 py-3 rounded-lg text-white font-medium transition-all ${
              uploading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
            }`}
            type="submit"
            onClick={handleSubmit}
            disabled={uploading}
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Uploading...
              </div>
            ) : (
              "Submit Application"
            )}
          </motion.button>

          {message && !showModal && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 text-center ${
                message.includes("successfully") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </motion.p>
          )}
        </motion.div>

        {/* Job Information for Desktop */}
        {!isMobile && (
          <motion.div
            variants={formContainerVariants}
            initial="hidden"
            animate="visible"
            className="w-full md:w-1/2 bg-white/80 backdrop-blur-md p-4 md:p-8 rounded-xl shadow-lg overflow-y-auto"
          >
            <motion.h2 variants={itemVariants} className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-indigo-600 flex items-center gap-2">
              <FiAlignLeft className="inline" />
              Job Information
            </motion.h2>

            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center h-[calc(100%-3rem)]"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"
                />
              </motion.div>
            ) : error ? (
              <motion.p variants={itemVariants} className="text-red-600">{error}</motion.p>
            ) : (
              <>
                <motion.div variants={itemVariants} className="mb-6">
                  <label className="block font-medium text-sm mb-2 text-gray-700 flex items-center gap-2">
                    <FiBriefcase className="inline text-indigo-600" />
                    Job Title
                  </label>
                  <div className="p-4 rounded-lg bg-indigo-50 text-gray-800 font-medium">
                    {job?.title || "Unknown Job"}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block font-medium text-sm mb-2 text-gray-700 flex items-center gap-2">
                    <FiAlignLeft className="inline text-indigo-600" />
                    Job Description
                  </label>
                  <div className="p-4 rounded-lg bg-indigo-50 text-gray-700 h-[calc(100vh-22rem)] md:h-[calc(100vh-20rem)] overflow-y-auto">
                    {job?.description_text || "No description available."}
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </div>
      
      {showModal && <Modal message={message} onClose={closeModal} />}
    </div>
  );
};

export default ApplicationForm;