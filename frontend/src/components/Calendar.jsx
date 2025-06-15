import React from 'react';
import { format, addMonths, addYears, isSameDay, isAfter, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarStore } from '../store';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { addDays } from 'date-fns';

// Calendar component that displays a monthly calendar with navigation controls
function Calendar() {
  // Get URL parameters and calendar store state
  const { isManagement1 } = useParams();
  const { selectedDate, setSelectedDate,selectedJob, fetchTimeSlots,timeSlots} = useCalendarStore();
  
  // Calculate the start and end of the current month
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const today = new Date();

  // Fetch available time slots when a job is selected
  useEffect(() => {
    if (selectedJob) {
      fetchTimeSlots(selectedJob.id);  // Fetch slots for the selected job
    }
  }, [selectedJob, fetchTimeSlots]);

  // Handle date selection in the calendar
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  // Navigation functions for month and year
  const previousMonth = () => {
    setSelectedDate(addMonths(selectedDate, -1));
  };

  const nextMonth = () => {
    setSelectedDate(addMonths(selectedDate, 1));
  };

  const previousYear = () => {
    setSelectedDate(addYears(selectedDate, -1));
  };

  const nextYear = () => {
    setSelectedDate(addYears(selectedDate, 1));
  };

  // Format selected date and get available time slots for that date
  console.log('Selected Date:', selectedDate);  
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  const slotsForSelectedDate = timeSlots[formattedDate] || [];

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow">
      <div className="p-4">
        {/* Calendar header with navigation controls */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousYear}
            className="text-blue-500 hover:text-blue-700 text-xl px-2"
          >
            «
          </button>
          <button
            onClick={previousMonth}
            className="text-blue-500 hover:text-blue-700 text-xl px-2"
          >
            ‹
          </button>
          <h2 className="text-lg font-semibold text-blue-500">
            {format(selectedDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={nextMonth}
            className="text-blue-500 hover:text-blue-700 text-xl px-2"
          >
            ›
          </button>
          <button
            onClick={nextYear}
            className="text-blue-500 hover:text-blue-700 text-xl px-2"
          >
            »
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {Array.from({ length: 7 }).map((_, index) => {
            const firstDayOfMonth = startOfMonth(selectedDate);
            const dayOfWeek = addDays(firstDayOfMonth, index); // Get the day of the week for each day in the first week
            return (
              <div
                key={index}
                className="text-center text-xs font-medium text-gray-500 border-b pb-1"
              >
                {format(dayOfWeek, 'EEE').toUpperCase()} {/* Format the date to show the day name */}
              </div>
            );
          })}
        </div>

        {/* Calendar grid with dates */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((date) => {
            // Determine various states for each date cell
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);
            const isPast = !isAfter(date, today) && !isSameDay(date, today);
            const isCurrentMonth = isSameMonth(date, selectedDate);
            const isSunday = date.getDay() === 0;
            const isSaturday = date.getDay() === 6;

            return (
              <button
                key={date.toString()}
                onClick={() => handleDateClick(date)}
                className={`
                  p-2 text-sm rounded-lg transition-colors
                  ${isSelected ? 'bg-blue-500 text-white' : ''}
                  ${isToday ? 'border border-blue-500' : ''}
                  ${!isCurrentMonth ? 'text-gray-300' : ''}
                  ${(isSunday || isSaturday) && !isPast ? 'text-red-500' : ''}
                  ${isCurrentMonth && !isPast && !isSelected ? 'text-gray-700' : ''}
                `}
              >
                {format(date, 'd')}
              </button>
              
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Calendar;

