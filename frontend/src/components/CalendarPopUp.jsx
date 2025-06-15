// CalendarPopUp Component - A modal component for displaying and managing calendar event details
// Used for both viewing event details and managing bookings for job interviews
import React, { useState } from "react";
import axios from "axios";
import { useAppContext } from "./AppContext";
import moment from "moment";

const CalendarPopUp = (props) => {
  // Destructuring context values for managing popup state, events, and user information
  const { popUp, setPopUp, events, setEvents } = useAppContext();
  const jobtitle = props.jobtitle;
  const hiringmanagerid = props.hiringmanagerid;
  const jobid = props.jobid;
  const [status, setStatus] = useState(props.status);
  const { user, setUser, booked, setBooked, candidateid, setCandidateid } = useAppContext()
  console.log(user)
  console.log(booked)

  // Event handler for title input changes
  const handleChange = (event) => {
    setTitle(event.target.value);
  };

  // Handles saving a new calendar event
  // Makes API call to add event and then refreshes the calendar data
  const handleSave = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    console.log(jobtitle,
      props.startdate,
      props.starttime,
      props.enddate,
      props.endtime,
      hiringmanagerid
      , jobid)
    axios
      .post(`${API_BASE_URL}/add_data_to_calendar`, {
        jobtitle: jobtitle,
        startdate: props.startdate,
        starttime: props.starttime,
        enddate: props.enddate,
        endtime: props.endtime,
        status: 'false',
        hiringmanagerid: hiringmanagerid,
        jobid: jobid
      })
      .then(() => {
        return axios.get(`${API_BASE_URL}/get_jobdata_from_calendar`, { params: { hiringmanagerid: hiringmanagerid, jobid: jobid } });
      })
      .then((response) => {
        console.log(response.data)
        // Format the events data for calendar display
        const formattedEvents = response.data.map((event) => ({
          title: event.jobtitle,
          start: moment(event.startdate + event.starttime).format(
            "YYYY-MM-DDTHH:mm:ss"
          ),
          end: moment(event.enddate + event.endtime).format(
            "YYYY-MM-DDTHH:mm:ss"
          ),
        }));
        setEvents(formattedEvents);
        console.log("Events reloaded:", formattedEvents);
      })
      .catch((error) => {
        console.error("Error saving appointment:", error);
      })
      .finally(() => {
        setPopUp(false); // Close popup
      });
  };

  // Fetches the current status of an event
  const statusfunction = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    axios
      .get(`${API_BASE_URL}/get_status`, {
        params: {
          jobtitle: title, startdate: startdate, starttime: starttime, enddate: enddate, endtime: endtime
          , hiringmanagerid: hiringmanagerid, jobid: jobid
        }
      })
      .then((response) => {
        console.log(response.data.status)
        setStatus(response.data.status)
      })
      .catch((error) => {
        console.error('Error getting status:', error);
      });
  }

  // Handles deletion of a calendar event
  // Makes API call to delete event and refreshes calendar data
  const handleDelete = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    console.log(jobtitle,
      props.startdate,
      props.starttime,
      props.enddate,
      props.endtime,
      hiringmanagerid
      , jobid)
    axios
      .delete(`${API_BASE_URL}/delete_data_from_calendar`, {
        data: {
          jobtitle: jobtitle,
          startdate: props.startdate,
          starttime: props.starttime,
          enddate: props.enddate,
          endtime: props.endtime,
          status: '',
          hiringmanagerid: hiringmanagerid,
          jobid: jobid
        },
      })
      .then(() => {
        console.log("Appointment deleted successfully.");
        console.log(hiringmanagerid, jobid)
        return axios.get(`${API_BASE_URL}/get_jobdata_from_calendar`, { params: { hiringmanagerid: hiringmanagerid, jobid: jobid } });
      })
      .then((response) => {
        // Format and update events after deletion
        const formattedEvents = response.data.map((event) => ({
          title: event.title,
          start: moment(event.startdate + event.starttime).format(
            "YYYY-MM-DDTHH:mm:ss"
          ),
          end: moment(event.enddate + event.endtime).format(
            "YYYY-MM-DDTHH:mm:ss"
          ),
        }));
        setEvents(formattedEvents);
        console.log("Events reloaded after deletion:", formattedEvents);
      })
      .catch((error) => {
        console.error("Error deleting appointment:", error);
      })
      .finally(() => {
        setPopUp(false); // Close popup
      });
  };

  // Handles booking status updates for candidates
  // Updates the booking status and closes the popup
  const handleStatus = () => {
    console.log(booked)
    setBooked(true)
    console.log(booked)

    axios.put(
      `/update_status`,
      {
        jobtitle: jobtitle,
        startdate: props.startdate,
        starttime: props.starttime,
        enddate: props.enddate,
        endtime: props.endtime,
        status: status,
        hiringmanagerid: hiringmanagerid,
        jobid: jobid,
        candidate_id: candidateid
      } // Query parameters
    )
      .then((response) => {
        setStatus(!status)
        console.log("Status.", status);
      })
      .catch((error) => {
        console.error("Error Booking appointment:", error);
      })
      .finally(() => {
        console.log(booked)
        setPopUp(false)
          ; // Close popup
      });
  };

  // Render the popup modal with event details and action buttons
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6 text-center relative">
        <h2 className="text-2xl text-purple-600 font-bold mb-6">
          Event Details
        </h2>
        {/* Title input field */}
        <div className="text-start">
          <label className="text-lg font-bold mx-4">Title</label>
          <input
            className="border border-gray-300 p-2 mt-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            // onChange={handleChange}
            value={jobtitle}
            placeholder="Enter your title here"
          />
        </div>
        {/* Event details display section */}
        <div className="text-left mt-4">
          <p className="text-lg font-semibold p-2">
            <strong>Start Date :</strong> {props.startdate}
          </p>
          <p className="text-lg font-semibold p-2">
            <strong>Start Time :</strong> {props.starttime}
          </p>
          <p className="text-lg font-semibold p-2">
            <strong>End Date :</strong> {props.enddate}
          </p>
          <p className="text-lg font-semibold p-2">
            <strong>End Time :</strong> {props.endtime}
          </p>
          {/* Status display for non-HR users */}
          {user != 'HR' && <p className="text-lg font-semibold p-2">
            <strong>Status :</strong> {status == "true" ? "Booked " : "Available"}
          </p>}
          {/* Warning message for users who have already booked */}
          {user != 'HR' && booked === true && <p className="text-base font-semibold p-2 text-red-600">
            <strong>You have already done your booking</strong>
          </p>}
        </div>
        {/* Action buttons section - different buttons shown based on user role */}
        <div className="flex justify-between mt-8">
          {/* Book button for non-HR users */}
          {user != 'HR' && <button
            onClick={() => {
              if (booked === false) {
                { handleStatus() };
              }
            }}
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition"
          >
            Book Here
          </button>}
          {/* Delete and Save buttons for HR users */}
          {user === 'HR' && <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          >
            Delete
          </button>}
          {user === 'HR' && <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
          >
            Save
          </button>}
          {/* Close button for all users */}
          <button
            onClick={() => setPopUp(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarPopUp;
