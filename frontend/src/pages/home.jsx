/**
 * Home Page Component
 * 
 * This is the main dashboard page that displays key recruitment metrics and statistics.
 * It includes:
 * - Total applications count
 * - Today's interviews
 * - Waiting candidates
 * - A pie chart showing candidate status distribution
 * 
 * The page automatically refreshes data every 5 minutes and includes
 * loading states and error handling.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import Navbarapp from '../components/Navbarapp';
import TourGuide from '../components/TourGuide';
import { FaUserCircle } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';

const Home = () => {
  // State management for dashboard metrics
  const [totalApplications, setTotalApplications] = useState(0);
  const [todayInterviews, setTodayInterviews] = useState(0);
  const [waitingCandidate, setWaitingCandidate] = useState(0);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  /**
   * Fetches all dashboard data from the API
   * Includes:
   * - Total applications count
   * - User's name
   * - Today's interviews count
   * - Number of waiting candidates
   */
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

  // Set up data fetching on component mount and refresh every 5 minutes
  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [API_BASE_URL]);

  // Loading state UI with animated spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="mt-4 text-indigo-600 font-medium">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // Calculate statistics for the pie chart
  const interviewedCandidates = Math.max(0, totalApplications - waitingCandidate);
  const waitingPercentage = totalApplications > 0 ? Math.round((waitingCandidate / totalApplications) * 100) : 0;
  const interviewedPercentage = totalApplications > 0 ? Math.round((interviewedCandidates / totalApplications) * 100) : 0;

  // Data for the pie chart visualization
  const pieChartData = [
    { name: "Waiting Candidates", value: waitingCandidate, percentage: waitingPercentage },
    { name: "Interviewed Candidates", value: interviewedCandidates, percentage: interviewedPercentage }
  ];

  // Color scheme for the pie chart
  const COLORS = ['#6366F1', '#10B981'];

  /**
   * Custom label renderer for the pie chart
   * Displays percentage values in the center of each pie slice
   */
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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
        className="text-sm font-medium"
      >
        {`${Math.round(percent * 100)}%`}
      </text>
    );
  };

  // Animation variants for card elements
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Main dashboard layout with animated components
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white relative">
      <TourGuide />
      <Navbarapp />

      <aside className="fixed left-0 top-16 w-[19%] h-[calc(100vh-4rem)] bg-white/80 backdrop-blur-lg shadow-lg">
        <Sidebar />
      </aside>

      <motion.main 
        className="ml-[19%] mt-16 p-6 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {error && (
          <motion.div 
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="block sm:inline">{error}</span>
          </motion.div>
        )}

        <motion.div 
          className="flex items-center justify-between mb-8"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome Back, <span className="text-indigo-600">{name}</span>
          </h1>
          <FaUserCircle className="text-indigo-600 text-3xl cursor-pointer hover:text-indigo-700 transition-colors" />
        </motion.div>

        {/* Dashboard metrics cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            className="bg-white/80 backdrop-blur-lg shadow-lg rounded-xl p-6 text-center hover:shadow-xl transition-all"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-lg font-semibold text-gray-800">Total Applications</h3>
            <p className="text-4xl mt-2 font-bold text-indigo-600">{totalApplications}</p>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-lg shadow-lg rounded-xl p-6 text-center hover:shadow-xl transition-all"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-lg font-semibold text-gray-800">Interviews Today</h3>
            <p className="text-4xl mt-2 font-bold text-indigo-600">{todayInterviews}</p>
            <p className="text-sm text-gray-500 mt-1">Scheduled for today</p>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-lg shadow-lg rounded-xl p-6 text-center hover:shadow-xl transition-all"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-lg font-semibold text-gray-800">Waiting Candidates</h3>
            <p className="text-4xl mt-2 font-bold text-indigo-600">{waitingCandidate}</p>
            <p className="text-sm text-gray-500 mt-1">Pending Review</p>
          </motion.div>
        </div>

        {/* Candidate status distribution chart */}
        <div className="grid grid-cols-1 gap-6">
          <motion.div 
            className="bg-white/80 backdrop-blur-lg shadow-lg rounded-xl p-6"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              Candidate Status Distribution
            </h3>
            <div className="flex flex-col items-center">
              <PieChart width={300} height={240}>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  animationDuration={1500}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '0.5rem',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
              
              <div className="flex justify-center gap-8 w-full mt-6">
                {pieChartData.map((entry, index) => (
                  <div key={`legend-${index}`} className="flex items-center">
                    <div 
                      className="w-4 h-4 mr-2 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-600">{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
};

export default Home;