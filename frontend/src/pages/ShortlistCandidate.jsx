import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbarapp from '../components/Navbarapp';       // Your existing Navbar component
import Sidebar from '../components/Sidebar';     // Your existing Sidebar component
import axios from 'axios';
import Select from "react-select";

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

// Transformation function for range labels: Replace "Below 40" with ">40" and "Above 80" with "80<"
const transformRangeLabel = (label) => {
  if (label === "Below 40") return ">40";
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

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();

  // Preselect default job if passed via location.state.
  useEffect(() => {
    if (location.state && location.state.selectedJob) {
      setSelectedOption(location.state.selectedJob);
    }
  }, [location.state]);

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
        // Assume candidate.score is the Job Description Score,
        // candidate.rank is always used for the table's Rank column,
        // and candidate.prompt_score (with underscore) holds the Requirement Score (when filtered).
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
    } catch (error) {
      console.error('Error filtering candidates:', error);
    }
  };

  // Generate analysis for a candidate.
  const handleViewAnalysis = async (candidateId, resumeText, analysisType) => {
    setFilteredCandidates((prev) =>
      prev.map((candidate) => {
        if (candidate.id === candidateId) {
          return analysisType === "prompt"
            ? { ...candidate, loadingPrompt: true }
            : { ...candidate, loadingJob: true };
        }
        return candidate;
      })
    );
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('No access token found in local storage');
      return;
    }
    const payload = {
      candidate_id: candidateId,
      resume_text: resumeText,
      analysis_type: analysisType,
      prompt: analysisType === "prompt" ? activeFilter : "",
      job_description_id: analysisType === "job" && selectedOption ? selectedOption.value : null,
    };
    try {
      const response = await axios.post(
        `${API_BASE_URL}/analyze_candidate`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFilteredCandidates((prev) =>
        prev.map((candidate) => {
          if (candidate.id === candidateId) {
            return analysisType === "prompt"
              ? { ...candidate, promptAnalysis: response.data.analysis, loadingPrompt: false }
              : { ...candidate, jobAnalysis: response.data.analysis, loadingJob: false };
          }
          return candidate;
        })
      );
    } catch (error) {
      console.error('Error generating analysis:', error);
      setFilteredCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === candidateId
            ? analysisType === "prompt"
              ? { ...candidate, loadingPrompt: false }
              : { ...candidate, loadingJob: false }
            : candidate
        )
      );
    }
  };

  // Remove active prompt filter.
  const removeFilter = () => {
    setActiveFilter('');
    setFilteredCandidates(candidates);
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
    try {
      const token = localStorage.getItem('accessToken');
      const encryptResponse = await axios.post(`${API_BASE_URL}/encryptid`, {
        value: [hiringmanagerid, jobid],
      });
      const encodedhiringmanagerid = encryptResponse.data.encodedlst[0];
      const encodedjobid = encryptResponse.data.encodedlst[1];
      const linkkk = `http://207.180.240.67/Calendar`;
      const selectedCandidates = candidates
        .filter(candidate => checkedCandidates.has(candidate.id))
        .map(candidate => ({
          id: candidate.id,
          email: candidate.email,
        }));
      await axios.post(`${API_BASE_URL}/send_email`, {
        to_email: selectedCandidates,
        subject: "Job Application Update",
        body: `Hello, this is to inform you about the status of your application.`,
        linkkk,
        encodedhiringmanagerid,
        encodedjobid,
      });
      alert("Email sent successfully!");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("Failed to send email.");
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
  // When activeFilter is applied, use candidate.prompt_score; otherwise, use candidate.score.
  const distribution = computeDistribution(filteredCandidates, activeFilter ? 'prompt_score' : 'score');
  const maxCountValue = Math.max(...Object.values(distribution), 1);
  const graphTitle = activeFilter ? "Job Requirement Score" : "JOB Discription Score";

  // Transform distribution for the Recharts vertical bar chart.
  const chartData = Object.entries(distribution).map(([range, count]) => ({
    range: transformRangeLabel(range),
    count,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Static Navbar */}
      <Navbarapp />

      {/* Working Window: Only this area scrolls */}
      <div className="flex flex-1 pt-20 overflow-auto">
        {/* Fixed Sidebar */}
        <aside className="fixed left-0 top-20 w-[20%] h-screen overflow-y-auto overflow-x-hidden bg-white shadow-lg">
          <Sidebar />
        </aside>

        {/* Main Content Area: Offset by sidebar width */}
        <main className="ml-[20%] w-[80%] p-6 space-y-6">
          {/* Top Row: Job Title/Description & Chart/Filtering */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column (≈75%): Job Title, Description & Requirement Filter */}
            <div className="w-full md:w-3/4 space-y-4">
              {/* Job Title Label and Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <Select
                  styles={customSelectStyles}
                  options={jobs}
                  value={selectedOption}
                  onChange={(option) => {
                    setSelectedOption(option);
                  }}
                  placeholder="Select a job..."
                />
              </div>
              {/* Job Description Label and Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                <textarea
                  readOnly
                  value={selectedOption ? selectedOption.description : ''}
                  placeholder="Job description will appear here..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm h-32 p-2 resize-none overflow-y-auto"
                />
              </div>
              {/* Specific Requirement Input & Filter Button */}
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Enter your specific requirements"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1 p-3 border rounded"
                />
                <button
                  onClick={handlePromptSearch}
                  className="bg-black text-white px-4 py-2 rounded"
                >
                  Filter Candidates
                </button>
              </div>
            </div>

            {/* Right Column (≈25%): Vertical Bar Chart */}
            <div className="w-full md:w-2/4">
              <div className="rounded-lg shadow p-4 h-64">
                <h2 className="text-2xl font-bold text-center mb-2">{graphTitle}</h2>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="range" 
                      label={{ value: "Score Range", position: "insideBottom", offset: -3, fill: "#000", fontWeight: "bold", fontSize: 14 }} 
                    />
                    <YAxis 
                      allowDecimals={false}
                      label={{ value: "Candidates", angle: -90, position: "insideLeft", fill: "#000", fontWeight: "bold", fontSize: 14 }}
                    />
                    <Tooltip />
                    <Bar dataKey="count">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[entry.range]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Row: Candidate Table */}
          <div className="bg-white rounded-lg shadow p-6">
            {activeFilter && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Active Filter:</h3>
                <div className="flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {activeFilter}
                    <button
                      onClick={removeFilter}
                      className="hover:bg-purple-200 rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </span>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="table-fixed w-full border-collapse">
                <thead>
                  <tr className="bg-purple-800 text-white">
                    <th className="border p-3 w-12"></th>
                    <th className="border p-3 text-left">Name</th>
                    <th className="border p-3 text-left">Job Description Score</th>
                    <th className="border p-3 text-left">Rank</th>
                    <th className="border p-3 text-left">Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center p-3 text-gray-500">
                        No candidates found based on your requirements.
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((candidate) => (
                      <tr
                        key={candidate.id}
                        className="bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                      >
                        <td className="border p-3 text-center">
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-green-600"
                            checked={checkedCandidates.has(candidate.id)}
                            onChange={() => handleCheckboxChange(candidate.id)}
                          />
                        </td>
                        <td className="border p-3">{candidate.name}</td>
                        <td className="border p-3">{candidate.score || 'N/A'}%</td>
                        <td className="border p-3">{candidate.rank || 'N/A'}%</td>
                        <td className="border p-3 text-sm">
                          <div className="flex flex-col gap-2">
                            {!candidate.promptAnalysis && (
                              <button
                                className="bg-blue-500 text-white px-2 py-1 text-sm rounded hover:bg-blue-700 transition"
                                onClick={() =>
                                  handleViewAnalysis(candidate.id, candidate.resume_text, "prompt")
                                }
                              >
                                View Prompt Analysis
                              </button>
                            )}
                            {!candidate.jobAnalysis && (
                              <button
                                className="bg-blue-500 text-white px-2 py-1 text-sm rounded hover:bg-blue-700 transition"
                                onClick={() =>
                                  handleViewAnalysis(candidate.id, candidate.resume_text, "job")
                                }
                              >
                                View Job Analysis
                              </button>
                            )}
                          </div>
                          {candidate.loadingPrompt && (
                            <p className="mt-2 text-sm">Loading Prompt Analysis...</p>
                          )}
                          {candidate.loadingJob && (
                            <p className="mt-2 text-sm">Loading Job Analysis...</p>
                          )}
                          {candidate.promptAnalysis && (
                            <div className="mt-2">
                              <p className="font-bold text-sm">Prompt Analysis:</p>
                              {renderAnalysisText(candidate.promptAnalysis)}
                            </div>
                          )}
                          {candidate.jobAnalysis && (
                            <div className="mt-2">
                              <p className="font-bold text-sm">Job Analysis:</p>
                              {renderAnalysisText(candidate.jobAnalysis)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Schedule Interview Button */}
          <div>
            <button
              onClick={handleEmail}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Schedule Interview
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ShortlistCandidate;
