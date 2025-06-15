import React from "react";
import { useNavigate } from "react-router-dom";
import { Await } from "react-router-dom";
import axios from "axios";

/**
 * JobsForCreateOpenJobs Component
 * Displays a single job row in a table with options to manage job slots
 * Props:
 * - id: Job ID
 * - hr_id: Hiring Manager ID
 * - title: Job Title
 * - index: Row index number
 * - numberofpositions: Number of positions available
 */
const JobsForCreateOpenJobs = (props) => {
  // Get API base URL from environment variables
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    console.log(props)
    // Placeholder for number of applications (currently hardcoded)
    const applications=10;
    // Initialize navigation hook
    const navigate = useNavigate();

    /**
     * handleSlots Function
     * Handles the click event for managing job slots
     * Encrypts the HR ID and Job ID before navigation
     * Navigates to the Calendar page with encrypted IDs
     */
      const handleSlots = async () => {
          console.log(props.id,props.hr_id,props.title)
          try {
              // Make API call to encrypt IDs
              const response = await  axios.post(`${API_BASE_URL}/encryptid`,
                {
                  value:[props.hr_id,props.id]
                }
                );
              console.log(response.data)
              // Extract encrypted IDs from response
              const hiringmanagerid=response.data.encodedlst[0];
              const jobid=response.data.encodedlst[1];
              console.log(response.data.encodedlst)
              // Navigate to Calendar page with encrypted IDs and job title
              navigate(
                `/Calendar/${hiringmanagerid}/${jobid}`,
                { state: { title: props.title } }
              );
            } catch (error) {
              console.error('Error encoding candidates:', error);
            }

          
      }
    // Render a table row with job information and a button to manage slots
    return (
        <tr key={props.id} className="hover:bg-purple-50 transition-colors duration-200">
            <td className="p-3 border border-purple-200 text-left">{props.index + 1}</td>
            <td className="p-3 border border-purple-200 text-left">{props.title}</td>
            <td className="p-3 border border-purple-200 text-left">{props.numberofpositions}</td>
            <td className="p-3 border border-purple-200 text-left">{applications}</td>
            <td className="p-3 border border-purple-200 text-left"><button onClick={handleSlots} className=" border-2 p-3 rounded-lg shadow-lg ">Click here</button></td>
        </tr>
    )
}

export default JobsForCreateOpenJobs;