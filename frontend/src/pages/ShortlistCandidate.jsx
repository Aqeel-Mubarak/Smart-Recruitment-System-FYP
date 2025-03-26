import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Navbarapp from '../components/Navbarapp';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, FileText, LineChart, RefreshCw, Search, FileSpreadsheet, X } from 'lucide-react';

// Import Recharts components for the vertical bar chart
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

// Helper function to render analysis text with bold headings on separate lines.
const renderAnalysisText = (analysis) => {
  return analysis.split('\n').map((line, index) => {
    if (line.startsWith('**') && line.indexOf('**', 2) !== -1) {
      const closingIndex = line.indexOf('**', 2);
      const heading = line.substring(2, closingIndex);
      const rest = line.substring(closingIndex + 2);
      return (
        <p key={index} className="m-0">
          <strong>{heading}</strong>{rest}
        </p>
      );
    } else {
      return <p key={index} className="m-0">{line}</p>;
    }
  });
};

// Modified computeDistribution function that accepts a field parameter.
const computeDistribution = (candidates, field = 'score') => {
  const dist = {
    'Below 40': 0,
    '40-50': 0,
    '50-60': 0,
    '60-70': 0,
    '70-80': 0,
    'Above 80': 0,
  };
  candidates.forEach(candidate => {
    const value = Number(candidate[field]);
    if (isNaN(value)) return;
    if (value < 40) dist['Below 40']++;
    else if (value < 50) dist['40-50']++;
    else if (value < 60) dist['50-60']++;
    else if (value < 70) dist['60-70']++;
    else if (value < 80) dist['70-80']++;
    else dist['Above 80']++;
  });
  return dist;
};

// Define bar colors for each score range.
const barColors = {
  'Below 40': '#f56565',    // red-500
  '40-50': '#ed8936',       // orange-500
  '50-60': '#ecc94b',       // yellow-500
  '60-70': '#48bb78',       // green-500
  '70-80': '#4299e1',       // blue-500
  'Above 80': '#9f7aea'      // purple-500
};

// Transformation function for range labels: Replace "Below 40" with "<40" and "Above 80" with "80<"
const transformRangeLabel = (label) => {
  if (label === "Below 40") return "<40";
  if (label === "Above 80") return "80<";
  return label;
};

