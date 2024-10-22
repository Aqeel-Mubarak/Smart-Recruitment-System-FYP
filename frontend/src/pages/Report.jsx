import React from "react";
import Navbarapp from "../components/Navbarapp";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Tabledrow from "../components/Tabledrow";
import Tablehrow from "../components/Tablehrow";
import HorizontalHistogram from "../components/HorizontalHistogram";
import { Bubble } from "react-chartjs-2";

function Report(){
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <Navbarapp />

      {/* Main Content Section */}
      <div className="flex flex-1" style={{ marginTop: '4rem' }}>
        {/* Sidebar */}
        <Sidebar />
        <div className="flex flex-row">
        <div className="flex flex-col">
            <h1 className=" ml-20 font-bold text-6xl text-purpleCustom"> Top Candidates</h1>
        <table className="bg-custompink table-auto border-collapse border border-gray-500 m-4">
            <thead>
                <Tablehrow Name='Name' Email='Email' AIScore='AI Score' Status='Status' InterviewSummary='Interview Summary'/>
            </thead>
            <tbody>
                <Tabledrow Name='' Email='' AIScore='' Status='' InterviewSummary=''/>
                <Tabledrow Name='' Email='' AIScore='' Status='' InterviewSummary=''/>
                <Tabledrow Name='' Email='' AIScore='' Status='' InterviewSummary=''/>
                <Tabledrow Name='' Email='' AIScore='' Status='' InterviewSummary=''/>
                <Tabledrow Name='' Email='' AIScore='' Status='' InterviewSummary=''/>
                <Tabledrow Name='' Email='' AIScore='' Status='' InterviewSummary=''/>
                <Tabledrow Name='' Email='' AIScore='' Status='' InterviewSummary=''/>
                <Tabledrow Name='' Email='' AIScore='' Status='' InterviewSummary=''/>
                <Tabledrow Name='' Email='' AIScore='' Status='' InterviewSummary=''/>
                <Tabledrow Name='' Email='' AIScore='' Status='' InterviewSummary=''/>
            </tbody>
        </table>
        </div>
        <div className="flex flex-col">
            <div className="">
            <HorizontalHistogram />
            </div>
            <h1 className=" m-4 ml-40 text-xl text-purpleCustom font-bold ">&#8599; Export Report</h1>
            <button className=" my-4 mx-20 text-xl  border-x-400 px-20 py-3 text-white bg-black rounded-lg"> &#x1F4C4; Export to PDF</button>
            <button   className=" my-4 mx-20 text-xl  border-x-400 px-20 py-3 text-white bg-black rounded-lg" >&#x1F4CA; Export to CSV</button>
            <button className=" my-4 mx-20 text-xl  border-x-400 px-20 py-3 text-white bg-black rounded-lg">&#x1F4C8; Export to Excel</button>
        </div>
        </div>
        </div>
        </div>
    )
    
}

export default Report;