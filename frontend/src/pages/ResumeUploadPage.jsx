import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbarapp from "../components/Navbarapp";
import Sidebar from "../components/Sidebar";
import { FiUploadCloud } from 'react-icons/fi';
import axios from 'axios';

const ResumeUploadPage = () => {
  const [files, setFiles] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobId, setJobId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectedFileNames, setSelectedFileNames] = useState(null);
  const [jobDescriptionStatus, setJobDescriptionStatus] = useState('');
  const [loading, setLoading] = useState(false);  // Loading state for the resume upload

  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      setSelectedFileNames(`Selected Files: ${Array.from(selectedFiles).map(file => `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`).join(', ')}`);
    } else {
      setFiles([]);
      setSelectedFileNames(null);
    }
  };

  const handleDescriptionChange = (event) => {
    setJobDescription(event.target.value);
  };

  const handleJobTitleChange = (event) => {
    setJobTitle(event.target.value);
  };

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

  const handleResumeUpload = async () => {
    if (files.length === 0) {
      setUploadStatus('Please select at least one file.');
      return;
    }
    if (!jobId) {
      setUploadStatus('Please upload a job description first.');
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    setLoading(true); // Start loading indicator

    try {
      const response = await axios.post(`http://127.0.0.1:8000/upload_resume?job_description_id=${jobId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus(`Resumes uploaded successfully. Processed ${response.data.length} files.`);
      setFiles([]);  // Reset selected files after successful upload
      setSelectedFileNames(null);
    } catch (error) {
      setUploadStatus(`Upload failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  const handleShortlistRedirect = () => {
    navigate('/shortlist-candidate');
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbarapp />
      <div className="flex flex-1 h-full">
        <Sidebar className="min-h-full h-full" />
        <div className="flex-1 bg-gray-100 p-8 mt-12">
          <div className="flex space-x-10">
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
              {jobDescriptionStatus && <p className="text-green-600 mt-2">{jobDescriptionStatus}</p>}
            </div>
            <div className="w-2/3 bg-white rounded-lg shadow-md p-8">
              <label className="block font-bold text-xl mb-2">
                Upload your Resume(s)
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
                  accept=".pdf,.doc,.docx"
                  multiple
                  required
                />
              </div>
              {selectedFileNames && <p className="text-gray-600 mt-2">{selectedFileNames}</p>}
              <div className="flex justify-center mt-6">
                <button 
                  onClick={handleResumeUpload} 
                  className="bg-black text-white py-4 px-8 rounded-full">
                  {loading ? 'Uploading...' : 'Upload Resume'}
                </button>
              </div>
              <div className="flex justify-center mt-6">
                <button 
                  onClick={handleShortlistRedirect} 
                  className="bg-black text-white py-4 px-8 rounded-full">
                  Shortlist Candidates
                </button>
              </div>
              {uploadStatus && <p className="text-green-600 mt-2">{uploadStatus}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploadPage;
