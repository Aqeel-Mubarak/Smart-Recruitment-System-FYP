// ResumeUploadPage.jsx
import React from "react";
import Navbarapp from "../components/Navbarapp";
import Sidebar from "../components/Sidebar";
import { FiUploadCloud } from 'react-icons/fi';
import { FaShareAlt, FaPrint, FaSave, FaCopy, FaPlus } from 'react-icons/fa';

const ResumeUploadPage = () => {
  const handleFileChange = (event) => {
    // Logic to handle file change
    console.log(event.target.files[0]);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar */}
      <Navbarapp />

      {/* Main Content Section */}
      <div className="flex flex-1">
        {/* Sidebar with same top margin */}
        <div className="mt-12">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-100 p-8 mt-12">
          <div className="flex space-x-10">
            {/* Job Description Section */}
            <div className="w-1/3 bg-white rounded-lg shadow-md p-5">
              <h2 className="text-xl font-bold mb-4">Job Description</h2>
              <div className="text-gray-500 space-y-4">
                {/* Placeholder for job description lines */}
                {/* You can write the content later here */}
                {[...Array(10)].map((_, index) => (
                  <div key={index} className="h-6 bg-gray-200 rounded-full"></div>
                ))}
              </div>
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
                  required
                />
              </div>
              {/* File Details Section */}
              <div className="flex justify-between mt-4">
                <div>
                  <p className="text-gray-600">My current CV.PDF</p>
                  <p className="text-xs text-gray-500">2.9 mb</p>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="text-xs text-gray-500">JPEG, PNG, GIF, BMP</p>
                  <button className="text-gray-500 hover:text-red-600">
                    <i className="fas fa-times-circle"></i> {/* Font Awesome Close Icon */}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-purple-300 h-1 rounded-full mt-1">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>

              {/* Time Remaining and Percentage */}
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">Time remaining: 0 sec</p>
                <p className="text-xs text-gray-500">100%</p>
              </div>


              <div className="flex justify-center mt-6">
                <button className="bg-black text-white py-4 px-8 rounded-full">
                  Shortlisted Candidates
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="w-full bg-white shadow-md p-4 flex justify-end items-center">
        <div className="flex space-x-4">
          <ActionButton label="Share" icon={<FaShareAlt />} />
          <ActionButton label="Print" icon={<FaPrint />} />
          <ActionButton label="Save" icon={<FaSave />} />
          <ActionButton label="Copy" icon={<FaCopy />} />
        </div>
        {/* Plus Button */}
        <button className="bg-gray-200 rounded-full p-3 shadow-md">
          <FaPlus className="text-2xl text-purple-700" />
        </button>
      </footer>
    </div>
  );
};

// ActionButton Component for Bottom Icons
const ActionButton = ({ label, icon }) => {
  return (
    <button className="flex items-center space-x-2 bg-gray-100 rounded-lg shadow-md px-4 py-2">
      <div className="text-purple-700 text-lg">
        {icon}
      </div>
      <span className="text-gray-600">{label}</span>
    </button>
  );
};

export default ResumeUploadPage;
