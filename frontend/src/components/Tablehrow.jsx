import React from "react";

function Tablehrow({Name,Email,AIScore,Status,InterviewSummary}){
    return (
        <tr>
        <th className="border border-gray-400 px-4 py-2"></th>
        <th className="border border-gray-400 px-4 py-2">{Name}</th>
        <th className="border border-gray-400 px-4 py-2">{Email}</th>
        <th className="border border-gray-400 px-4 py-2">{AIScore}</th>
        <th className="border border-gray-400 px-4 py-2">{Status}</th>
        <th className="border border-gray-400 px-4 py-2">{InterviewSummary}</th>
        </tr>
    )
}

export default Tablehrow; 

