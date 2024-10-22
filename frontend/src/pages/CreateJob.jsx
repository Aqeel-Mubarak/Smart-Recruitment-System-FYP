import React from "react";
import Navbarapp from "../components/Navbarapp";
import Sidebar from "../components/Sidebar";

function CreateJob(){
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
            <input className="ml-8 mb-2 text-2xl"/>
            <h1 className="ml-8 mb-8 text-2xl font-bold">Job Description</h1>
            <div className="flex flex-row">
            <textarea className='ml-8' rows={12} cols={80}/>
            <div className="flex flex-col">
                <h1 className="ml-8 mb-8 bol text-2xl font-bold">Deadline</h1>
                <input type='date' className="ml-8 mb-2 text-2xl"/>
                <button className=" my-4 ml-20 text-xl  border-x-200 px-20 py-3 text-white bg-black rounded-lg"> Add Available Slots</button>
                <button className=" my-4 ml-20 text-xl  border-x-200 px-20 py-3 text-white bg-black rounded-lg"> &#x1F517; Share</button>
            </div>
            </div>
            <button className=" my-4 ml-40 text-2xl  border-x-400 px-20 py-3 text-white bg-black rounded-lg"> &#x1F4C4; Create Job</button>
            
        </div>
        </div>
        </div>
    )
    
}

export default CreateJob;