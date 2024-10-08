import React from 'react';
import { Link } from 'react-router-dom';
import { FaUpload, FaClipboardList, FaBriefcase, FaCalendarAlt, FaChartBar } from 'react-icons/fa'; // Import icons

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white">
      <div className="p-4">
        <ul>
          <li className="mb-4">
            <Link to="#" className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded">
              <FaUpload />
              <span>Resume Upload</span>
            </Link>
          </li>
          <li className="mb-4">
            <Link to="#" className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded">
              <FaClipboardList />
              <span>Create Job</span>
            </Link>
          </li>
          <li className="mb-4">
            <Link to="#" className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded">
              <FaBriefcase />
              <span>Current Opened Jobs</span>
            </Link>
          </li>
          <li className="mb-4">
            <Link to="#" className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded">
              <FaCalendarAlt />
              <span>Upcoming Interviews</span>
            </Link>
          </li>
          <li className="mb-4">
            <Link to="#" className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded">
              <FaChartBar />
              <span>Reports</span>
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
