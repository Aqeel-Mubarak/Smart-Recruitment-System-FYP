import React from "react";

function Tabledrow({Name,Email,AIScore,Status,InterviewSummary}){
    return (
        <tr>
                <td className="border border-gray-400 px-4 py-2"><input type='checkbox'/></td>
                <td className="border border-gray-400 px-4 py-2">{Name}</td>
                <td className="border border-gray-400 px-4 py-2">{Email}</td>
                <td className="border border-gray-400 px-4 py-2">{AIScore}</td>
                <td className="border border-gray-400 px-4 py-2">{Status}</td>
                <td className="border border-gray-400 px-4 py-2">{InterviewSummary}</td>
        </tr>
    )
}

export default Tabledrow; 

