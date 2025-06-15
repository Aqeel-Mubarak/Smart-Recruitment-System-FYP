import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useCalendarStore } from '../store';
import { useNavigate } from 'react-router-dom';

// TimeSlots component for managing and displaying interview time slots
// Handles both management view (creating slots) and candidate view (booking slots)
function TimeSlots() {
  // Destructure required state and functions from the calendar store
  const {
    selectedDate,
    timeSlots,
    selectedJob,
    isManagement,
    slotDuration,
    addTimeSlot,
    selectTimeSlot,
    removeTimeSlot,
    fetchTimeSlots,
    userEmail,
    pastSlot,
    setPastSlot,
  } = useCalendarStore();
  const navigate = useNavigate();

  // Local state for handling drag interactions
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [filteredSlots, setFilteredSlots] = useState([]);
  
  // Format the selected date to use as a key for timeSlots object
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  console.log(timeSlots)
  const slotsForDate = timeSlots[dateKey] || [];

  // Effect to filter slots based on selected job and user role
  useEffect(() => {
    const fetchAndFilterSlots = async () => {
      if (slotsForDate && selectedJob) {
        const filtered = slotsForDate.filter((slot) => {
          return isManagement ? slot.jobId === selectedJob.id : true;
        });
        setFilteredSlots(filtered);
        console.log('Filtered Slots:', filtered);
      }
    };

    fetchAndFilterSlots();
  }, [slotsForDate, selectedJob, isManagement,timeSlots,selectTimeSlot,
    removeTimeSlot,fetchTimeSlots]);

  // Effect to fetch time slots when selected job changes
  useEffect(() => {
    const fetchAndUpdateSlots = async () => {
      if (selectedJob) {
        await fetchTimeSlots(selectedJob.id);
      }
    };
    fetchAndUpdateSlots();
  }, [selectedJob, fetchTimeSlots]);

  // Navigation handler for management view
  const handleReturn = () => {
    if (isManagement){
          navigate("/open-jobs")
    }
  }

  // Generate array of time slots from 8 AM to 8 PM with specified interval
  const generateTimeSlots = () => {
    const slots = [];
    const interval = slotDuration;
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  // Handle slot interaction (creation/deletion) with validation for past dates/times
  const handleSlotInteraction = async (startTime) => {
    if (!selectedJob) return;
    console.log(startTime);
    // Create current date and slot time objects
    const now = new Date();
    const slotTime = new Date(selectedDate);
    const [hours, minutes] = startTime.split(':').map(Number);
    slotTime.setHours(hours, minutes, 0, 0);
  
    // Date comparison logic
    const selectedDay = new Date(selectedDate);
    selectedDay.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
  
    // Prevent adding if: selected date is past OR (selected date is today AND slot time is past)
    if (selectedDay < today || (selectedDay.getTime() === today.getTime() && slotTime < now)) {
      console.log("hhrjfjrf")
      setPastSlot('Select a valid time slot ')
      console.log(pastSlot)

      return;
    }
    console.log("hhrjfjrf")
    setPastSlot('')
    console.log(pastSlot)
    
    // Calculate end time based on slot duration
    const endTime = format(
      new Date(slotTime.getTime() + slotDuration * 60000),
      'HH:mm'
    );
  
    // Create new slot object
    const newSlot = {
      id: `${dateKey}-${startTime}-${selectedJob.id}`,
      startTime,
      endTime,
      isSelected: false,
      jobId: selectedJob.id,
    };
  
    // Check if slot already exists and handle accordingly
    const existingSlot = filteredSlots.find(
      slot => slot.startTime === startTime && slot.jobId === selectedJob.id
    );
  
    if (existingSlot) {
      removeTimeSlot(dateKey, existingSlot.id);
    } else {
      addTimeSlot(dateKey, newSlot);
    }
  };

  // Mouse event handlers for drag interaction
  const handleMouseDown = (time) => {
    if (!isManagement || !selectedJob) return;
    setIsMouseDown(true);
    handleSlotInteraction(time);
  };

  const handleMouseEnter = (time) => {
    if (!isManagement || !selectedJob || !isMouseDown) return;
    handleSlotInteraction(time);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  // Handle slot selection for candidates
  const handleSlotClick = (slot) => {
    console.log("agya ha")
    if (!isManagement && slot && slot.id) {
      selectTimeSlot(dateKey, slot.id, userEmail);
    }
  };

  // Render component
  return (
    <div className="flex-1 p-4">
      {/* Legend and management controls */}
      <div className="flex items-center space-x-2 justify-between mb-4">
        <div className='flex flex-row '>
        <div>
        <div className="w-6 h-6 rounded bg-green-500 mx-4"></div>
        <span className="text-sm">Available</span>
        </div><div>
        <div className="w-6 h-6 rounded bg-red-500 ml-4"></div>
        <span className="text-sm mx-4">Booked</span>
        </div></div>
      {isManagement && <button className="mx-96 my-4 px-6 py-2 rounded-lg bg-blue-500 text-white w-48 ml-auto"  onClick={handleReturn}>Finalize SLots</button>}

      </div>

      {/* Date display and validation message */}
      <div className="flex items-center mb-6">
        <div className="w-5 h-5 text-blue-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold ml-2">
          {format(selectedDate, 'MMMM d, yyyy')}
        </h2>
        {pastSlot && <h2 className='text-xl text-red-600 ml-60 font-semibold underline animate-blink'>{pastSlot}</h2>}
      </div>

      {/* Grid of time slots */}
      <div 
        className="grid grid-cols-4 gap-4"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {generateTimeSlots().map((time) => {
          const existingSlot = filteredSlots.find(
            slot => slot.startTime === time
          );
          console.log(existingSlot)

          return (
            <div
              key={time}
              onMouseDown={() => handleMouseDown(time)}
              onMouseEnter={() => handleMouseEnter(time)}
              className={`
                p-3 rounded-lg text-center cursor-pointer transition-colors
                ${existingSlot 
                  ? existingSlot.isSelected 
                    ? 'bg-red-500 text-white'
                    : 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }
                ${isManagement ? 'hover:border-blue-500' : ''}
              `}
              onClick={() => {
                if (!isManagement && existingSlot) {
                console.log('agya')
                  handleSlotClick(existingSlot);
                }
              }}
            >
              {existingSlot ? `${time} - ${existingSlot.endTime}` : time}
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default TimeSlots;