const ShortlistCandidate = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [jobs, setJobs] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hiringmanagerid, setHiringmanagerid] = useState(null);
  const [checkedCandidates, setCheckedCandidates] = useState(new Set());
  const [URL, setURL] = useState(null);
  const [Type, setType] = useState(null);
  const [downloaded, setDownloaded] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [analyzing, setAnalyzing] = useState(false); // New state for analyzing
  const [filterComplete, setFilterComplete] = useState(false);

  // State for analysis modal
  const [analysisModal, setAnalysisModal] = useState({
    isOpen: false,
    type: null,
    result: null,
    candidateName: null,
    loading: false
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId"); 
  console.log(jobId);
  
  // Preselect default job if passed via location.state.
  useEffect(() => {
    if (location.state && location.state.selectedJob) {
      setSelectedOption(location.state.selectedJob);
    } else if (jobId && jobs.length > 0) {
      const job = jobs.find(job => job.value == jobId);
      if (job) {
        setSelectedOption(job);
      }
    }
  }, [location.state, jobId, jobs]);

  // Fetch hiring manager ID.
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    axios
      .get(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setHiringmanagerid(response.data.id))
      .catch((error) => console.error(error));
  }, [API_BASE_URL]);

  // Fetch job descriptions and auto-select a default.
  useEffect(() => {
    if (!hiringmanagerid) return;
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/get_job_description`, {
          params: { hiringmanagerid },
        });
        const jobsData = response.data.jobs.map((job) => ({
          value: job.id,
          label: job.title,
          description: job.description_text,
        }));
        setJobs(jobsData);
        if (!selectedOption && jobsData.length > 0) {
          setSelectedOption(jobsData[0]);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };
    fetchJobs();
  }, [hiringmanagerid, API_BASE_URL]);

  // Automatically fetch candidates when a job is selected.
  useEffect(() => {
    if (selectedOption) {
      fetchCandidates();
    }
  }, [selectedOption]);

  // Fetch candidates for the selected job.
  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token || !selectedOption) {
        console.error('No access token or job selected');
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/candidates`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { job_description_id: selectedOption.value },
      });
      const shortlistedCandidates = response.data.map((candidate) => ({
        ...candidate,
        rank: candidate.rank || 'N/A',
        prompt_score: candidate.prompt_score,
        promptAnalysis: null,
        jobAnalysis: null,
        loadingPrompt: false,
        loadingJob: false,
      }));
      setCandidates(shortlistedCandidates);
      setFilteredCandidates(shortlistedCandidates);
      setCheckedCandidates(new Set());
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  // Filter candidates based on specific requirements.
  const handlePromptSearch = async () => {
    if (!prompt.trim() || !selectedOption) return;
    setAnalyzing(true); 
    setFilterComplete(false); // Reset filter status when starting new search

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found in local storage');
        return;
      }
      const response = await axios.post(
        `${API_BASE_URL}/filter_candidates`,
        { prompt, job_description_id: selectedOption.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const filteredResults = response.data.map((candidate) => ({
        ...candidate,
        promptAnalysis: null,
        jobAnalysis: null,
        loadingPrompt: false,
        loadingJob: false,
      }));
      setFilteredCandidates(filteredResults);
      setActiveFilter(prompt);
      setPrompt('');
      setFilterComplete(true); // Set filter as complete on success
    } catch (error) {
      console.error('Error filtering candidates:', error);
      alert("Error filtering candidates. Please try again.");
      setFilterComplete(false);
    } finally {
      setAnalyzing(false); 
    }
  };

  // Handle analysis view
  const handleViewAnalysis = async (candidateId, resumeText, type) => {
    setAnalysisModal({
      isOpen: true,
      type,
      result: null,
      candidateName: filteredCandidates.find(c => c.id === candidateId)?.name,
      loading: true
    });

    try {
      const response = await axios.post(
        `${API_BASE_URL}/analyze_candidate`,
        {
          candidate_id: candidateId,
          resume_text: resumeText,
          analysis_type: type,
          prompt: type === "prompt" ? activeFilter : "",
          job_description_id: type === "job" && selectedOption ? selectedOption.value : null,
        }
      );

      setAnalysisModal(prev => ({
        ...prev,
        result: response.data.analysis,
        loading: false
      }));
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setAnalysisModal(prev => ({
        ...prev,
        result: 'Error analyzing resume. Please try again.',
        loading: false
      }));
    }
  };

  // Remove active prompt filter.
  const removeFilter = async () => {
    setActiveFilter("");
    setFilterComplete(false);
    setFilteredCandidates([]);
    // Reload candidates for current job
    if (selectedOption) {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `${API_BASE_URL}/get_candidates/${selectedOption.value}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch candidates");
        }
        const data = await response.json();
        setFilteredCandidates(data);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      }
    }
  };

  // Toggle checkbox selection.
  const handleCheckboxChange = (candidateId) => {
    setCheckedCandidates((prev) => {
      const newChecked = new Set(prev);
      if (newChecked.has(candidateId)) {
        newChecked.delete(candidateId);
      } else {
        newChecked.add(candidateId);
      }
      return newChecked;
    });
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (checkedCandidates.size === filteredCandidates.length) {
      // If all are selected, clear the selection
      setCheckedCandidates(new Set());
    } else {
      // Otherwise, select all candidates
      const allIds = new Set(filteredCandidates.map(candidate => candidate.id));
      setCheckedCandidates(allIds);
    }
  };

  // Schedule interview for selected candidates.
  const handleEmail = async () => {
    if (!selectedOption || !selectedOption.value) {
      alert("Please select a job first");
      return;
    }
    if (checkedCandidates.size === 0) {
      alert("Please select at least one candidate");
      return;
    }
    
    const jobid = selectedOption.value;
    const token = localStorage.getItem('accessToken');
    
    try {
      // First, update the status of selected candidates to 'shortlisted'
      await axios.post(
        `${API_BASE_URL}/update_candidates_status`,
        {
          candidate_ids: Array.from(checkedCandidates),
          job_description_id: jobid
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      // Continue with existing email functionality
      const encryptResponse = await axios.post(`${API_BASE_URL}/encryptid`, {
        value: [hiringmanagerid, jobid],
      });
      
      const encodedhiringmanagerid = encryptResponse.data.encodedlst[0];
      const encodedjobid = encryptResponse.data.encodedlst[1];
      const isManagement = false;
      const linkkk = `http://207.180.240.67/Calendar/${isManagement}/${jobid}`;
      
      const selectedCandidates = candidates
        .filter(candidate => checkedCandidates.has(candidate.id))
        .map(candidate => ({
          id: candidate.id,
          email: candidate.email,
        }));
        
      await axios.post(`${API_BASE_URL}/send_email`, {
        to_email: selectedCandidates,
        subject: "Job Application Update",
        body: `
          <html>
            <body>
              <p>We are excited to invite you to interview for the role at our company.<br>Please click the link below to schedule your interview at a time that works best for you:</p>
              <p>We look forward to meeting with you and discussing your experience.<br>If you have any questions or need assistance, feel free to reach out.<br>Looking forward to speaking with you soon!</p>
              <p>Best regards,<br>The Hiring Team</p>
            </body>
          </html>
        `,
        linkkk,
        encodedhiringmanagerid,
        encodedjobid,
      });
      
      alert("Emails sent successfully!");
      
      // Refresh the candidates list to show updated status
      await fetchCandidates();
      
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("Failed to shortlist candidates and send emails.");
    }
  };
  // Custom styles for react-select.
  const customSelectStyles = {
    control: (base) => ({
      ...base,
      height: '45px',
      borderRadius: '8px',
      borderColor: '#E2E8F0',
      '&:hover': {
        borderColor: '#CBD5E0',
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#718096',
    }),
  };

  // Compute candidate score distribution.
  const distribution = computeDistribution(filteredCandidates, 'score');
  const maxCountValue = Math.max(...Object.values(distribution), 1);
  const graphTitle = "Job Relevancy Score";

  // Transform distribution for the Recharts vertical bar chart.
  const chartData = Object.entries(distribution).map(([range, count]) => ({
    range: transformRangeLabel(range),
    count,
  }));

  const handleViewResume = async (candidate) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/signed-url?id=${candidate.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to sign URL');
      }

      const data = await response.json();
      console.log(data.url);
      setURL(data.url);
      setType(data.type);
      setShowPopup(true);

    } catch (error) {
      console.error('Error signing jobs:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-white">
      <Navbarapp />

      <motion.aside 
        className="fixed left-0 top-16 w-[19%] h-screen overflow-y-auto overflow-x-hidden bg-white/80 backdrop-blur-lg shadow-lg z-40"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <Sidebar />
      </motion.aside>

      <motion.main 
        className="ml-[19%] mt-16 p-6 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
          <h1 className="font-bold text-2xl text-gray-800">Shortlist Candidates</h1>
        </div>

        {/* Top Row: Job Title/Description & Chart/Filtering */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Left Column (≈60%): Job Title, Description & Requirement Filter */}
          <div className="w-full md:w-3/5 space-y-4">
            {/* Job Title Label and Dropdown */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                styles={{
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
                  menu: base => ({
                    ...base,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '0.75rem',
                    border: '1px solid #E2E8F0'
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? '#4F46E5' : state.isFocused ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                    color: state.isSelected ? 'white' : '#1F2937'
                  })
                }}
                options={jobs}
                value={selectedOption}
                onChange={(option) => setSelectedOption(option)}
                placeholder="Select a job..."
              />
            </div>
            {/* Job Description Label and Field */}
            <div>
              <textarea
                readOnly
                value={selectedOption ? selectedOption.description : ''}
                placeholder="Job description will appear here..."
                className="w-full h-32 p-4 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>
            {/* Specific Requirement Input & Filter Button */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter your specific requirements"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1 h-11 px-4 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={handlePromptSearch}
                  disabled={analyzing}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Candidates"
                  )}
                </button>
              </div>
              {filterComplete && activeFilter && (
                <div className="flex items-center gap-2 bg-indigo-50 p-3 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Active Filter:</p>
                    <p className="text-indigo-700">{activeFilter}</p>
                  </div>
                  <button
                    onClick={async () => {
                      setActiveFilter("");
                      setFilterComplete(false);
                      setFilteredCandidates([]);
                      // Reload candidates for current job
                      if (selectedOption) {
                        try {
                          const token = localStorage.getItem("accessToken");
                          const response = await fetch(
                            `${API_BASE_URL}/get_candidates/${selectedOption.value}`,
                            {
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );
                          if (!response.ok) {
                            throw new Error("Failed to fetch candidates");
                          }
                          const data = await response.json();
                          setFilteredCandidates(data);
                        } catch (error) {
                          console.error("Error fetching candidates:", error);
                        }
                      }
                    }}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (≈40%): Vertical Bar Chart */}
          <div className="w-full md:w-2/5">
            <div className="h-full p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">{graphTitle}</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[Object.keys(barColors)[index]]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Row: Candidate Table */}
        <motion.div 
          layout
          className="bg-white/80 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden border border-gray-100"
        >
          <AnimatePresence mode="wait">
            {!filteredCandidates.length ? (
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-indigo-600 text-white">
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={checkedCandidates.size === filteredCandidates.length}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-white/30 bg-white/10 text-white focus:ring-0 focus:ring-offset-0"
                          />
                          <span className="text-sm font-semibold">Candidate</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Score</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Match</th>
                      {filterComplete && (
                        <th className="px-6 py-4 text-left text-sm font-semibold">Prompt Rank</th>
                      )}
                      <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-transparent">
                    {filteredCandidates.map((candidate, index) => (
                      <motion.tr 
                        key={candidate.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-indigo-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              checked={checkedCandidates.has(candidate.id)}
                              onChange={() => handleCheckboxChange(candidate.id)}
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{candidate.name}</p>
                              <p className="text-sm text-gray-500">{candidate.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {candidate.score}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            candidate.score >= 60
                              ? 'bg-green-100 text-green-800'
                              : candidate.score >= 50
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {candidate.score >= 60
                              ? 'High Match'
                              : candidate.score >= 50
                              ? 'Medium Match'
                              : 'Low Match'}
                          </span>
                        </td>
                        {filterComplete && (
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              #{candidate.rank || 'N/A'}
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleViewResume(candidate)}
                              className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                            >
                              <FileText className="w-4 h-4" />
                              View Resume
                            </button>
                            <button
                              onClick={() => handleViewAnalysis(candidate.id, candidate.resume_text, "job")}
                              className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                            >
                              <LineChart className="w-4 h-4" />
                              Job Analysis
                            </button>
                            {filterComplete && (
                              <button
                                onClick={() => handleViewAnalysis(candidate.id, candidate.resume_text, "prompt")}
                                className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                              >
                                <LineChart className="w-4 h-4" />
                                Prompt Analysis
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Schedule Interview Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleEmail}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            Schedule Interview
          </button>
        </div>
      </motion.main>

      {(showPopup && URL && Type === "pdf") && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-[80%] h-[80%]">
            <button className="bg-red-500 text-white px-2 py-1 rounded mb-2" onClick={() => setShowPopup(false)}>Close</button>
            <iframe src={URL} allow="fullscreen" className="w-full h-full" title="Resume" />
          </div>
        </div>
      )}
      {showPopup && URL && (Type === "doc/docx") && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[80%] max-w-md text-center">
            {!downloaded ? (
              <>
                <h1 className="text-lg font-semibold mb-4">
                  Preview of this resume is not available. Click the button below to download the resume.
                </h1>
                {/* Buttons in a row */}
                <div className="flex justify-center gap-4 mt-4">
                  <a
                    href={URL}
                    download
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={() => setDownloaded(true)}
                  >
                    Download Resume
                  </a>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    onClick={() => {
                      setShowPopup(false);
                      setDownloaded(false);
                    }}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-lg font-semibold text-green-600 mb-4">
                  The resume is downloaded. Check your downloads folder to view it.
                </h1>
                {/* Show only the Close button */}
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => {
                    setShowPopup(false);
                    setDownloaded(false);
                  }}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      {analysisModal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-6 max-w-2xl w-full mx-4"
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {analysisModal.type === 'job' ? 'Job Analysis' : 'Prompt Analysis'}
                </h2>
                <p className="text-gray-500 mt-1">
                  Analysis for {analysisModal.candidateName}
                </p>
              </div>
              <button
                onClick={() => setAnalysisModal(prev => ({ ...prev, isOpen: false }))}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Close
              </button>
            </div>
            
            <div className="space-y-4">
              {analysisModal.loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                  <p className="text-gray-600 font-medium">Analyzing resume...</p>
                  <p className="text-gray-500 text-sm">This may take a few moments</p>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-white to-indigo-50/50 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <LineChart className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Analysis Results</h3>
                      <p className="text-sm text-gray-500">
                        {analysisModal.type === 'job' 
                          ? 'Evaluation based on job requirements'
                          : 'Evaluation based on specific prompt'}
                      </p>
                    </div>
                  </div>
                  <div className="prose prose-indigo max-w-none">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {analysisModal.result}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ShortlistCandidate;
