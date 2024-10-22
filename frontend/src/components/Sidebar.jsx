import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUpload, FaClipboardList, FaBriefcase, FaCalendarAlt, FaChartBar } from 'react-icons/fa'; // Import icons

const Sidebar = () => {
  const location = useLocation();

  // Define paths for each menu item
  const isResumeUpload = location.pathname === '/resume-upload';
  const isCreateJob = location.pathname === '/create-job';
  const isOpenJobs = location.pathname === '/open-jobs';
  const isShortlistCandidate = location.pathname === '/shortlist-candidate';
  const isUpcomingInterviews = location.pathname === '/upcoming-interviews';
  const isReports = location.pathname === '/reports';

  return (
    <aside className="w-64 bg-white text-gray-800 shadow-lg">
      <div className="p-6">
        <ul className="space-y-2">
          <li>
            <Link
              to="/resume-upload"
              className={`flex justify-between items-center p-2 text-gray-800 hover:text-[#800080] hover:bg-gray-100 rounded-lg ${
                isResumeUpload ? 'bg-[#F0CBF0]' : ''
              }`}
            >
              <span className="font-medium">Resume Upload</span>
              <FaUpload className="text-[#800080]" />
            </Link>
            <hr className="border-[#800080]" />
          </li>
          <li>
            <Link
              to="/create-job"
              className={`flex justify-between items-center p-2 text-gray-800 hover:text-[#800080] hover:bg-gray-100 rounded-lg ${
                isCreateJob ? 'bg-[#F0CBF0]' : ''
              }`}
            >
              <span className="font-medium">Create Job</span>
              <FaClipboardList className="text-[#800080]" />
            </Link>
            <hr className="border-[#800080]" />
          </li>
          <li>
            <Link
              to="/open-jobs"
              className={`flex justify-between items-center p-2 text-gray-800 hover:text-[#800080] hover:bg-gray-100 rounded-lg ${
                isOpenJobs ? 'bg-[#F0CBF0]' : ''
              }`}
            >
              <span className="font-medium">Open Jobs</span>
              <FaBriefcase className="text-[#800080]" />
            </Link>
            <hr className="border-[#800080]" />
          </li>
          <li>
            <Link
              to="/shortlist-candidate"
              className={`flex justify-between items-center p-2 text-gray-800 hover:text-[#800080] hover:bg-gray-100 rounded-lg ${isShortlistCandidate ? 'bg-[#F0CBF0]' : ''
                }`}
            >
              <span className="font-medium">Shortlist Candidates</span>
              <FaClipboardList className="text-[#800080]" />
            </Link>
            <hr className="border-[#800080]" />
          </li>
          <li>
            <Link
              to="/upcoming-interviews"
              className={`flex justify-between items-center p-2 text-gray-800 hover:text-[#800080] hover:bg-gray-100 rounded-lg ${
                isUpcomingInterviews ? 'bg-[#F0CBF0]' : ''
              }`}
            >
              <span className="font-medium">Upcoming Interviews</span>
              <FaCalendarAlt className="text-[#800080]" />
            </Link>
            <hr className="border-[#800080]" />
          </li>
          <li>
            <Link
              to="/reports"
              className={`flex justify-between items-center p-2 text-gray-800 hover:text-[#800080] hover:bg-gray-100 rounded-lg ${
                isReports ? 'bg-[#F0CBF0]' : ''
              }`}
            >
              <span className="font-medium">Reports</span>
              <FaChartBar className="text-[#800080]" />
            </Link>
            <hr className="border-[#800080]" />
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
