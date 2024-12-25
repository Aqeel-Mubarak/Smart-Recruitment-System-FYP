// CurrentOpenJobs.jsx
import React from "react";
import { FaClipboardList, FaUserFriends, FaBriefcase } from 'react-icons/fa';
import Navbarapp from "../components/Navbarapp";
import Sidebar from "../components/Sidebar";
import { useState,useEffect } from "react";
import axios from "axios"
import JobsForCreateOpenJobs from "../components/JobsForCreateOpenJobs";

const CurrentOpenJobs = () => {
  
  const [jobs,setJobs]=useState([])
  const hiringmanagerid=3;
  useEffect (()=> {
    axios.get('http://127.0.0.1:8000/get_job_description',{params:{hiringmanagerid:hiringmanagerid}})
    .then((response)=> {
        setJobs(response.data.jobs)
  })
    .catch((error)=>{
      console.log(error)
    })
  },[])


  return (
    <div className="h-screen flex flex-col">
      {/* Navbar */}
      <Navbarapp />

      {/* Main Content Section */}
      <div className="flex flex-1">
        {/* Sidebar with same top margin */}
        <div className="mt-14">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-100 p-8 mt-12">
          {/* Table Section for Open Jobs */}
          <div className="bg-[#F0CBf0] rounded-lg shadow-lg p-6 h-full"> {/* Updated background color */}
            <h2 className="text-2xl font-bold mb-4 text-black-600 flex items-center">
              <FaClipboardList className="mr-2 " />  Open Jobs
            </h2>
            <div className="overflow-y-auto h-4/5"> {/* Increased height to utilize more of the screen */}
              <table className="w-full border-collapse">
                <thead className="bg-[#800080] text-white sticky top-0">
                  <tr>
                    <th className="p-3 border border-purple-900 rounded-tl-lg text-left">Sr</th>
                    <th className="p-3 border border-purple-900 text-left">
                      <FaBriefcase className="inline mr-1" /> Job Title
                    </th>
                    <th className="p-3 border border-purple-900 text-left">
                      <FaUserFriends className="inline mr-1" /> Vacancy
                    </th>
                    <th className="p-3 border border-purple-900 rounded-tr-lg text-left">No of Applications</th>
                    <th className="p-3 border border-purple-900 rounded-tr-lg text-left">Add Available Slots</th>
                  </tr>
                </thead>
                <tbody className="text-center text-gray-700">
                  {jobs.map((job, index) => (
                    <JobsForCreateOpenJobs key={index} {...job} index={index} />
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
    </div>
  );
};

export default CurrentOpenJobs;
