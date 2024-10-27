import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCircle } from 'react-icons/fa'; // Importing an icon from react-icons

const CandidatesList = () => {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    // Fetch the list of candidates with extracted resume text
    axios.get('http://127.0.0.1:8000/candidates')
      .then(response => {
        setCandidates(response.data);
      })
      .catch(error => {
        console.error('Error fetching candidates:', error);
      });
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 pb-2 border-gray-200">
        Candidates List
      </h2>
      {candidates.length === 0 ? (
        <p className="text-gray-500 text-lg">No candidates found.</p>
      ) : (
        <div className="space-y-8"> {/* Changed from grid to a vertical space between items */} 
          {candidates.map(candidate => (
            <div
              key={candidate.id}
              className="p-6 border border-gray-200 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <FaUserCircle className="text-4xl text-blue-500 mr-3" /> {/* User icon */}
                <h3 className="text-2xl font-semibold text-gray-800">
                  {candidate.name}
                </h3>
              </div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-500 text-sm">AI Score: <span className="font-semibold text-gray-800">{candidate.score}</span></p>
              </div>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {candidate.resume_text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidatesList;
