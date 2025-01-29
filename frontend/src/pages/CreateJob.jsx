import Navbarapp from "../components/Navbarapp";
import Sidebar from "../components/Sidebar";
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";


function CreateJob(){
    const navigate = useNavigate();
    const [jobTitle,setJobTitle] = useState('')
    const [description,setDescription] = useState('')
    
    const handleCreateJob = (e) => {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
            e.preventDefault();
            const token = localStorage.getItem('accessToken');
            if (!token) {
              console.error('No access token found in local storage');
              return;
            }
            // Create a FormData object
            const formData = new FormData(e.target);

            // Convert FormData to JSON (optional, depending on backend expectations)
            const data = Object.fromEntries(formData.entries());
                axios.post(`${API_BASE_URL}/create/add_job_description`, formData, {
            headers: {
              "Authorization": `Bearer ${token}`
            },
          })
          .then((response) => {
            console.log("Job data saved successfully:", response.data);
            window.location.reload();
          })
          .catch((error) => {
            console.error("Error saving Job Data:", error);
            window.location.reload();
          });
      };



    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <Navbarapp />

      {/* Main Content Section */}
      <div className="flex flex-1 relative" style={{ marginTop: '4rem' }}>
        {/* Sidebar */}
        <Sidebar />
        <div className="absolute w-full left-64" style={{ marginTop: '2rem' }}>
            <form onSubmit={handleCreateJob}>
                <label  className="ml-8 mb-8  bol w-[300px] text-3xl font-bold  p-2 rounded-lg" htmlFor="title">Job Title</label>
                <input  id='title' name='title' type='text' className="mt-8 mx-20 my-4  text-2xl  w-[72%] block required:"/>
                <label  className="ml-8 mb-8 text-3xl font-bold  rounded-lg block" htmlFor="description">Job Description</label>
                <textarea id='description'  name='description' className='mx-20 my-4 block text-xl required' rows={10} cols={122} />
                <label className="ml-80  mb-8 bol text-3xl font-bold border-b-2 border-black " htmlFor="deadline">Deadline</label>
                <input id='deadline' name='deadline' type='date' className="ml-40 mb-2 text-2xl border-2 border-black p-2 rounded-lg required " />
                <button className=" my-4 ml-96 text-2xl  border-x-400 px-20 py-3 text-white bg-black rounded-lg block"  type="submit"> &#x1F4C4; Create Job</button>
            </form>
        </div>
        </div>
        </div>
    )

}

export default CreateJob;
