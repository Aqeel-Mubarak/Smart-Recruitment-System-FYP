import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbarapp from "../components/Navbarapp"; // Your existing Navbar component
import Sidebar from "../components/Sidebar";     // Your existing Sidebar component
import axios from "axios";
import Select from "react-select";

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

  const navigate = useNavigate();

  // Set document title so the Navbar displays the correct page title.
  useEffect(() => {
    document.title = "Resume Upload";
  }, []);

  // Fetch the logged-in hiring manager's id.
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

  // Fetch jobs for the hiring manager and populate the Select options.
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
            description: job.description_text, // load description from DB
          }))
        );
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, [hiringManagerId]);

  // Handle file selection from file input.
  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
    }
  };

  // Drag & drop event handlers.
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

  // When a job is selected, load its description and id.
  const handleJobSelect = (option) => {
    setSelectedOption(option);
    if (option) {
      setJobDescription(option.description); // auto-load description from DB
      setJobId(option.value);
    } else {
      setJobDescription('');
      setJobId(null);
    }
  };

  // Update job description for the selected job (using HTTP PUT).
  const handleJobDescriptionUpdate = async () => {
    if (!selectedOption || !jobDescription) {
      setJobDescriptionStatus('Please select a job and provide a description.');
      return;
    }

    setUpdateLoading(true);
    const formData = new FormData();
    formData.append("title", selectedOption.label); // existing job title
    formData.append("description", jobDescription);

    try {
      const token = localStorage.getItem("accessToken");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      // Use the update endpoint instead of creating a new job description.
      await axios.put(`${API_BASE_URL}/update_job_description/${jobId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
      setJobDescriptionStatus('Job description updated successfully');
      // Refresh the jobs list to reflect updated description.
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

  // Upload resume files to the backend.
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
    } catch (error) {
      setUploadStatus(`Upload failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Static Navbar */}
      <Navbarapp />

      {/* Main Layout */}
      <div className="flex">
        {/* Fixed Static Sidebar */}
        <aside className="fixed left-0 top-16 w-[19%] h-screen overflow-y-auto overflow-x-hidden bg-white shadow-lg">
          <Sidebar />
        </aside>

        {/* Main Content Area (offset by sidebar width) */}
        <div className="ml-[20%] flex-1 p-8 mt-10">
          <div className="max-w-6xl mx-auto grid grid-cols-2 gap-8">
            {/* Job Description Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">Job Description</h2>
              {/* Label for Job Title */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <Select
                styles={customSelectStyles}
                options={jobs}
                value={selectedOption}
                onChange={handleJobSelect}
                placeholder="Select Job Title"
                className="mb-4"
                isClearable
              />
              {/* Label for Job Description */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full h-64 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Select a job to view and edit its description"
                disabled={!selectedOption}
              />
              <button 
                onClick={handleJobDescriptionUpdate}
                disabled={!selectedOption || updateLoading}
                className={`mt-4 w-full py-3 px-6 rounded-lg transition-colors ${
                  !selectedOption 
                    ? "bg-gray-300 cursor-not-allowed" 
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {updateLoading ? "Updating..." : "Update Job Description"}
              </button>
              {jobDescriptionStatus && (
                <p className="mt-2 text-sm text-green-600">
                  {jobDescriptionStatus}
                </p>
              )}
              {/* Create New Job Button */}
              <button 
                onClick={() => navigate("/create-job")}
                className="mt-4 w-full py-3 px-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Create New Job
              </button>
            </div>

            {/* Resume Upload Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">Upload your resume(s)</h2>
              <div 
                className={`border-2 border-dashed border-purple-300 rounded-lg p-10 text-center ${
                  isDragging ? "bg-purple-50" : "bg-gray-50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center">
                  <svg className="w-16 h-16 text-purple-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-600 mb-2">Drag and drop to upload</p>
                  <p className="text-gray-500">or</p>
                  <label className="mt-2 cursor-pointer text-purple-600 hover:text-purple-700">
                    Browse
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      multiple
                      accept=".pdf,.doc,.docx"
                    />
                  </label>
                </div>
              </div>
              
              {files.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  {Array.from(files).map((file, index) => (
                    <div key={index} className="mb-1">
                      {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 space-y-4">
              <button
  onClick={handleResumeUpload}
  className={`w-full py-3 px-6 rounded-lg transition-colors ${
    loading 
      ? "bg-gray-400 text-white cursor-not-allowed" 
      : "bg-black text-white hover:bg-gray-800"
  }`}
  disabled={loading}
>
  {loading ? (
    <span>
      Uploading...
      <br />
      <small>This may take some time</small>
    </span>
  ) : (
    "Upload Resume"
  )}
</button>
                <button 
                  onClick={() => navigate("/shortlist-candidate")}
                  className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Shortlist Candidates
                </button>
              </div>

              {uploadStatus && (
                <p className="mt-4 text-sm text-center text-green-600">
                  {uploadStatus}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploadPage;
