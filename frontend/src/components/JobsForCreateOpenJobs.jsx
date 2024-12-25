import React from "react";
import { useNavigate } from "react-router-dom";


const JobsForCreateOpenJobs = (props) => {
    console.log(props)
    const applications=10;
    const navigate = useNavigate();
      const handleSlots = () => {
          console.log(props.id,props.hiringmanagerid,props.title)
          navigate(
            `/Calendar/${props.hiringmanagerid}/${props.id}`,
            { state: { title: props.title } }
          );

          
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