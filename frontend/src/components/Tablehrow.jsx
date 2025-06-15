// Import React library for component creation
import React from "react";

/**
 * Tablehrow Component
 * A reusable table row component that displays candidate information
 * 
 * @param {string} Name - The candidate's full name
 * @param {string} Email - The candidate's email address
 * @param {number} AIScore - The AI-generated score for the candidate
 * @param {string} Status - The current status of the candidate's application
 * @param {string} InterviewSummary - Summary of the candidate's interview performance
 */
function Tablehrow({Name,Email,AIScore,Status,InterviewSummary}){
    return (
        // Table row with consistent styling using Tailwind CSS classes
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

// Export the component for use in other parts of the application
export default Tablehrow; 

