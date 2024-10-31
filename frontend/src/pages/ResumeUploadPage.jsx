import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
import Navbarapp from "../components/Navbarapp";
import Sidebar from "../components/Sidebar";
import { FiUploadCloud } from 'react-icons/fi';
import axios from 'axios';

const ResumeUploadPage = () => {
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobId, setJobId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectedFileName, setSelectedFileName] = useState(null); // Added state for selected file
  const [jobDescriptionStatus, setJobDescriptionStatus] = useState(''); // Added state for job description status

  const navigate = useNavigate(); // Hook to handle navigation

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setSelectedFileName(`${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)`); // Display file name and size
    } else {
      setSelectedFileName(null); // Reset if no file is selected
    }
  };

  const handleDescriptionChange = (event) => {
    setJobDescription(event.target.value);
  };

  const handleJobTitleChange = (event) => {
    setJobTitle(event.target.value);
  };

  // Handle job description upload
  const handleJobDescriptionUpload = async () => {
    if (!jobTitle || !jobDescription) {
      setJobDescriptionStatus('Please provide both job title and description.');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/add_job_description', {
        title: jobTitle,
        description_text: jobDescription,
      });
      setJobId(response.data.id);
      setJobDescriptionStatus(`Job Description uploaded successfully: ${response.data.title}`);
    } catch (error) {
      setJobDescriptionStatus(`Job Description upload failed: ${error.response?.data?.detail || error.message}`);
    }
  };

  // Handle resume upload
  const handleResumeUpload = async () => {
    if (!file) {
      setUploadStatus('Please select a file first.');
      return;
    }
    if (!jobId) {
      setUploadStatus('Please upload a job description first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`http://127.0.0.1:8000/upload_resume?job_description_id=${jobId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus(`Resume uploaded successfully: ${response.data.name}`);
    } catch (error) {
      setUploadStatus(`Upload failed: ${error.response?.data?.detail || error.message}`);
    }
  };

  // Handle navigation to shortlisted candidates page
  const handleShortlistRedirect = () => {
    navigate('/shortlisted-candidates'); // Redirect to the shortlisted candidates page
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar */}
      <Navbarapp />

      {/* Main Content Section */}
      <div className="flex flex-1 h-full">
        {/* Sidebar with full height */}
        <div className="h-full">
          <Sidebar className="min-h-full h-full" /> {/* Ensure the sidebar takes full height */}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-100 p-8 mt-12">
          <div className="flex space-x-10">
            {/* Job Description Section */}
            <div className="w-1/3 bg-white rounded-lg shadow-md p-5">
              <h2 className="text-xl font-bold mb-4">Job Description</h2>
              <input
                type="text"
                placeholder="Job Title"
                value={jobTitle}
                onChange={handleJobTitleChange}
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <textarea
                value={jobDescription}
                onChange={handleDescriptionChange}
                className="w-full h-80 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
                placeholder="Enter the job description here..."
                style={{ minHeight: '200px' }}
              ></textarea>
              <button 
                onClick={handleJobDescriptionUpload} 
                className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700">
                Upload Job Description
              </button>
              {/* Display job description upload status */}
              {jobDescriptionStatus && <p className="text-green-600 mt-2">{jobDescriptionStatus}</p>}
            </div>

            {/* Upload Section */}
            <div className="w-2/3 bg-white rounded-lg shadow-md p-8">
              <label className="block font-bold text-xl mb-2">
                Upload your Resume
              </label>
              <div className="flex flex-col items-center justify-center gap-3 cursor-pointer bg-gray-100 border-2 border-dashed border-indigo-600 p-10 rounded-lg">
                <FiUploadCloud size={80} className="text-indigo-600" />
                <label htmlFor="resume-upload" className="font-bold text-indigo-600 cursor-pointer">
                  Drag and drop to upload or <span className="text-indigo-700">Browse</span>
                </label>
                <input
                  type="file"
                  id="resume-upload"
                  name="resume"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf"
                  required
                />
              </div>
              {/* Display selected file name */}
              {selectedFileName && <p className="text-gray-600 mt-2">Selected File: {selectedFileName}</p>}

              {/* Upload Button */}
              <div className="flex justify-center mt-6">
                <button 
                  onClick={handleResumeUpload} 
                  className="bg-black text-white py-4 px-8 rounded-full">
                  Upload Resume
                </button>
              </div>

              {/* Shortlist Candidates Button */}
              <div className="flex justify-center mt-6">
                <button 
                  onClick={handleShortlistRedirect} 
                  className="bg-black text-white py-4 px-8 rounded-full">
                  Shortlist Candidates
                </button>
              </div>

              {/* Display resume upload status */}
              {uploadStatus && <p className="text-green-600 mt-2">{uploadStatus}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploadPage;
