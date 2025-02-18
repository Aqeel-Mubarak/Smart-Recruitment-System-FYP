import React, { useEffect, useState } from "react";
import NavbarApp from "../components/Navbarapp";
import Sidebar from "../components/Sidebar";
import axios from 'axios';

const UpcomingInterviews = () => {
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    // Fetch data from the API to get upcoming interviews
    const fetchInterviews = async () => {
      try {
        const response = await axios.get('http://localhost:8000/upcoming_interviews');  // Use the correct API URL
        setInterviews(response.data);  // Set the fetched interviews data in the state
      } catch (error) {
        console.error("Error fetching interviews:", error);
      }
    };

    fetchInterviews();
  }, []);

  return (
    <div className="flex h-screen bg-white">
      <aside className="fixed left-0 top-16 w-[19%] h-screen overflow-y-auto overflow-x-hidden bg-white shadow-lg z-40">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="w-4/5 ml-[20%]">
        <NavbarApp />
        <div className="p-6 mt-12">
          {/* Displaying Upcoming Interviews */}
          <div className="space-y-6">
            {interviews.length === 0 ? (
              <div className="text-center p-6 bg-purple-100 border border-purple-500 rounded-lg shadow-md">
                <h2 className="font-bold text-xl text-black">No Upcoming Interviews</h2>
                <p className="text-black">There are no upcoming interviews at the moment.</p>
              </div>
            ) : (
              interviews.map((interview, index) => (
                <div
                  key={index}
                  className="bg-purple-200 border border-purple-500 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-xl"
                >
                  {/* Job Title */}
                  <div className="flex items-center mb-4">
                    <div className="w-1/7 bg-purple-200 p-2  ">
                      <label className="font-bold text-Black">Job Title:</label>
                    </div>
                    <div className="flex-grow bg-white p-2 rounded-r-md rounded-r-md border border-purple-500 border-l-0">
                      <span className="font-semibold text-black text-left">
                        {interview.job_title}
                      </span>
                    </div>
                  </div>

                  {/* Name and Email */}
                  <div className="flex space-x-6 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="w-1/6 bg-purple-200 p-2 rounded-l-md">
                          <label className="font-bold text-Black">Name:</label>
                        </div>
                        <div className="flex-grow bg-white p-2 rounded-r-md border border-purple-200 border-l-0">
                          <span className="font-semibold text-black">
                            {interview.candidate_name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="w-1/6 bg-purple-200 p-2 rounded-l-md">
                          <label className="font-bold text-Black">Email:</label>
                        </div>
                        <div className="flex-grow bg-white p-2 rounded-r-md border border-purple-200 border-l-0">
                          <span className="font-semibold text-black">
                            {interview.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="flex space-x-6">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="w-1/6 bg-purple-200 p-2 rounded-l-md">
                          <label className="font-bold text-Black">Date:</label>
                        </div>
                        <div className="flex-grow bg-white p-2 rounded-r-md border border-purple-200 border-l-0">
                          <span className="font-semibold text-black">
                            {interview.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="w-1/6 bg-purple-200 p-2 rounded-l-md">
                          <label className="font-bold text-Black">Time:</label>
                        </div>
                        <div className="flex-grow bg-white p-2 rounded-r-md border border-purple-200 border-l-0">
                          <span className="font-semibold text-black">
                            {interview.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingInterviews;
