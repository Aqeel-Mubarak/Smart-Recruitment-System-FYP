import React from "react";

/**
 * Tabledrow Component
 * A reusable table row component that displays candidate information in a structured format
 * 
 * @param {string} Name - The candidate's full name
 * @param {string} Email - The candidate's email address
 * @param {number} AIScore - The AI-generated score for the candidate
 * @param {string} Status - The current status of the candidate's application
 * @param {string} InterviewSummary - Summary of the candidate's interview performance
 */
function Tabledrow({Name,Email,AIScore,Status,InterviewSummary}){
    return (
        // Table row with consistent styling using Tailwind CSS classes
        <tr>
                {/* Checkbox column for selection */}
                <td className="border border-gray-400 px-4 py-2"><input type='checkbox'/></td>
                {/* Candidate name column */}
                <td className="border border-gray-400 px-4 py-2">{Name}</td>
                {/* Candidate email column */}
                <td className="border border-gray-400 px-4 py-2">{Email}</td>
                {/* AI score column */}
                <td className="border border-gray-400 px-4 py-2">{AIScore}</td>
                {/* Application status column */}
                <td className="border border-gray-400 px-4 py-2">{Status}</td>
                {/* Interview summary column */}
                <td className="border border-gray-400 px-4 py-2">{InterviewSummary}</td>
        </tr>
    )
}

// Export the component for use in other parts of the application
export default Tabledrow; 

