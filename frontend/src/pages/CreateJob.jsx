import React, { useState } from "react";
import Navbarapp from "../components/Navbarapp";
import Sidebar from "../components/Sidebar";
import { useNavigate } from 'react-router-dom';
import axios from "axios";


function CreateJob(){
    const navigate = useNavigate();
    const [jobTitle,setJobTitle] = useState('')
    const [description,setDescription] = useState('')
    const handleJobTitle = (e) => {
        setJobTitle(e.target.value)
    }
    const handleDescription = (e) => {
        setDescription(e.target.value)
    }
    const handleSlots = () => {
        console.log(jobTitle)
        navigate(`/Calendar/${jobTitle}`);
    }
    const linkkk=`http://localhost:5173/Calendar/${jobTitle}`
    const handleEmail = () => {
        console.log('udfhskj')
        const fetchCandidates = async () => {
            console.log(jobTitle)
            try {
              const response = await axios.get('http://127.0.0.1:8000/candidates_of_job',{
                params:{
                    title:jobTitle
                }
              });
              console.log(response.data)
            } catch (error) {
              console.error('Error fetching candidates:', error);
            }
          };
          const sendEmail = async (recipientEmail) => {
            try {
              const response = await axios.post("http://127.0.0.1:8000/send_email/", {
                to_email: recipientEmail,
                subject: "Job Application Update",
                body: `Hello, this is to inform you about the status of your application. ${linkkk}`,
              });
          
              console.log("Email sent successfully:", response.data);
              alert("Email sent successfully!");
            } catch (error) {
              console.error("Error sending email:", error.response?.data || error.message);
              alert("Failed to send email.");
            }
          };
          
          // Example trigger
          const handleSendEmail = () => {
            const recipientEmail = "bsdsf21m015@pucit.edu.pk";
            sendEmail(recipientEmail);
          };      
          fetchCandidates();
          handleSendEmail();
    }
    const handleCreateJob = () => {
        console.log(jobTitle,description)
        axios
          .post("http://127.0.0.1:8000/add_job_description", {
            title: jobTitle,
            description_text: description,
          })
          .then((response) => {
            console.log("Job data saved successfully:", response.data);
          })
          .catch((error) => {
            console.error("Error saving Job Data:", error);
          });
      };
      
  
    
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <Navbarapp />

      {/* Main Content Section */}
      <div className="flex flex-1" style={{ marginTop: '4rem' }}>
        {/* Sidebar */}
        <Sidebar />
        <div className="" style={{ marginTop: '2rem' }}>
            <h1 className="ml-8 mb-8 bol text-2xl font-bold">Job Title</h1>
            <input onChange={handleJobTitle} className="ml-8 mb-2 text-2xl"/>
            <h1 className="ml-8 mb-8 text-2xl font-bold">Job Description</h1>
            <div className="flex flex-row">
            <textarea className='ml-8' rows={12} cols={80} onChange={handleDescription}/>
            <div className="flex flex-col">
                <h1 className="ml-8 mb-8 bol text-2xl font-bold">Deadline</h1>
                <input type='date' className="ml-8 mb-2 text-2xl"/>
                <button className=" my-4 ml-20 text-xl  border-x-200 px-20 py-3 text-white bg-black rounded-lg" onClick={handleSlots}> Add Available Slots</button>
                <button className=" my-4 ml-20 text-xl  border-x-200 px-20 py-3 text-white bg-black rounded-lg" onClick={handleEmail}> &#x1F517; Share</button>
            </div>
            </div>
            <button className=" my-4 ml-40 text-2xl  border-x-400 px-20 py-3 text-white bg-black rounded-lg" onClick={handleCreateJob}> &#x1F4C4; Create Job</button>
            
        </div>
        </div>
        </div>
    )
    
}

export default CreateJob;