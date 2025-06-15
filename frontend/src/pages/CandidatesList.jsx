// Import necessary dependencies
// React core and hooks for component functionality
import React, { useState, useEffect } from 'react';
// Axios for making HTTP requests
import axios from 'axios';
// Import user icon from react-icons library
import { FaUserCircle } from 'react-icons/fa';

// Main component for displaying the list of candidates
const CandidatesList = () => {
  // State to store the list of candidates fetched from the API
  const [candidates, setCandidates] = useState([]);

  // useEffect hook to fetch candidates data when component mounts
  useEffect(() => {
    // Get API base URL from environment variables
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    
    // Async function to fetch candidates data from the API
    const fetchCandidates = async () => {
      try {
        // Retrieve authentication token from local storage
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No access token found in local storage');
          return;
        }
        // Configure request headers with authentication token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
  
        // Make API request to fetch candidates data
        const response = await axios.get(`${API_BASE_URL}/candidates`, config);
        // Update state with fetched candidates data
        setCandidates(response.data);
      } catch (error) {
        console.error('Error fetching candidates:', error);
      }
    };
  
    // Call the fetch function
    fetchCandidates();
  }, []); // Empty dependency array means this effect runs only once on mount

  return (
    <div className="container mx-auto p-6">
      {/* Page title */}
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 pb-2 border-gray-200">
        Candidates List
      </h2>
      {/* Conditional rendering based on candidates data availability */}
      {candidates.length === 0 ? (
        <p className="text-gray-500 text-lg">No candidates found.</p>
      ) : (
        <div className="space-y-8"> {/* Vertical spacing between candidate cards */}
          {/* Map through candidates array to render individual candidate cards */}
          {candidates.map(candidate => (
            <div
              key={candidate.id}
              className="p-6 border border-gray-200 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-300"
            >
              {/* Candidate header with icon and name */}
              <div className="flex items-center mb-4">
                <FaUserCircle className="text-4xl text-blue-500 mr-3" />
                <h3 className="text-2xl font-semibold text-gray-800">
                  {candidate.name}
                </h3>
              </div>
              {/* AI Score display */}
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-500 text-sm">AI Score: <span className="font-semibold text-gray-800">{candidate.score}</span></p>
              </div>
              {/* Email information display */}
              <div className="mb-4">
                <p className="text-gray-500 text-sm">Email: <span className="font-semibold text-gray-800">{candidate.email || 'Not Provided'}</span></p>
              </div>
              {/* Resume text display with preserved formatting */}
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

// Export the component for use in other parts of the application
export default CandidatesList;
