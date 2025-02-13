import React from "react";
import NavbarApp from "../components/Navbarapp";
import Sidebar from "../Components/Sidebar";

const interviews = [
  {
    jobTitle: "Software Engineer",
    name: "Najam ul Hassan",
    email: "name.example@gmail.com",
    date: "12 Sep 2020",
    time: "12:00 P.M"
  },
  {
    jobTitle: "Project Manager",
    name: "Ali Ahmed",
    email: "ali.ahmed@gmail.com",
    date: "15 Sep 2020",
    time: "10:00 A.M"
  },
  {
    jobTitle: "Data Scientist",
    name: "Sarah Khan",
    email: "sarah.khan@gmail.com",
    date: "18 Sep 2020",
    time: "02:00 P.M"
  }
];

const UpcomingInterviews = () => {
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
            {interviews.map((interview, index) => (
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
                      {interview.jobTitle}
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
                          {interview.name}
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingInterviews;
