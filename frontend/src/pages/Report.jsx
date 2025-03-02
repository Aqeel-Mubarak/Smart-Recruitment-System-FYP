import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbarapp from "../components/Navbarapp";
import Sidebar from "../components/Sidebar";
import Select from "react-select";

function Report() {
  const [candidates, setCandidates] = useState([]);
  const [jobOptions, setJobOptions] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchJobTitles();
    fetchCandidates();
  }, []);

  const fetchJobTitles = async () => {
    try {
      // We need to update the job_titles endpoint to return IDs as well
      const response = await axios.get(`${API_BASE_URL}/job_titles`);
      
      // Assuming the endpoint now returns an array of objects with id and title
      setJobOptions(response.data.map(job => ({ 
        value: job.id,  // Use the job ID as the value
        label: job.title 
      })));
    } catch (error) {
      console.error('Error fetching job titles:', error);
    }
  };

  const fetchCandidates = async (jobId = null) => {
    try {
      // Only send job_title_id parameter if a job is selected
      const params = jobId ? { job_title_id: jobId } : {};
      
      const response = await axios.get(`${API_BASE_URL}/top_candidates`, { params });
      setCandidates(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobChange = selectedOption => {
    setSelectedJob(selectedOption);
    // Pass the job ID (not the title) to fetchCandidates
    fetchCandidates(selectedOption ? selectedOption.value : null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <Navbarapp />
      <div className="flex pt-16 h-full">
        <Sidebar />
        <main className="flex-grow p-4">
          <h1 className="font-bold text-2xl mb-6">Candidate's Report</h1>
          <Select
            options={jobOptions}
            value={selectedJob}
            onChange={handleJobChange}
            placeholder="Select Job Title"
            styles={{
              control: base => ({
                ...base,
                minHeight: 36,
                borderRadius: 8,
                borderColor: '#CBD5E0',
                '&:hover': { borderColor: '#A0AEC0' },
              }),
            }}
          />
          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
            {loading ? (
              <p className="text-center p-4">Loading...</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-purple-800 text-white">
                    <th className="border p-3 text-center">Candidate Name</th>
                    <th className="border p-3 text-center">Email</th>
                    <th className="border p-3 text-center">Job Relevancy Score</th>
                    <th className="border p-3 text-center">Status</th>
                    <th className="border p-3 text-center">Interview Schedule</th>
                  </tr>
                </thead>
                
                <tbody className="bg-gray-700 text-white hover:bg-gray-600 transition-colors">
                  {candidates.map(candidate => (
                    <tr key={candidate.id}>
                      <td className="border text-left p-3">{candidate.name}</td>
                      <td className="border text-left p-3">{candidate.email || 'N/A'}</td>
                      <td className="border text-center p-3">{candidate.score || 'N/A'}</td>
                      <td className="border text-left p-3">{candidate.status}</td>
                      <td className="border text-left p-3">{candidate.interview_summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Report;