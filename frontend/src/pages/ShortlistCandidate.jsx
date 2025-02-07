import React, { useState, useEffect } from 'react';
import Navbarapp from '../components/Navbarapp';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from "react-select";

const ShortlistCandidate = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [jobs, setJobs] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hiringmanagerid, setHiringmanagerid] = useState();
  const [checkedCandidates, setCheckedCandidates] = useState(new Set());
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  // Helper function to render analysis text with bold headings on separate lines
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

  // Fetch hiring manager ID
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    axios.get(`${API_BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => setHiringmanagerid(response.data.id))
    .catch((error) => console.error(error));
  }, []);

  // Fetch job descriptions including the full job description (description_text)
  useEffect(() => {
    if (!hiringmanagerid) return;
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/get_job_description`, {
          params: { hiringmanagerid },
        });
        // Assume API returns jobs with: id, title, description_text
        setJobs(
          response.data.jobs.map((job) => ({
            value: job.id,
            label: job.title.charAt(0).toUpperCase() + job.title.slice(1),
            description: job.description_text,
          }))
        );
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };
    fetchJobs();
  }, [hiringmanagerid]);

  // Handle checkbox changes
  const handleCheckboxChange = (candidateId) => {
    setCheckedCandidates(prev => {
      const newChecked = new Set(prev);
      if (newChecked.has(candidateId)) {
        newChecked.delete(candidateId);
      } else {
        newChecked.add(candidateId);
      }
      return newChecked;
    });
  };

  // Fetch candidates for the selected job description
  const handleForward = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found in local storage');
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/candidates`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { job_description_id: selectedOption.value },
      });
      const shortlistedCandidates = response.data.map((candidate) => ({
        ...candidate,
        rank: 'Give your req to show rank',
        // Initialize analysis fields and separate loading flags
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

  // Filter candidates by prompt
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

  // Generate analysis for a specific candidate.
  // analysisType ("prompt" or "job") is passed.
  const handleViewAnalysis = async (candidateId, resumeText, analysisType) => {
    // Set the appropriate loading flag
    setFilteredCandidates(prev =>
      prev.map(candidate => {
        if (candidate.id === candidateId) {
          if (analysisType === "prompt") {
            return { ...candidate, loadingPrompt: true };
          } else {
            return { ...candidate, loadingJob: true };
          }
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
      // For job-based analysis, send the job_description_id
      job_description_id: analysisType === "job" && selectedOption ? selectedOption.value : null,
    };
    try {
      const response = await axios.post(
        `${API_BASE_URL}/analyze_candidate`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update candidate with the corresponding analysis and clear its loading flag
      setFilteredCandidates(prev =>
        prev.map(candidate => {
          if (candidate.id === candidateId) {
            if (analysisType === "prompt") {
              return { ...candidate, promptAnalysis: response.data.analysis, loadingPrompt: false };
            } else {
              return { ...candidate, jobAnalysis: response.data.analysis, loadingJob: false };
            }
          }
          return candidate;
        })
      );
    } catch (error) {
      console.error('Error generating analysis:', error);
      setFilteredCandidates(prev =>
        prev.map(candidate =>
          candidate.id === candidateId
            ? analysisType === "prompt"
              ? { ...candidate, loadingPrompt: false }
              : { ...candidate, loadingJob: false }
            : candidate
        )
      );
    }
  };

  const removeFilter = () => {
    setActiveFilter('');
    setFilteredCandidates(candidates);
  };

  // Modified email function to only send to checked candidates
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
      const response = await axios.post(`${API_BASE_URL}/encryptid`, {
        value: [hiringmanagerid, jobid],
      });
      const encodedhiringmanagerid = response.data.encodedlst[0];
      const encodedjobid = response.data.encodedlst[1];
      const linkkk = `http://207.180.240.67/Calendar`;
      const selectedCandidates = candidates
        .filter(candidate => checkedCandidates.has(candidate.id))
        .map(candidate => ({
          id: candidate.id,
          email: candidate.email,
        }));
      const emailResponse = await axios.post(`${API_BASE_URL}/send_email`, {
        to_email: selectedCandidates,
        subject: "Job Application Update",
        body: `Hello, this is to inform you about the status of your application.`,
        linkkk: linkkk,
        encodedhiringmanagerid: encodedhiringmanagerid,
        encodedjobid: encodedjobid,
      });
      console.log("Email sent successfully:", emailResponse.data);
      alert("Email sent successfully!");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("Failed to send email.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbarapp />
      <div className="flex" style={{ marginTop: '4rem', minHeight: '100vh' }}>
        <Sidebar className="h-full" />
        <div className="md:ml-8 p-4 md:p-8 flex-grow bg-gray-100">
          <h1
            className="text-3xl md:text-4xl text-center mb-6 md:mb-8 font-bold"
            style={{ color: '#800080' }}
          >
            ShortList Candidates
          </h1>
          <div className="flex items-center w-full my-4">
            <Select
              className="w-[75%] border-2 mx-10 text-3xl border-black rounded-lg"
              options={jobs}
              onChange={(option) => setSelectedOption(option)}
              placeholder="Select a job..."
            />
            <button
              onClick={handleForward}
              className="border-2 border-black md:py-3 max-w-lg mx-10 px-6 py-2 rounded-lg"
            >
              Select
            </button>
          </div>
          <div className="flex flex-col md:flex-row mb-6 md:mb-8 justify-center space-y-4 md:space-y-0 md:space-x-4">
            <input
              type="text"
              placeholder="Enter your specific requirements"
              className="w-full max-w-lg p-3 ml-10 border-2 rounded-lg"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              className="bg-black text-white px-12 md:px-24 py-3 rounded-lg transition hover:bg-indigo-700"
              onClick={handlePromptSearch}
            >
              Analyze Candidates
            </button>
          </div>
          {activeFilter && (
            <div className="mb-6 ml-10">
              <h3 className="text-lg font-semibold mb-2">Active Filter:</h3>
              <div className="flex items-center gap-2">
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {activeFilter}
                  <button
                    onClick={removeFilter}
                    className="hover:bg-purple-200 rounded-full w-5 h-5 flex items-center justify-center ml-1"
                  >
                    ×
                  </button>
                </span>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-purp text-white" style={{ backgroundColor: '#800080' }}>
                  <th className="border p-3 text-left"></th>
                  {/* Reduced width for Name column */}
                  <th className="border p-3 text-left w-1/4">Name</th>
                  <th className="border p-3 text-left">Job  Relevancy Score</th>
                  <th className="border p-3 text-left">Prompt Relevancy Rank</th>
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
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-green-600"
                          checked={checkedCandidates.has(candidate.id)}
                          onChange={() => handleCheckboxChange(candidate.id)}
                        />
                      </td>
                      <td className="border p-3">{candidate.name}</td>
                      <td className="border p-3">{candidate.score || 'N/A'}%</td>
                      <td className="border p-3">{candidate.rank || 'N/A'}</td>
                      <td className="border p-3 text-sm">
                        <div className="flex flex-col gap-2">
                          {(!candidate.promptAnalysis) && (
                            <button
                              className="bg-blue-500 text-white px-2 py-1 text-sm rounded transition hover:bg-blue-700 inline-block w-auto"
                              onClick={() =>
                                handleViewAnalysis(candidate.id, candidate.resume_text, "prompt")
                              }
                            >
                              View Prompt Analysis
                            </button>
                          )}
                          {(!candidate.jobAnalysis) && (
                            <button
                              className="bg-blue-500 text-white px-2 py-1 text-sm rounded transition hover:bg-blue-700 inline-block w-auto"
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
          <div className="flex justify-center mt-8">
            <button
              className="bg-black text-white px-12 md:px-24 py-3 rounded-lg transition hover:bg-gray-800"
              onClick={handleEmail}
            >
              Schedule Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortlistCandidate;
