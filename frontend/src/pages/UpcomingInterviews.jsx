import React, { useEffect, useState } from "react";
import NavbarApp from "../components/Navbarapp";
import Sidebar from "../components/Sidebar";
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Mail, User, Briefcase, CalendarClock, AlertCircle, Search, Filter, MapPin, Building } from 'lucide-react';

const UpcomingInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [sortBy, setSortBy] = useState("date"); // date, name, title
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    document.title = "Upcoming Interviews";
  }, []);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken"); // ✅ Retrieve token
        if (!token) {
          throw new Error("No access token found");
        }
    
        const response = await axios.get(`${API_BASE_URL}/upcoming_interviews`, {
          headers: {
            Authorization: `Bearer ${token}`,  // ✅ Include token in request
          },
        });
    
        setInterviews(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching interviews:", error);
        setError("Failed to load upcoming interviews. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  useEffect(() => {
    let result = [...interviews];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(interview => 
        interview.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.date + " " + a.time);
        const dateB = new Date(b.date + " " + b.time);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "name") {
        return sortOrder === "asc" 
          ? a.candidate_name.localeCompare(b.candidate_name)
          : b.candidate_name.localeCompare(a.candidate_name);
      } else {
        return sortOrder === "asc"
          ? a.job_title.localeCompare(b.job_title)
          : b.job_title.localeCompare(a.job_title);
      }
    });

    setFilteredInterviews(result);
  }, [interviews, searchTerm, sortBy, sortOrder]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeStatus = (date, time) => {
    const interviewTime = new Date(date + " " + time);
    const now = new Date();
    const diffHours = (interviewTime - now) / (1000 * 60 * 60);

    if (diffHours < 0) return { label: "Completed", color: "bg-gray-100 text-gray-600" };
    if (diffHours <= 1) return { label: "Starting Soon", color: "bg-red-100 text-red-600" };
    if (diffHours <= 24) return { label: "Today", color: "bg-yellow-100 text-yellow-600" };
    if (diffHours <= 48) return { label: "Tomorrow", color: "bg-green-100 text-green-600" };
    return { label: "Upcoming", color: "bg-indigo-100 text-indigo-600" };
  };

  const handleSort = (type) => {
    if (sortBy === type) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(type);
      setSortOrder("asc");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <NavbarApp />
      
      <div className="flex h-[calc(100vh-4rem)] mt-16">
        <aside className="w-[19%] fixed left-0">
          <Sidebar />
        </aside>

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-[81%] ml-[19%] p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CalendarClock className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Upcoming Interviews</h1>
                <p className="text-gray-500">{filteredInterviews.length} interviews scheduled</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search interviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm w-64 transition-all"
                />
              </motion.div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSort("date")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    sortBy === "date" 
                      ? "bg-indigo-100 text-indigo-600" 
                      : "bg-white/80 text-gray-600 hover:bg-indigo-50"
                  }`}
                >
                  Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSort("name")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    sortBy === "name" 
                      ? "bg-indigo-100 text-indigo-600" 
                      : "bg-white/80 text-gray-600 hover:bg-indigo-50"
                  }`}
                >
                  Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSort("title")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    sortBy === "title" 
                      ? "bg-indigo-100 text-indigo-600" 
                      : "bg-white/80 text-gray-600 hover:bg-indigo-50"
                  }`}
                >
                  Job {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
                </motion.button>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-[60vh]"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-gray-500 font-medium">Loading interviews...</p>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
              >
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-red-700 mb-2">Error</h2>
                <p className="text-red-600">{error}</p>
              </motion.div>
            ) : filteredInterviews.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-xl p-8 text-center shadow-lg"
              >
                <Calendar className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {searchTerm ? "No matching interviews found" : "No Upcoming Interviews"}
                </h2>
                <p className="text-gray-600">
                  {searchTerm 
                    ? "Try adjusting your search terms or filters"
                    : "There are no scheduled interviews at the moment."}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="interviews"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-6"
              >
                {filteredInterviews.map((interview, index) => {
                  const timeStatus = getTimeStatus(interview.date, interview.time);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        transition: { delay: index * 0.1 }
                      }}
                      whileHover={{ scale: 1.01 }}
                      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-50 overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                              <Briefcase className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">{interview.job_title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Building className="w-4 h-4 text-gray-400" />
                                <p className="text-gray-500 text-sm">Applicant</p>
                              </div>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${timeStatus.color}`}>
                            {timeStatus.label}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Candidate</p>
                                <p className="font-medium text-gray-800">{interview.candidate_name}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium text-gray-800">{interview.email}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Date</p>
                                <p className="font-medium text-gray-800">{formatDate(interview.date)}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Time</p>
                                <p className="font-medium text-gray-800">{formatTime(interview.time)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      </div>
    </div>
  );
};

export default UpcomingInterviews;
