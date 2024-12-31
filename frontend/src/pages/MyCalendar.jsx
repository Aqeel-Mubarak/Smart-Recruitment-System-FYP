import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // Required for interactions like select
import axios from 'axios';
import './calendar.css'; // Custom styles for FullCalendar
import  CalendarPopUp from '../components/CalendarPopUp'
import { useAppContext } from "../components/AppContext";
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import { useParams } from "react-router-dom";
import { use } from 'react';



const MyCalendar =  () => {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('false');
  const location = useLocation();
  const title = location.state?.title;
  const {hiringmanagerid1,jobid1,candidateid1 } = useParams(); 
  const [hiringmanagerid,setHiringmanagerid]=useState()
  const [jobid,setJobid]=useState()
  const {candidateid,setCandidateid,user,setUser,booked,setBooked}=useAppContext()
  // setCandidateid(undefined)
  useEffect (() => {
    setCandidateid(candidateid1)
    setUser(candidateid1===undefined ? 'HR' : 'Candidate' )
    setBooked(false)
  },[]
  )
  console.log(user,candidateid,booked,candidateid1)
  const decode = async () => {
    try {
      const response = await  axios.post('http://127.0.0.1:8000/decryptid',
        {
          value:[hiringmanagerid1,jobid1]
        }
        );
      console.log(response.data)
      setHiringmanagerid(parseInt(response.data.decodedlst[0],10));
      setJobid(parseInt(response.data.decodedlst[1],10));
      console.log(response.data.decodedlst)
    } catch (error) {
      console.error('Error decoding candidates:', error);
    }
 
  }
  decode()
  console.log(hiringmanagerid,jobid)
  const {popUp,setPopUp} = useAppContext()
  const [time, setTime] = useState({
    hiringmanagerid:hiringmanagerid,jobid:jobid,jobtitle:title,
    startdate:'00',starttime:'00',enddate:'00',endtime:'00',status:status
  });
  // Handle date range selection
  const handleSelect = (selectionInfo) => {
    const startdate = moment(selectionInfo.start).format('YYYY-MM-DD');
    const starttime = moment(selectionInfo.start).format(' HH:mm:ss');
    const enddate = moment(selectionInfo.end).format(' YYYY-MM-DD');// Correctly get start time
    const endtime = moment(selectionInfo.end).format(' HH:mm:ss'); // Correctly get end time
    setTime({
      hiringmanagerid:hiringmanagerid,jobid:jobid,jobtitle:title ,
      startdate:startdate,starttime:starttime,enddate:enddate,endtime:endtime,status:status
    })
    console.log(time) // Update end state
    setPopUp(true);
  
    }
    const handlePopUp = () => {
      setPopUp(!popUp)
    }
    useEffect ( () => {
      axios
        .get('http://127.0.0.1:8000/get_jobdata_from_calendar',{params:{hiringmanagerid:hiringmanagerid,jobid:jobid}})     
          .then((response) => {
            const formattedEvents = response.data.map((event) => ({
              title: event.jobtitle,
              start: moment(event.startdate+event.starttime).format('YYYY-MM-DDTHH:mm:ss'), // Ensure ISO 8601 format
              end:  moment(event.enddate+event.endtime).format('YYYY-MM-DDTHH:mm:ss'),
              // status:event.status
            }));
            setEvents(formattedEvents);
            console.log(events)
          })
          .catch((error) => {
            console.error('Error booking an appointment:', error);
          });}
    ,[popUp,setPopUp,hiringmanagerid])

  const handledelete= () => {
    isDeleted(true)
  }
  
  // Handle event clicks for deleting events
  const handleEventClick = (selectionInfo) => {
    const title= (selectionInfo.event.title)
    const startdate = moment(selectionInfo.event.start).format('YYYY-MM-DD');
    const starttime = moment(selectionInfo.event.start).format(' HH:mm:ss');
    const enddate = moment(selectionInfo.event.end).format(' YYYY-MM-DD');// Correctly get start time
    const endtime = moment(selectionInfo.event.end).format(' HH:mm:ss'); // Correctly get end time
    const statusfunction = () => {
      axios
        .get('http://127.0.0.1:8000/get_status',{params:{
          jobtitle:title ,startdate:startdate,starttime:starttime,enddate:enddate,endtime:endtime
          ,hiringmanagerid:hiringmanagerid,jobid:jobid
        }})     
          .then((response) => {
            console.log(response.data.status)
            setTime({
              hiringmanagerid:hiringmanagerid,jobid:jobid,
              jobtitle:title ,startdate:startdate,starttime:starttime,enddate:enddate,endtime:endtime,status:response.data.status
            });
          })
          .catch((error) => {
            console.error('Error getting status:', error);
          })
          .finally(() => {
            setPopUp(true)
          });
    }
    statusfunction();
    ;}
    
    
  
  console.log(booked)
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center text-black" >My Calendar</h1>
      <div className="bg-white shadow-md rounded-lg p-4">
        <FullCalendar 
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          editable={true}
          selectable={true} // Enable selection
          selectMirror={true} // Show the selection visually
          select={handleSelect} // Handle selection
          events={events} // Render the events
          eventClick={handleEventClick} // Handle event clicks
          height="auto"
        />
      </div>
      {popUp &&   <CalendarPopUp jobtitle={time.jobtitle} startdate={time.startdate} starttime={time.starttime} enddate={time.enddate} endtime={time.endtime} status={time.status} hiringmanagerid={time.hiringmanagerid} jobid={time.jobid} />
  }
    </div>
  );}

export default MyCalendar;
