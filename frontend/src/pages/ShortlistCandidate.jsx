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

  const navigate = useNavigate();

  // Fetch hiring manager ID
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    axios.get('http://127.0.0.1:8000/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => setHiringmanagerid(response.data.id))
    .catch((error) => console.error(error));
  }, []);

  // Fetch job descriptions
  useEffect(() => {
    if (!hiringmanagerid) return;

    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/get_job_description', {
          params: { hiringmanagerid },
        });

        setJobs(
          response.data.jobs.map((job) => ({
            value: job.id,
            label: job.title.charAt(0).toUpperCase() + job.title.slice(1),
          }))
        );
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, [hiringmanagerid]);

  // Fetch candidates for the selected job description
  const handleForward = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found in local storage');
        return;
      }

      const response = await axios.get('http://127.0.0.1:8000/candidates', {
        headers: { Authorization: `Bearer ${token}` },
        params: { job_description_id: selectedOption.value },
      });

      const shortlistedCandidates = response.data.map((candidate) => ({
        ...candidate,
        prompt_score: 'Give your req to show prompt score',
        analysis: null,
        loadingAnalysis: false,
      }));

      setCandidates(shortlistedCandidates);
      setFilteredCandidates(shortlistedCandidates);
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
        'http://127.0.0.1:8000/filter_candidates',
        { prompt, job_description_id: selectedOption.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const filteredResults = response.data.map((candidate) => ({
        ...candidate,
        analysis: null,
        loadingAnalysis: false,
      }));

      setFilteredCandidates(filteredResults);
      setActiveFilter(prompt);
      setPrompt('');
    } catch (error) {
      console.error('Error filtering candidates:', error);
    }
  };

  // Generate analysis for a specific candidate
  const handleViewAnalysis = async (candidateId, resumeText) => {
    try {
      setFilteredCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === candidateId
            ? { ...candidate, loadingAnalysis: true }
            : candidate
        )
      );

      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found in local storage');
        return;
      }

      const response = await axios.post(
        'http://127.0.0.1:8000/analyze_candidate',
        { candidate_id: candidateId, resume_text: resumeText, prompt: activeFilter },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFilteredCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === candidateId
            ? { ...candidate, analysis: response.data.analysis, loadingAnalysis: false }
            : candidate
        )
      );
    } catch (error) {
      console.error('Error generating analysis:', error);

      setFilteredCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === candidateId
            ? { ...candidate, loadingAnalysis: false }
            : candidate
        )
      );
    }
  };

  const removeFilter = () => {
    setActiveFilter('');
    setFilteredCandidates(candidates);
  };

  // New function for handling interview scheduling
  const handleEmail = async () => {
    if (!selectedOption || !selectedOption.value) {
      alert("Please select a job first");
      return;
    }

    const jobid = selectedOption.value;
    try {
      // First encrypt the IDs
      const response = await axios.post('http://127.0.0.1:8000/encryptid', {
        value: [hiringmanagerid, jobid]
      });

      const encodedhiringmanagerid = response.data.encodedlst[0];
      const encodedjobid = response.data.encodedlst[1];
      const linkkk = `http://localhost:5173/Calendar`;
      const linkkk1 = `http://localhost:5173/Calendar/${encodedhiringmanagerid}/${encodedjobid}`;

      // Map candidates to get their IDs and emails
      const recipientEmail = candidates.map((data) => ({
        id: data.id,
        email: data.email
      }));

      // Send the email
      const emailResponse = await axios.post("http://127.0.0.1:8000/send_email", {
        to_email: recipientEmail,
        subject: "Job Application Update",
        body: `${linkkk1} Hello, this is to inform you about the status of your application.`,
        linkkk: linkkk,
        encodedhiringmanagerid: encodedhiringmanagerid,
        encodedjobid: encodedjobid
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
          <h1 className="text-3xl md:text-4xl text-center mb-6 md:mb-8 font-bold" style={{ color: '#800080' }}>
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
              Filter Candidates
            </button>
          </div>
{/* Active Filter Display */}
{activeFilter && (
  <div className="mb-6">
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

          {/* Candidates Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-purp text-white" style={{ backgroundColor: '#800080' }}>
                  <th className="border p-3 text-left"></th>
                  <th className="border p-3 text-left">Name</th>
                  <th className="border p-3 text-left">Job Score</th>
                  <th className="border p-3 text-left">Prompt Score</th>
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
                    <tr key={candidate.id} className="bg-gray-700 text-white hover:bg-gray-600 transition-colors">
                      <td className="p-3 text-center">
                        <input type="checkbox" className="form-checkbox h-5 w-5 text-green-600" />
                      </td>
                      <td className="border p-3">{candidate.name}</td>
                      <td className="border p-3">{candidate.score || 'N/A'}%</td>
                      <td className="border p-3">{candidate.prompt_score ? Math.round(candidate.prompt_score) + '%' : 'N/A'}</td>
                      <td className="border p-3 text-sm">
                        {candidate.loadingAnalysis ? (
                          <span>Loading...</span>
                        ) : candidate.analysis ? (
                          <span>{candidate.analysis}</span>
                        ) : (
                          <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg transition hover:bg-blue-700"
                            onClick={() => handleViewAnalysis(candidate.id, candidate.resume_text)}
                          >
                            View Analysis
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

         

          {/* Schedule Interview Button */}
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