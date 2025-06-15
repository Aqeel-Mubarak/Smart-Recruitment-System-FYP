/**
 * Report Component
 * 
 * This component displays a comprehensive report of candidates with their details,
 * scores, and interview status. It includes filtering capabilities by job title
 * and features a responsive, animated UI with loading states.
 */

// Core React and state management imports
import React, { useState, useEffect } from "react";
// HTTP client for API requests
import axios from "axios";
// UI Components
import Navbarapp from "../components/Navbarapp";
import Sidebar from "../components/Sidebar";
// Third-party components
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
// UI Icons
import { Loader2, FileSpreadsheet, Search, AlertCircle } from "lucide-react";

function Report() {
  /**
   * State Management
   * candidates: Array of candidate objects with their details
   * jobOptions: Array of job titles for the filter dropdown
   * selectedJob: Currently selected job for filtering
   * loading: Boolean to control loading state
   */
  const [candidates, setCandidates] = useState([]);
  const [jobOptions, setJobOptions] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  /**
   * Component Initialization
   * Fetches initial data and sets page title
   */
  useEffect(() => {
    fetchJobTitles();
    fetchCandidates();
    document.title = "Report";
  }, []);

  /**
   * Fetches available job titles from the API
   * Transforms the data into the format required by react-select
   * Handles authentication and error cases
   */
  const fetchJobTitles = async () => {
    try {
      const token = localStorage.getItem("accessToken"); // Get authentication token
      if (!token) {
        throw new Error("No access token found");
      }
  
      const response = await axios.get(`${API_BASE_URL}/job_titles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Transform job data into format required by react-select
      setJobOptions(response.data.map(job => ({ 
        value: job.id,
        label: job.title 
      })));
    } catch (error) {
      console.error("Error fetching job titles:", error);
    }
  };
  
  /**
   * Fetches candidate data with optional job title filtering
   * @param {number|null} jobId - Optional job ID to filter candidates
   * Handles loading states and error cases
   */
  const fetchCandidates = async (jobId = null) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }
  
      // Add job title filter if provided
      const params = jobId ? { job_title_id: jobId } : {};
      const response = await axios.get(`${API_BASE_URL}/top_candidates`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setCandidates(response.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles job selection change in the filter dropdown
   * Updates selected job and fetches filtered candidates
   * @param {Object} selectedOption - The selected job option from react-select
   */
  const handleJobChange = selectedOption => {
    setSelectedJob(selectedOption);
    fetchCandidates(selectedOption ? selectedOption.value : null);
  };

  /**
   * Determines the appropriate background color for status badges
   * @param {string} status - Candidate's current status
   * @returns {string} Tailwind CSS class for the status badge
   */
  const getStatusColor = (status) => {
    const statusColors = {
      'pending': 'bg-yellow-500',
      'shortlisted': 'bg-green-500',
      'rejected': 'bg-red-500',
      'interviewed': 'bg-blue-500'
    };
    return statusColors[status?.toLowerCase()] || 'bg-gray-500';
  };

  return (
    // Main container with gradient background
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-white">
      <Navbarapp />
      <div className="flex pt-16 h-full">
        <Sidebar />
        {/* Main content area with fade-in animation */}
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-grow p-6 overflow-hidden"
        >
          {/* Page header with icon and title */}
          <div className="flex items-center gap-3 mb-6">
            <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
            <h1 className="font-bold text-2xl text-gray-800">Candidate's Report</h1>
          </div>

          {/* Job title filter dropdown with search icon and custom styling */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                options={jobOptions}
                value={selectedJob}
                onChange={handleJobChange}
                placeholder="Select Job Title to Filter"
                className="w-full"
                styles={{
                  // Custom styling for the select component
                  control: (base, state) => ({
                    ...base,
                    minHeight: 45,
                    paddingLeft: 35,
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '0.75rem',
                    border: state.isFocused ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                    boxShadow: state.isFocused ? '0 0 0 2px rgba(79, 70, 229, 0.1)' : 'none',
                    '&:hover': { borderColor: '#4F46E5' }
                  }),
                  // Dropdown menu styling
                  menu: base => ({
                    ...base,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '0.75rem',
                    border: '1px solid #E2E8F0'
                  }),
                  // Option styling
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? '#4F46E5' : state.isFocused ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                    color: state.isSelected ? 'white' : '#1F2937'
                  })
                }}
              />
            </div>
          </div>

          {/* Main candidates table container with glassmorphism effect */}
          <motion.div 
            layout
            className="bg-white/80 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden border border-gray-100"
          >
            {/* Dynamic content states with smooth transitions */}
            <AnimatePresence mode="wait">
              {loading ? (
                // Loading state with spinner animation
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center p-8 min-h-[200px]"
                >
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="mt-4 text-gray-600">Loading candidates...</p>
                </motion.div>
              ) : candidates.length === 0 ? (
                // Empty state message with icon
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center p-8 min-h-[200px]"
                >
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                  <p className="mt-4 text-gray-600">No candidates found</p>
                </motion.div>
              ) : (
                // Candidates data table with responsive design
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    {/* Table header with column titles */}
                    <thead>
                      <tr className="bg-indigo-600 text-white">
                        <th className="px-6 py-4 text-left text-sm font-semibold">Candidate Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">Score</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Interview</th>
                      </tr>
                    </thead>
                    {/* Table body with candidate data and staggered animations */}
                    <tbody className="divide-y divide-gray-200 bg-transparent">
                      {candidates.map((candidate, index) => (
                        <motion.tr 
                          key={candidate.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-indigo-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-gray-800">{candidate.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{candidate.email || 'N/A'}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {candidate.score || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(candidate.status)} text-white`}>
                              {candidate.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{candidate.interview_summary || 'Not Scheduled'}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
}

export default Report;