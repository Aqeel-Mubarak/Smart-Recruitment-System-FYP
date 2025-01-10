import React, { useState } from "react";
import axios from "axios";
import { useAppContext } from "./AppContext";
import moment from "moment";

const CalendarPopUp = (props) => {

  const { popUp, setPopUp, events, setEvents } = useAppContext();
  const jobtitle = props.jobtitle;
  const hiringmanagerid = props.hiringmanagerid;
  const jobid = props.jobid;
  const [status, setStatus] = useState(props.status);
  const { user, setUser, booked, setBooked, candidateid, setCandidateid } = useAppContext()
  console.log(user)
  console.log(booked)

  // Handle title input change
  const handleChange = (event) => {
    setTitle(event.target.value);
  };

  // Handle Save Button
  const handleSave = () => {
    console.log(jobtitle,
      props.startdate,
      props.starttime,
      props.enddate,
      props.endtime,
      hiringmanagerid
      , jobid)
    axios
      .post("http://127.0.0.1:8000/add_data_to_calendar", {
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
        return axios.get("http://127.0.0.1:8000/get_jobdata_from_calendar", { params: { hiringmanagerid: hiringmanagerid, jobid: jobid } });
      })
      .then((response) => {
        console.log(response.data)
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
  const statusfunction = () => {
    axios
      .get('http://127.0.0.1:8000/get_status', {
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

  // Handle Delete Button
  const handleDelete = () => {
    console.log(jobtitle,
      props.startdate,
      props.starttime,
      props.enddate,
      props.endtime,
      hiringmanagerid
      , jobid)
    axios
      .delete("http://127.0.0.1:8000/delete_data_from_calendar", {
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
        return axios.get("http://127.0.0.1:8000/get_jobdata_from_calendar", { params: { hiringmanagerid: hiringmanagerid, jobid: jobid } });
      })
      .then((response) => {
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
  const handleStatus = () => {
    console.log(booked)
    setBooked(true)
    console.log(booked)

    axios.put(
      `http://127.0.0.1:8000/update_status`,
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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6 text-center relative">
        <h2 className="text-2xl text-purple-600 font-bold mb-6">
          Event Details
        </h2>
        <div className="text-start">
          <label className="text-lg font-bold mx-4">Title</label>
          <input
            className="border border-gray-300 p-2 mt-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            // onChange={handleChange}
            value={jobtitle}
            placeholder="Enter your title here"
          />
        </div>
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
          {user != 'HR' && <p className="text-lg font-semibold p-2">
            <strong>Status :</strong> {status == "true" ? "Booked " : "Available"}
          </p>}
          {user != 'HR' && booked === true && <p className="text-base font-semibold p-2 text-red-600">
            <strong>You have already done your booking</strong>
          </p>}
        </div>
        <div className="flex justify-between mt-8">
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
