import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbarapp from '../components/Navbarapp';
import TourGuide from '../components/TourGuide'; // Import the tour component
import { FaUpload, FaClipboardList, FaBriefcase, FaCalendarAlt, FaChartBar, FaUserCircle } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';

const Home = () => {
  const [totalApplications, setTotalApplications] = useState(0);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    // Function to fetch total applications
    const fetchTotalApplications = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${API_BASE_URL}/totalApplications`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to fetch total applications");
        }

        const data = await response.json();
        setTotalApplications(data.total_applications);
        setName(data.name);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchTotalApplications();
  }, [API_BASE_URL]);

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* TourGuide runs only on the first visit */}
      <TourGuide />

      {/* Navbar */}
      <Navbarapp />

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 w-[19%] h-screen overflow-y-auto overflow-x-hidden bg-white shadow-lg z-40">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="ml-[19%] mt-16 p-6 md:p-4 relative">
        <div className="absolute top-0 right-0 p-4">
          <FaUserCircle className="text-[#800080] text-3xl cursor-pointer" />
        </div>

        <div className="mb-8">
          {/* Adding "header" class for the tour step */}
          <h1 className="header text-3xl md:text-4xl font-bold text-gray-900">
            Welcome Back, {name}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-4 text-center">
            <h3 className="text-lg font-semibold text-gray-800">Total Applications</h3>
            <p className="text-4xl mt-2 text-gray-900">{totalApplications}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4 text-center">
            <h3 className="text-lg font-semibold text-gray-800">Interviews Today</h3>
            <p className="text-4xl mt-2 text-gray-900">0</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4 text-center">
            <h3 className="text-lg font-semibold text-gray-800">Waiting Candidates</h3>
            <p className="text-4xl mt-2 text-gray-900">0</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Candidate Interview Performance
            </h3>
            {/* Adding "feature-section" class for the tour step */}
            <div className="feature-section h-64 bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">Bar Chart Here (All values 0)</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Successful Candidates</h3>
            <div className="h-64 bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">Pie Chart Here (100% Waiting)</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Candidate Status Distribution
          </h3>
          <div className="h-32 bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Bar Chart Here (All values 0)</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
