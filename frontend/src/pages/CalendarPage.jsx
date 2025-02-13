import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import Calendar from '../components/Calendar';
import TimeSlots from '../components/TimeSlots';
import { useCalendarStore } from '../store';
import { useLocation,useParams } from 'react-router-dom';
import axios from 'axios';
import { IoIosArrowBack } from "react-icons/io";


function CalendarPage(props) {
    const location = useLocation();
    const navigate = useNavigate();
    
    // const { jobid, hiringmanagerid } = location.state || {};
    const { isManagement1, jobid, useremail } = useParams();
    // const [selectedJob,setSelectedJob]=useState()
    const {
        isManagement,
        toggleUserType,
        slotDuration,
        setSlotDuration,
        selectedJob,
        setSelectedJob,
        setIsManagement,
        userEmail,
        setUserEmail,
      } = useCalendarStore();
    

    useEffect(() => {
      if (isManagement1 !== undefined) {
        setIsManagement(isManagement1==='true'); // Set isManagement based on URL param
      }
    }, [isManagement1, setIsManagement]);

    console.log(isManagement)

    useEffect(() => {
      if (useremail !== undefined) {
        setUserEmail(useremail); // Set isManagement based on URL param
      }
    }, [userEmail, setUserEmail]);

    console.log(userEmail,useremail)

    useEffect(() => {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const fetchCurrentJob = async () => {
          try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
              console.error('No access token found in local storage');
              return;
            }
            const config = {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            };
      
            // Make the API request
            const response = await axios.get(`${API_BASE_URL}/get_job_by_id/${jobid}`, config);
            setSelectedJob(response.data);
          } catch (error) {
            console.error('Error fetching candidates:', error);
          }
        };
      
        fetchCurrentJob();
      }, []);
    console.log(isManagement)

    const handleReturn = () => {
        if (isManagement){
          navigate("/open-jobs")
        }
    }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
               <buton className='px-6 py-2 rounded-lg bg-blue-500 text-white w-16' onClick={handleReturn}><IoIosArrowBack/></buton>
              <CalendarIcon className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold">Meeting Scheduler</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleUserType}
                className={`px-4 py-2 rounded-lg ${
                  isManagement
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {isManagement ? 'Management View' : 'User View'}
              </button>

              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(Number(e.target.value))}
                  className="border rounded-lg px-3 py-2"
                  disabled={!isManagement}
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
               <div className='px-4 py-2 rounded-lg bg-blue-500 text-white' > {selectedJob && selectedJob.title}</div>
        </div>
        </div>

          <div className="flex gap-8">
            <Calendar />
            <TimeSlots />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;