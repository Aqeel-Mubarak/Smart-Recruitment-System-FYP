import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Navbarapp from "../components/Navbarapp";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import JobsForCreateOpenJobs from "../components/JobsForCreateOpenJobs";
import { useAppContext } from "../components/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Plus, Filter, MoreVertical, Users, Calendar, Link, XCircle, Loader2, Edit3, FileText } from "lucide-react";

const CurrentOpenJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hiringmanagerid, setHiringmanagerid] = useState();
  const { user, setUser } = useAppContext();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [dropdownPositions, setDropdownPositions] = useState({});
  const [jobType, setJobType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState({ title: '', description_text: '', status: 'open', deadline: '' });
  const filterDropdownRef = useRef(null);
  const dropdownRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    axios.get(`${API_BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        setHiringmanagerid(response.data.id);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      setJobs(data["jobs"]);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [jobType]);

  const toggleFilterDropdown = () => {
    setFilterDropdownVisible(!filterDropdownVisible);
  };

  const handleFilterOptionClick = async (option) => {
    setJobType(option);
    setFilterDropdownVisible(false);
  };

  const handleViewCandidates = async (jobId) => {
    navigate(`/shortlist-candidate?jobId=${jobId}`)
  };

  const closeOpenedJob = async (job_id) => {
    const token = localStorage.getItem('accessToken');
    try {
      const formData = new FormData();
      formData.append('job_id', job_id);

      const response = await fetch(`${API_BASE_URL}/jobs/close-job`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to close job');
      }

      await response.json();
      fetchJobs();
    } catch (error) {
      console.error('Error closing job:', error);
    }
  };

  const openEditModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const openDescriptionModal = (job) => {
    setSelectedJob(job);
    setIsDescriptionModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeDescriptionModal = () => {
    setIsDescriptionModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsModalOpen(false);
    const formData = new FormData();
    formData.append('id', selectedJob.id);
    formData.append('title', selectedJob.title);
    formData.append('description_text', selectedJob.description_text);
    formData.append('status', selectedJob.status);
    formData.append('deadline', selectedJob.deadline);
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/edit-job`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to edit job');
      }

      await response.json();
      fetchJobs();
    } catch (error) {
      console.error('Error editing job:', error);
    }
  };

  const toggleDropdown = (index, event) => {
    if (dropdownVisible === index) {
      setDropdownVisible(null);
      return;
    }

    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const dropdownHeight = 100; // Approximate height of dropdown

    setDropdownPositions({
      index,
      position: spaceBelow < dropdownHeight && spaceAbove > spaceBelow ? 'top' : 'bottom'
    });
    setDropdownVisible(index);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRefs.current.some(ref => ref && !ref.contains(event.target))) {
        setDropdownVisible(null);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setFilterDropdownVisible(false);
      }
    };

    if (dropdownVisible !== null || filterDropdownVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownVisible, filterDropdownVisible]);

  const handleCreateJob = () => {
    navigate('/create-job');
  };

  const handleSlots = (e) => {
    const isManagement = true;
    navigate(`/Calendar/${isManagement}/${e}`, { state: { jobid: e, hiringmanagerid: hiringmanagerid } });
  };

  const handleLink = (id) => {
    if (!id) return;
    const url = `http://207.180.240.67/application/${id}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => alert("URL copied successfully!"))
        .catch(err => console.error("Failed to copy URL:", err));
    } else {
      copyTextFallback(url);
    }
  };

  function copyTextFallback(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-white">
        <Navbarapp />
        <div className="flex pt-16 h-full">
          <Sidebar />
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-grow p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-indigo-600" />
                <h1 className="font-bold text-2xl text-gray-800">Current Open Jobs</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative" ref={filterDropdownRef}>
                  <button
                    onClick={toggleFilterDropdown}
                    className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-lg rounded-lg border border-gray-200 hover:bg-white/90 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                  <AnimatePresence>
                    {filterDropdownVisible && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-lg rounded-lg shadow-lg border border-gray-100 z-50"
                      >
                        <div className="py-1">
                          <button onClick={() => handleFilterOptionClick('all')} className="block w-full px-4 py-2 text-left hover:bg-indigo-50 transition-colors">All Jobs</button>
                          <button onClick={() => handleFilterOptionClick('open')} className="block w-full px-4 py-2 text-left hover:bg-indigo-50 transition-colors">Open Jobs</button>
                          <button onClick={() => handleFilterOptionClick('closed')} className="block w-full px-4 py-2 text-left hover:bg-indigo-50 transition-colors">Closed Jobs</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={handleCreateJob}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Job</span>
                </button>
              </div>
            </div>

            <motion.div
              layout
              className="bg-white/80 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden border border-gray-100"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center p-8 min-h-[200px]"
                  >
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="mt-4 text-gray-600">Loading jobs...</p>
                  </motion.div>
                ) : jobs.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center p-8 min-h-[200px]"
                  >
                    <Briefcase className="w-8 h-8 text-gray-400" />
                    <p className="mt-4 text-gray-600">No jobs found</p>
                  </motion.div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-indigo-600 text-white">
                          <th className="px-6 py-4 text-left text-sm font-semibold">Job Title</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Deadline</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold w-[280px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-transparent">
                        {jobs.map((job, index) => (
                          <motion.tr
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-indigo-50/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{job.title}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {job.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{job.deadline}</td>
                            <td className="px-6 py-4 relative">
                              <div className="flex justify-center items-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleViewCandidates(job.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-indigo-100 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
                                >
                                  <Users className="w-4 h-4" />
                                  <span>Candidates</span>
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleSlots(job.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-indigo-100 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
                                >
                                  <Calendar className="w-4 h-4" />
                                  <span>Slots</span>
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleLink(job.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-indigo-100 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
                                >
                                  <Link className="w-4 h-4" />
                                  <span>Share</span>
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => openDescriptionModal(job)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-indigo-100 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
                                >
                                  <FileText className="w-4 h-4" />
                                  <span>Details</span>
                                </motion.button>
                                <div className="relative inline-block" ref={el => dropdownRefs.current[index] = el}>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => toggleDropdown(index, e)}
                                    className="p-2 hover:bg-indigo-50 rounded-lg transition-all border border-transparent hover:border-indigo-100"
                                  >
                                    <MoreVertical className="w-5 h-5 text-indigo-600" />
                                  </motion.button>
                                  <AnimatePresence>
                                    {dropdownVisible === index && (
                                      <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        style={{ zIndex: 1000 }}
                                        className="absolute right-0 top-0 translate-y-[-100%] mt-[-8px] w-48 bg-white/90 backdrop-blur-lg rounded-lg shadow-lg border border-indigo-100"
                                      >
                                        <div className="py-1">
                                          <motion.button
                                            whileHover={{ x: 2 }}
                                            onClick={() => openEditModal(job)}
                                            className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-indigo-50 transition-all text-gray-700 hover:text-indigo-600"
                                          >
                                            <Edit3 className="w-4 h-4" />
                                            <span>Edit Job</span>
                                          </motion.button>
                                          {job.status === 'open' && (
                                            <>
                                              <div className="h-px bg-gray-200 my-1" />
                                              <motion.button
                                                whileHover={{ x: 2 }}
                                                onClick={() => closeOpenedJob(job.id)}
                                                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-red-50 transition-all text-red-600 hover:text-red-700"
                                              >
                                                <XCircle className="w-4 h-4" />
                                                <span>Close Job</span>
                                              </motion.button>
                                            </>
                                          )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence>
              {isModalOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-xl p-6 max-w-lg w-full mx-4"
                  >
                    <h2 className="text-xl font-semibold mb-4">Edit Job</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <input
                          type="text"
                          value={selectedJob.title}
                          onChange={(e) => setSelectedJob({ ...selectedJob, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={selectedJob.description_text}
                          onChange={(e) => setSelectedJob({ ...selectedJob, description_text: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Job Status</label>
                        <div className="flex gap-4">
                          <label className="relative flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              name="status"
                              value="open"
                              checked={selectedJob.status === 'open'}
                              onChange={(e) => setSelectedJob({ ...selectedJob, status: e.target.value })}
                              className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div className="flex items-center gap-2">
                              <motion.div
                                animate={{
                                  scale: selectedJob.status === 'open' ? 1 : 0.95,
                                  opacity: selectedJob.status === 'open' ? 1 : 0.7
                                }}
                                className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm font-medium"
                              >
                                Open
                              </motion.div>
                            </div>
                          </label>
                          <label className="relative flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              name="status"
                              value="closed"
                              checked={selectedJob.status === 'closed'}
                              onChange={(e) => setSelectedJob({ ...selectedJob, status: e.target.value })}
                              className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div className="flex items-center gap-2">
                              <motion.div
                                animate={{
                                  scale: selectedJob.status === 'closed' ? 1 : 0.95,
                                  opacity: selectedJob.status === 'closed' ? 1 : 0.7
                                }}
                                className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-sm font-medium"
                              >
                                Closed
                              </motion.div>
                            </div>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                        <input
                          type="date"
                          value={selectedJob.deadline}
                          onChange={(e) => setSelectedJob({ ...selectedJob, deadline: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          type="button"
                          onClick={closeModal}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Description Modal */}
            <AnimatePresence>
              {isDescriptionModalOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
                  onClick={closeDescriptionModal}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-xl"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">{selectedJob.title}</h2>
                        <div className="mt-1 flex items-center gap-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedJob.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedJob.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            Deadline: {selectedJob.deadline}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={closeDescriptionModal}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <XCircle className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Job Description</h3>
                      <div className="bg-gray-50 rounded-lg border border-gray-100 shadow-inner">
                        <div 
                          className="p-4 text-gray-700 whitespace-pre-wrap h-[300px] overflow-y-auto custom-scrollbar"
                          style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#94A3B8 #E2E8F0'
                          }}
                        >
                          {selectedJob.description_text}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={closeDescriptionModal}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Close
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>
        </div>
      </div>
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #E2E8F0;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #94A3B8;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #64748B;
          }
        `}
      </style>
    </>
  );
};

export default CurrentOpenJobs;