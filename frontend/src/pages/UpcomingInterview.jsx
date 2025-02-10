import React from "react"; 
import NavbarApp from "../components/NavbarApp"; 
import Sidebar from "../Components/Sidebar"; 

const interviews = [
  {
    jobTitle: "Software Engineer",
    name: "Khadija Shahzad",
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
    <div className="flex h-screen bg-gray-100">
      <aside className="fixed left-0 top-16 w-[20%] h-screen overflow-y-auto overflow-x-hidden bg-white shadow-lg">
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
                className="bg-white p-6 rounded-lg shadow-md mb-6 transition-all duration-300 hover:shadow-xl border-t-4 border-purple-600"
              >
                <div className="space-y-4">
                  {/* Job Title */}
                  <div className="flex items-center space-x-4">
                    <label className="font-medium w-1/4 text-gray-600">Job Title:</label>
                    <span className="text-gray-700">{interview.jobTitle}</span>
                  </div>

                  {/* Name and Email */}
                  <div className="flex justify-between space-x-6">
                    <div className="w-1/2">
                      <label className="font-medium text-gray-600">Name:</label>
                      <span className="text-gray-700">{interview.name}</span>
                    </div>
                    <div className="w-1/2">
                      <label className="font-medium text-gray-600">Email:</label>
                      <span className="text-gray-700">{interview.email}</span>
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="flex justify-between space-x-6">
                    <div className="w-1/2">
                      <label className="font-medium text-gray-600">Date:</label>
                      <span className="text-gray-700">{interview.date}</span>
                    </div>
                    <div className="w-1/2">
                      <label className="font-medium text-gray-600">Time:</label>
                      <span className="text-gray-700">{interview.time}</span>
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
