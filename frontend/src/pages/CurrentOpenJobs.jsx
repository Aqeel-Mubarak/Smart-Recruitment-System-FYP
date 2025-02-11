import React, { useState, useEffect, useRef } from "react";
import { FaClipboardList, FaUserFriends, FaBriefcase, FaEllipsisV, FaFilter, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Navbarapp from "../components/Navbarapp";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import JobsForCreateOpenJobs from "../components/JobsForCreateOpenJobs";
import { useAppContext } from "../components/AppContext";

const CurrentOpenJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [hiringmanagerid, setHiringmanagerid] = useState();
  const { user, setUser } = useAppContext();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [jobType, setJobType] = useState('all'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState({ title: '', description_text: '', status: 'open', deadline: '' });
  const dropdownRefs = useRef([]);
  const filterDropdownRef = useRef(null);
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
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Assuming you use Bearer token for authentication
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
      throw error;
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [jobType]); // Add jobType as a dependency to re-fetch jobs when it changes

  const toggleDropdown = (index) => {
    setDropdownVisible(dropdownVisible === index ? null : index);
  };

  const toggleFilterDropdown = () => {
    setFilterDropdownVisible(!filterDropdownVisible);
  };

  const handleFilterOptionClick = async (option) => {
    setJobType(option); // Update jobType state
    setFilterDropdownVisible(false);
  };

  const handleViewCandidates = async (jobId) => {
    setDropdownVisible(false);
    navigate(`/shortlist-candidate?jobId=${jobId}`)
  };

  const closeOpenedJob = async (job_id) => {
    const token = localStorage.getItem('accessToken');
    setDropdownVisible(false);
    try {
      const formData = new FormData();
      formData.append('job_id', job_id);

      const response = await fetch(`${API_BASE_URL}/jobs/close-job`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Assuming you use Bearer token for authentication
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to close job');
      }

      const data = await response.json();
      fetchJobs();
    } catch (error) {
      console.error('Error closing job:', error);
      throw error;
    }
  };

  const openEditModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDropdownVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsModalOpen(false);
    setDropdownVisible(false);
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
          'Authorization': `Bearer ${token}`, // Assuming you use Bearer token for authentication
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to edit job');
      }

      const data = await response.json();
      fetchJobs();
    } catch (error) {
      console.error('Error editing job:', error);
      throw error;
    }
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Static Navbar */}
      <Navbarapp />

      {/* Working Window: Only this area scrolls */}
      <div className="flex flex-1 pt-20 overflow-auto">
        {/* Fixed Sidebar */}
        <aside className="fixed left-0 top-16 w-[19%] h-screen overflow-y-auto overflow-x-hidden bg-white shadow-lg">
          <Sidebar />
        </aside>
      

        {/* Main Content Area */}
        <div className="ml-[20%] w-[80%] p-6 space-y-6">
          {/* Table Section for Open Jobs */}
          <div className="bg-[#F0CBf0] rounded-lg shadow-lg p-6 h-full"> {/* Updated background color */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-black-600 flex items-center">
                <FaClipboardList className="mr-2 " /> Jobs
              </h2>
              <div className="flex justify-end space-x-2">
                <button onClick={handleCreateJob} className="flex items-center bg-purple-900 text-white px-4 py-2 rounded">
                  <FaPlus className="mr-2" /> Create New Job
                </button>
                <div className="relative z-10" ref={filterDropdownRef}>
                  <button onClick={toggleFilterDropdown} className="flex items-center bg-purple-900 text-white px-4 py-2 rounded">
                    <FaFilter className="mr-2" /> Filter
                  </button>
                  {filterDropdownVisible && (
                    <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg">
                      <ul>
                        <li className="p-2 hover:bg-gray-200 cursor-pointer" onClick={() => handleFilterOptionClick('all')}>All Jobs</li>
                        <li className="p-2 hover:bg-gray-200 cursor-pointer" onClick={() => handleFilterOptionClick('open')}>Open Jobs</li>
                        <li className="p-2 hover:bg-gray-200 cursor-pointer" onClick={() => handleFilterOptionClick('closed')}>Closed Jobs</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="overflow-y-auto h-4/5"> {/* Increased height to utilize more of the screen */}
              <table className="w-full border-collapse">
                <thead className="bg-[#800080] text-white sticky top-0">
                  <tr>
                    <th className="p-3 border border-purple-900 rounded-tl-lg text-left">Actions</th>
                    <th className="p-3 border border-purple-900 text-left">Sr</th>
                    <th className="p-3 border border-purple-900 text-left">
                      <FaBriefcase className="inline mr-1" /> Job Title
                    </th>
                    <th className="p-3 border border-purple-900 text-left">
                      <FaUserFriends className="inline mr-1" /> Vacancy
                    </th>
                    <th className="p-3 border border-purple-900 rounded-tr-lg text-left">No of Applications</th>
                    <th className="p-3 border border-purple-900 rounded-tr-lg text-left">Job Status</th>
                    <th className="p-3 border border-purple-900 rounded-tr-lg text-left">Add Available Slots</th>
                  </tr>
                </thead>
                <tbody className="text-center text-gray-700">
                  {jobs.map((job, index) => (
                    <tr key={index} className="hover:bg-purple-50 transition-colors duration-200">
                      <td className="p-3 border border-purple-200 text-left relative">
                        <div>
                          <button onClick={() => toggleDropdown(index)}>
                            <FaEllipsisV />
                          </button>
                          {dropdownVisible === index && (
                            <div className="absolute bg-white border rounded shadow-lg mt-2 z-20">
                              <ul>
                                <li className="p-2 hover:bg-gray-200 cursor-pointer" onClick={() => handleViewCandidates(job.id)}>View Candidates</li>
                                <li className="p-2 hover:bg-gray-200 cursor-pointer" onClick={() => openEditModal(job)}>Edit Job</li>
                                <li className="p-2 hover:bg-gray-200 cursor-pointer" onClick={() => closeOpenedJob(job.id)}>Close Job</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 border border-purple-200 text-left">{index + 1}</td>
                      <td className="p-3 border border-purple-200 text-left">{job.title}</td>
                      <td className="p-3 border border-purple-200 text-left">{job.vacancy}</td>
                      <td className="p-3 border border-purple-200 text-left">{job.applications}</td>
                      <td className="p-3 border border-purple-200 text-left">{job.status}</td>
                      <td className="p-3 border border-purple-200 text-left">Add Slots</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600">Total Records: {jobs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-8 rounded shadow-lg z-50">
            <h2 className="text-xl font-bold mb-4">Edit Job</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Job Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={selectedJob.title}
                  onChange={(e) => setSelectedJob({ ...selectedJob, title: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Job Description
                </label>
                <textarea
                  id="description"
                  value={selectedJob.description_text}
                  onChange={(e) => setSelectedJob({ ...selectedJob, description_text: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="status-open"
                    name="status"
                    value="open"
                    checked={selectedJob.status === 'open'}
                    onChange={(e) => setSelectedJob({ ...selectedJob, status: e.target.value })}
                    className="mr-2"
                  />
                  <label htmlFor="status-open" className="mr-4">Open</label>
                  <input
                    type="radio"
                    id="status-closed"
                    name="status"
                    value="closed"
                    checked={selectedJob.status === 'closed'}
                    onChange={(e) => setSelectedJob({ ...selectedJob, status: e.target.value })}
                    className="mr-2"
                  />
                  <label htmlFor="status-closed">Closed</label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="deadline">
                  Deadline
                </label>
                <input
                  type="date"
                  id="deadline"
                  value={selectedJob.deadline}
                  onChange={(e) => setSelectedJob({ ...selectedJob, deadline: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-900 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentOpenJobs;