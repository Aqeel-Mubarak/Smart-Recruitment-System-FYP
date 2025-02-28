import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaUpload,
  FaClipboardList,
  FaBriefcase,
  FaCalendarAlt,
  FaChartBar,
  FaVideo,
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();

  const isHome = location.pathname === '/home';
  const isResumeUpload = location.pathname === '/resume-upload';
  const isCreateJob = location.pathname === '/create-job';
  const isOpenJobs = location.pathname === '/open-jobs';
  const isShortlistCandidate = location.pathname === '/shortlist-candidate';
  const isUpcomingInterviews = location.pathname === '/upcoming-interviews';
  const isReports = location.pathname === '/reports';
  const isVideo = location.pathname === '/video-analysis';

  return (
    <aside className="w-64 bg-white text-gray-800 shadow-lg">
      <div className="p-6">
        <ul className="space-y-2">

          {/* Home Page Link */}
          <li>
            <Link
              to="/home"
              className={`sidebar-home-link flex justify-between items-center p-2 text-gray-800 hover:text-[#800080] hover:bg-gray-100 rounded-lg ${
                isHome ? 'bg-[#F0CBF0]' : ''
              }`}
            >
              <span className="font-medium">Home</span>
              <FaHome className="text-[#800080]" />
            </Link>
            <hr className="border-[#800080]" />
          </li>

          {/* Resume Upload */}
          <li>
            <Link
              to="/resume-upload"
              className={`sidebar-resume-link flex justify-between items-center p-2 text-gray-800 hover:text-[#800080] hover:bg-gray-100 rounded-lg ${
                isResumeUpload ? 'bg-[#F0CBF0]' : ''
              }`}
            >
              <span className="font-medium">Resume Upload</span>
              <FaUpload className="text-[#800080]" />
            </Link>
            <hr className="border-[#800080]" />
          </li>

          {/* Create Job */}
          <li>
            <Link
              to="/create-job"
              className={`sidebar-createjob-link flex justify-between items-center p-2 text-gray-800 hover:text-[#800080] hover:bg-gray-100 rounded-lg ${
                isCreateJob ? 'bg-[#F0CBF0]' : ''
              }`}
            >
              <span className="font-medium">Create Job</span>
              <FaClipboardList className="text-[#800080]" />
            </Link>
            <hr className="border-[#800080]" />
          </li>

          {/* Open Jobs */}
          <li>
            <Link
              to="/open-jobs"
              className={`sidebar-openjobs-link flex justify-between items-center p-2 text-gray-800 hover:text-[#800080] hover:bg-gray-100 rounded-lg ${
                isOpenJobs ? 'bg-[#F0CBF0]' : ''
              }`}
            >
              <span className="font-medium">Jobs</span>
              <FaBriefcase className="text-[#800080]" />
            </Link>
            <hr className="border-[#800080]" />
          </li>

          {/* Shortlist Candidates */}
          <li>
            <Link
              to="/shortlist-candidate"
              className={`sidebar-shortlist-link flex justify-between items-center p-2 text-gray-800 hover:text-[#800080] hover:bg-gray-100 rounded-lg ${
                isShortlistCandidate ? 'bg-[#F0CBF0]' : ''
              }`}
            >
              <span className="font-medium">Shortlist Candidates</span>
              <FaClipboardList className="text-[#800080]" />
            </Link>
            <hr className="border-[#800080]" />
          </li>

          {/* Upcoming Interviews */}
          <li>
            <Link
              to="/upcoming-interviews"
              className={`sidebar-upcoming-link flex justify-between items-center p-2 text-gray-800 hover:text-[#800080] hover:bg-gray-100 rounded-lg ${
                isUpcomingInterviews ? 'bg-[#F0CBF0]' : ''
              }`}
            >
              <span className="font-medium">Upcoming Interviews</span>
              <FaCalendarAlt className="text-[#800080]" />
            </Link>
            <hr className="border-[#800080]" />
          </li>

          {/* Reports */}
          <li>
            <Link
              to="/reports"
              className={`sidebar-reports-link flex justify-between items-center p-2 text-gray-800 hover:text-[#800080] hover:bg-gray-100 rounded-lg ${
                isReports ? 'bg-[#F0CBF0]' : ''
              }`}
            >
              <span className="font-medium">Reports</span>
              <FaChartBar className="text-[#800080]" />
            </Link>
            <hr className="border-[#800080]" />
          </li>
          {/* Video Analysis */}
          <li>
            <Link
              to="/video-analysis"
              className={`sidebar-reports-link flex justify-between items-center p-2 text-gray-800 hover:text-[#800080] hover:bg-gray-100 rounded-lg ${
                isVideo ? 'bg-[#F0CBF0]' : ''
              }`}
            >
              <span className="font-medium">Video Analysis</span>
              <FaVideo className="text-[#800080]" />
            </Link>
            <hr className="border-[#800080]" />
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
