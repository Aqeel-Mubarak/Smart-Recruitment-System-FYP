import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Navbarapp from '../components/Navbarapp';
import TourGuide from '../components/TourGuide';
import { FaUserCircle } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';

const Home = () => {
  const [totalApplications, setTotalApplications] = useState(0);
  const [todayInterviews, setTodayInterviews] = useState(0);
  const [waitingCandidate, setWaitingCandidate] = useState(0);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }
  
      // Fetch total applications
      const applicationsResponse = await fetch(`${API_BASE_URL}/totalApplications`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!applicationsResponse.ok) {
        throw new Error("Failed to fetch total applications");
      }
  
      const applicationsData = await applicationsResponse.json();
      setTotalApplications(applicationsData.total_applications);
      setName(applicationsData.name);
  
      // Fetch today's interviews
      const interviewsResponse = await fetch(`${API_BASE_URL}/today_interviews_count`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      // Fetch waiting candidates
      const waitingResponse = await fetch(`${API_BASE_URL}/waiting_candidates`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!interviewsResponse.ok) {
        throw new Error("Failed to fetch today's interviews");
      }
  
      if (!waitingResponse.ok) {
        throw new Error("Failed to fetch waiting candidates");
      }
  
      const interviewsData = await interviewsResponse.json();
      const waitingData = await waitingResponse.json();
      
      setTodayInterviews(interviewsData.total_interviews);
      setWaitingCandidate(waitingData.length);
  
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate the interviewed candidates
  const interviewedCandidates = Math.max(0, totalApplications - waitingCandidate);

  // Calculate percentages for display
  const waitingPercentage = totalApplications > 0 ? Math.round((waitingCandidate / totalApplications) * 100) : 0;
  const interviewedPercentage = totalApplications > 0 ? Math.round((interviewedCandidates / totalApplications) * 100) : 0;

  // Pie chart data format
  const pieChartData = [
    { name: "Waiting Candidates", value: waitingCandidate, percentage: waitingPercentage },
    { name: "Interviewed Candidates", value: interviewedCandidates, percentage: interviewedPercentage }
  ];

  // Pie chart colors matching the screenshot
  const COLORS = ['#2196F3', '#4CAF50'];

  // Custom renderer for the labels inside pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontWeight="bold"
        fontSize="14"
      >
        {`${Math.round(percent * 100)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <TourGuide />
      <Navbarapp />

      <aside className="fixed left-0 top-16 w-[19%] h-screen overflow-y-auto overflow-x-hidden bg-white shadow-lg z-40">
        <Sidebar />
      </aside>

      <main className="ml-[19%] mt-16 p-6 md:p-4 relative">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="absolute top-0 right-0 p-4">
          <FaUserCircle className="text-[#800080] text-3xl cursor-pointer" />
        </div>

        <div className="mb-8">
          <h1 className="header text-3xl md:text-4xl font-bold text-gray-900">
            Welcome Back, {name}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Applications Card */}
          <div className="bg-white shadow rounded-lg p-4 text-center hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-800">Total Applications</h3>
            <p className="text-4xl mt-2 text-gray-900">{totalApplications}</p>
          </div>

          {/* Today's Interviews Card */}
          <div className="bg-white shadow rounded-lg p-4 text-center hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-800">Interviews Today</h3>
            <p className="text-4xl mt-2 text-gray-900">{todayInterviews}</p>
            <p className="text-sm text-gray-500 mt-1">Scheduled for today</p>
          </div>

          {/* Waiting Candidates Card */}
          <div className="bg-white shadow rounded-lg p-4 text-center hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-800">Waiting Candidates</h3>
            <p className="text-4xl mt-2 text-gray-900">{waitingCandidate}</p>
            <p className="text-sm text-gray-500 mt-1">Pending Review</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Section - Interview Performance */}
          <div className="col-span-1 md:col-span-2 bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Candidate Interview Performance
            </h3>
            <div className="feature-section h-64 bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">Bar Chart Here (All values 0)</p>
            </div>
          </div>

          {/* Right Section - Pie Chart */}
          <div className="col-span-1 bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Candidate Status Distribution
            </h3>
            <div className="flex flex-col items-center">
              <PieChart width={240} height={180}>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  fill="#8884d8"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
              </PieChart>
              
              {/* Custom Legend */}
              <div className="flex flex-col w-full mt-2">
                {pieChartData.map((entry, index) => (
                  <div key={`legend-${index}`} className="flex items-center mt-2">
                    <div 
                      className="w-4 h-4 mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional section */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Candidate Status Detail View
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