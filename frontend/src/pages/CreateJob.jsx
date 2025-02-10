import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbarapp from "../components/Navbarapp"; // Static Navbar component
import Sidebar from "../components/Sidebar";     // Fixed Sidebar component

function CreateJob() {
  const navigate = useNavigate();

  // Form state for three fields: Job Title, Job Description, and Application Deadline.
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("");

  // Set the document title so that the Navbar displays the correct page title.
  useEffect(() => {
    document.title = "Create Job";
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setStatus("No access token found.");
      return;
    }
    // Prepare form data for the backend.
    const formData = new FormData();
    formData.append("title", jobTitle);
    formData.append("description", jobDescription);
    formData.append("deadline", deadline);

    try {
      await axios.post("http://127.0.0.1:8000/create/add_job_description", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus("Job created successfully!");
      // Navigate to the open jobs page (or any other page) after successful creation.
      navigate("/open-jobs");
    } catch (error) {
      setStatus(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Navbar */}
      <Navbarapp />

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 w-[19%] h-screen overflow-y-auto overflow-x-hidden bg-white shadow-lg ">
        <Sidebar />
      </aside>

      {/* Main Content Area (offset by sidebar width) */}
      <div className="ml-[19%] w-[81%] p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Create New Job Posting</h1>
          <form onSubmit={handleCreateJob} className="space-y-6">
            {/* Job Title Input */}
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                id="jobTitle"
                name="title"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                placeholder="Enter job title"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Job Description Input */}
            <div>
              <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Job Description *
              </label>
              <textarea
                id="jobDescription"
                name="description"
                rows="6"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
                placeholder="Enter job description"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Application Deadline Input */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Application Deadline *
              </label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Create Job Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors"
              >
                Create Job Posting
              </button>
            </div>
          </form>
          {status && <p className="mt-4 text-center text-sm text-green-600">{status}</p>}
        </div>
      </div>
    </div>
  );
}

export default CreateJob;
