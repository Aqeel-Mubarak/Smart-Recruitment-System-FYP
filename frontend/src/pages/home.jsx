import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar, ResponsiveContainer } from 'recharts';
import Navbarapp from '../components/Navbarapp';
import TourGuide from '../components/TourGuide';
import { FaUserCircle } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';

const Home = () => {
  const [totalApplications, setTotalApplications] = useState(0);
  const [todayInterviews, setTodayInterviews] = useState(0);
  const [waitingCandidate, setWaitingCandidate] = useState(0);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [openJobs, setOpenJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
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
  
      // Fetch open jobs with candidate counts
      const openJobsResponse = await fetch(`${API_BASE_URL}/open_jobs_with_applications`, {
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
  
      if (!openJobsResponse.ok) {
        throw new Error("Failed to fetch open jobs");
      }
  
      const interviewsData = await interviewsResponse.json();
      const waitingData = await waitingResponse.json();
      const openJobsData = await openJobsResponse.json();
      
      // Use the actual applications count from backend
      setOpenJobs(openJobsData.jobs);
      
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
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [API_BASE_URL]);

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

  // Calculate the interviewed candidates
  const interviewedCandidates = Math.max(0, totalApplications - waitingCandidate);
  const waitingPercentage = totalApplications > 0 ? Math.round((waitingCandidate / totalApplications) * 100) : 0;
  const interviewedPercentage = totalApplications > 0 ? Math.round((interviewedCandidates / totalApplications) * 100) : 0;

  const pieChartData = [
    { name: "Waiting Candidates", value: waitingCandidate, percentage: waitingPercentage },
    { name: "Interviewed Candidates", value: interviewedCandidates, percentage: interviewedPercentage }
  ];

  const COLORS = ['#6366F1', '#10B981'];

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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            className="col-span-1 md:col-span-2 bg-white/80 backdrop-blur-lg shadow-lg rounded-xl p-6"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              Open Jobs & Applications
            </h3>
            
            {openJobs.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={openJobs}
                    margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="title" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                      tick={{ fontSize: 12 }}
                     
                    />
                    <YAxis 
                      label={{ value: 'Applications', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '0.5rem',
                        border: 'none',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="applications" fill="#6366F1" name="Job Applications">
                      {openJobs.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={`rgba(99, 102, 241, ${0.4 + ((index % 5) * 0.15)})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 bg-gray-100/50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No open jobs available</p>
              </div>
            )}
          </motion.div>

          <motion.div 
            className="col-span-1 bg-white/80 backdrop-blur-lg shadow-lg rounded-xl p-6"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              Candidate Status Distribution
            </h3>
            <div className="flex flex-col items-center">
              <PieChart width={240} height={200}>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
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
              
              <div className="flex flex-col w-full mt-4">
                {pieChartData.map((entry, index) => (
                  <div key={`legend-${index}`} className="flex items-center mt-2">
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