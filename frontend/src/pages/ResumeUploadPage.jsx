import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbarapp from "../components/Navbarapp";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Plus, RefreshCw, UserCheck, Briefcase, XCircle, PlusCircle, CheckCircle, Loader2 } from "lucide-react";

const SuccessModal = ({ onClose }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

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
            className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6"
            initial={{ rotate: 180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>

          <motion.h2
            className="text-2xl font-bold text-center mb-2 text-green-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Success!
          </motion.h2>

          <motion.p
            className="text-center text-gray-600 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Resumes uploaded successfully. Redirecting to shortlist candidates...
          </motion.p>

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
              transition={{ duration: 2.5, ease: "easeInOut" }}
            />
          </motion.div>

          <motion.button
            className="w-full py-3 px-6 rounded-lg font-medium shadow-lg bg-green-600 hover:bg-green-700 text-white focus:ring-4 focus:ring-green-300 transition-all flex items-center justify-center gap-2"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Shortlisted Candidates
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ResumeUploadPage = () => {
  const [files, setFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [jobId, setJobId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [jobDescriptionStatus, setJobDescriptionStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hiringManagerId, setHiringManagerId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Resume Upload";
  }, []);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('accessToken');
    axios.get(`${API_BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => setHiringManagerId(response.data.id))
    .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    if (!hiringManagerId) return;

    const fetchJobs = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const response = await axios.get(`${API_BASE_URL}/get_job_description`, {
          params: { hiringmanagerid: hiringManagerId },
        });
        setJobs(
          response.data.jobs.map((job) => ({
            value: job.id,
            label: job.title,
            description: job.description_text, 
          }))
        );
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, [hiringManagerId]);

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
    }
  };

  const handleJobSelect = (option) => {
    setSelectedOption(option);
    if (option) {
      setJobDescription(option.description); 
      setJobId(option.value);
    } else {
      setJobDescription('');
      setJobId(null);
    }
  };

  const handleJobDescriptionUpdate = async () => {
    if (!selectedOption || !jobDescription) {
      setJobDescriptionStatus('Please select a job and provide a description.');
      return;
    }

    setUpdateLoading(true);
    const formData = new FormData();
    formData.append("title", selectedOption.label); 
    formData.append("description", jobDescription);

    try {
      const token = localStorage.getItem("accessToken");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      await axios.put(`${API_BASE_URL}/update_job_description/${jobId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
      setJobDescriptionStatus('Job description updated successfully');
      const updatedJobsResponse = await axios.get( `${API_BASE_URL}/get_job_description`, {
        params: { hiringmanagerid: hiringManagerId },
      });
      setJobs(updatedJobsResponse.data.jobs.map((job) => ({
        value: job.id,
        label: job.title,
        description: job.description_text,
      })));
    } catch (error) {
      setJobDescriptionStatus(`Update failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleResumeUpload = async () => {
    if (files.length === 0) {
      setUploadStatus('Please select at least one file.');
      return;
    }
    if (!jobId) {
      setUploadStatus('Please select a job description first.');
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      await axios.post(`${API_BASE_URL}/upload_resume?job_description_id=${jobId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus(`Resumes uploaded successfully.`);
      setFiles([]);
      setShowSuccessModal(true);
      setTimeout(() => {
        navigate(`/shortlist-candidate?jobId=${jobId}`);
      }, 2500);
    } catch (error) {
      setUploadStatus(`Upload failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/shortlist-candidates');
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      height: '45px',
      borderRadius: '0.75rem',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      '&:hover': {
        borderColor: '#818cf8',
      },
      ...(state.isFocused && {
        borderColor: '#818cf8',
        boxShadow: '0 0 0 2px rgba(129, 140, 248, 0.2)',
      }),
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      borderRadius: '0.75rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#818cf8' : state.isFocused ? 'rgba(129, 140, 248, 0.1)' : 'transparent',
      color: state.isSelected ? 'white' : '#1f2937',
      '&:hover': {
        backgroundColor: 'rgba(129, 140, 248, 0.1)',
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#718096',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#1f2937',
    }),
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-white">
      <Navbarapp />
      
      <div className="flex h-[calc(100vh-4rem)] mt-16">
        <aside className="w-[19%] fixed left-0">
          <Sidebar />
        </aside>
        
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-[81%] ml-[19%] p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-8 h-8 text-indigo-600" />
            <h1 className="font-bold text-2xl text-gray-800">Resume Upload</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {/* Job Description Section */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-100 h-[calc(100vh-11rem)] flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-800">Job Description</h2>
              </div>

              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Job Title
                  </label>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/create-job")}
                    className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white transition-all duration-200 flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create New Job</span>
                  </motion.button>
                </div>

                <Select
                  styles={customSelectStyles}
                  options={jobs}
                  value={selectedOption}
                  onChange={handleJobSelect}
                  placeholder="Select Job Title"
                  className="mb-4"
                  isClearable
                />

                <div className="flex-1 flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description
                  </label>
                  <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl overflow-hidden">
                    <motion.textarea
                      whileFocus={{ scale: 1.005 }}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="flex-1 w-full resize-none focus:outline-none placeholder:text-gray-400 bg-transparent p-4"
                      placeholder="Select a job to view and edit its description"
                      disabled={!selectedOption}
                    />
                    <div className="px-4 pb-4">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleJobDescriptionUpdate}
                        disabled={!selectedOption || updateLoading}
                        className={`w-full py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                          !selectedOption || updateLoading
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md"
                        }`}
                      >
                        {updateLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span className="text-sm">Update Description</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {jobDescriptionStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg ${
                        jobDescriptionStatus.includes('failed') || jobDescriptionStatus.includes('Please')
                          ? 'bg-red-50 text-red-600'
                          : 'bg-green-50 text-green-600'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        jobDescriptionStatus.includes('failed') || jobDescriptionStatus.includes('Please')
                          ? 'bg-red-600'
                          : 'bg-green-600'
                      }`} />
                      {jobDescriptionStatus}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Resume Upload Section */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-100 h-[calc(100vh-11rem)] flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-800">Upload Resumes</h2>
              </div>

              <motion.div 
                whileHover={{ scale: 1.01 }}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  isDragging 
                    ? "border-indigo-400 bg-indigo-50/50" 
                    : files.length > 0
                      ? "border-green-400 bg-green-50/30"
                      : "border-indigo-200 bg-white/50 hover:border-indigo-300 hover:bg-indigo-50/30"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ 
                      y: isDragging ? -10 : 0,
                      scale: files.length > 0 ? 1.1 : isDragging ? 1.1 : 1,
                      rotate: files.length > 0 ? 360 : isDragging ? -5 : 0
                    }}
                    transition={{ 
                      type: "spring",
                      duration: 0.6,
                      bounce: 0.5
                    }}
                  >
                    <Upload className={`w-16 h-16 mb-4 transition-colors duration-300 ${
                      files.length > 0 ? 'text-green-600' : 'text-indigo-600'
                    }`} />
                  </motion.div>
                  <motion.p 
                    initial={false}
                    animate={{ 
                      scale: files.length > 0 ? [1, 1.1, 1] : 1,
                      color: files.length > 0 ? "#059669" : "#4B5563"
                    }}
                    transition={{ duration: 0.3 }}
                    className="mb-2 font-medium"
                  >
                    {files.length > 0 ? (
                      <span className="flex items-center gap-2">
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", bounce: 0.5 }}
                        >
                          ✓
                        </motion.span>
                        {files.length} {files.length === 1 ? 'file' : 'files'} selected
                      </span>
                    ) : (
                      "Drag and drop your resumes here"
                    )}
                  </motion.p>
                  <p className="text-gray-500 mb-3">or</p>
                  <label className="cursor-pointer inline-flex items-center px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium">
                    <span>Browse Files</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      multiple
                      accept=".pdf,.doc,.docx"
                    />
                  </label>
                  <p className="mt-3 text-sm text-gray-500">Supported formats: PDF, DOC, DOCX</p>
                </div>
              </motion.div>
              
              <div className="flex-1 min-h-0 mt-4">
                <AnimatePresence>
                  {files.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50/80 rounded-lg p-4 h-full"
                    >
                      <div className="text-sm font-medium text-gray-700 mb-3">Selected Files:</div>
                      <div className="space-y-2 max-h-[calc(100vh-42rem)] overflow-y-auto pr-2">
                        {Array.from(files).map((file, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{ 
                              opacity: 1, 
                              x: 0, 
                              scale: 1,
                              transition: {
                                delay: index * 0.1,
                                type: "spring",
                                bounce: 0.4
                              }
                            }}
                            exit={{ 
                              opacity: 0, 
                              x: 20, 
                              scale: 0.95,
                              transition: { duration: 0.2 }
                            }}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm"
                          >
                            <div className="flex items-center gap-2">
                              <motion.div
                                initial={{ rotate: -180, opacity: 0 }}
                                animate={{ 
                                  rotate: 0, 
                                  opacity: 1,
                                  transition: {
                                    delay: index * 0.1 + 0.2,
                                    type: "spring"
                                  }
                                }}
                              >
                                <FileText className="w-4 h-4 text-indigo-600" />
                              </motion.div>
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <span className="text-xs text-gray-400">
                                ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                            </div>
                            <motion.button 
                              whileHover={{ scale: 1.1, color: "#EF4444" }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const newFiles = Array.from(files).filter((_, i) => i !== index);
                                setFiles(new DataTransfer().files);
                                const dt = new DataTransfer();
                                newFiles.forEach(file => dt.items.add(file));
                                setFiles(dt.files);
                              }}
                              className="text-gray-400 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-4 space-y-3">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResumeUpload}
                  disabled={loading || files.length === 0}
                  className={`w-full py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg
                    ${loading || files.length === 0 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Upload {files.length} {files.length === 1 ? 'Resume' : 'Resumes'}</span>
                    </>
                  )}
                </motion.button>

                <AnimatePresence>
                  {uploadStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`mt-3 flex items-center gap-2 text-sm px-4 py-2 rounded-lg ${
                        uploadStatus.includes('failed') || uploadStatus.includes('Please')
                          ? 'bg-red-50 text-red-600'
                          : 'bg-green-50 text-green-600'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        uploadStatus.includes('failed') || uploadStatus.includes('Please')
                          ? 'bg-red-600'
                          : 'bg-green-600'
                      }`} />
                      {uploadStatus}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.main>
      </div>
      {showSuccessModal && <SuccessModal onClose={handleModalClose} />}
    </div>
  );
};

export default ResumeUploadPage;
