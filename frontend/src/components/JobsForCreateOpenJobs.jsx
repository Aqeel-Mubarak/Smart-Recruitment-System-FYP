import React from "react";
import { useNavigate } from "react-router-dom";
import { Await } from "react-router-dom";
import axios from "axios";


const JobsForCreateOpenJobs = (props) => {
    console.log(props)
    const applications=10;
    const navigate = useNavigate();
      const handleSlots = async () => {
          console.log(props.id,props.hr_id,props.title)
          try {
              const response = await  axios.post('http://127.0.0.1:8000/encryptid',
                {
                  value:[props.hr_id,props.id]
                }
                );
              console.log(response.data)
              const hiringmanagerid=response.data.encodedlst[0];
              const jobid=response.data.encodedlst[1];
              console.log(response.data.encodedlst)
              navigate(
                `/Calendar/${hiringmanagerid}/${jobid}`,
                { state: { title: props.title } }
              );
            } catch (error) {
              console.error('Error encoding candidates:', error);
            }

          
      }
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