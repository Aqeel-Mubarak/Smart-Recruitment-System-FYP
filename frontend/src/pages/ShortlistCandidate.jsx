import React, { useState, useEffect } from 'react';
import Navbarapp from '../components/Navbarapp';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ShortlistCandidate = () => {
  const [candidates, setCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [prompt, setPrompt] = useState(''); // Added state for the specific prompt
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch candidates with an AI score above a certain threshold
    const fetchCandidates = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/candidates');
        const shortlisted = response.data.filter(candidate => candidate.score >= 50); // Example threshold
        setCandidates(shortlisted);
        setFilteredCandidates(shortlisted); // Initially set all shortlisted candidates as filtered
      } catch (error) {
        console.error('Error fetching candidates:', error);
      }
    };

    fetchCandidates();
  }, []);

  // Handle search query change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle prompt change
  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  };

  // Handle prompt-based search/filtering
  const handlePromptSearch = () => {
    // For simplicity, let's assume we're filtering candidates by checking if the prompt exists in any candidate fields
    const promptLowercase = prompt.toLowerCase();
    const filtered = candidates.filter(candidate =>
      candidate.name.toLowerCase().includes(promptLowercase) ||
      candidate.resume_text.toLowerCase().includes(promptLowercase)
    );
    setFilteredCandidates(filtered);
  };

  // Handle submit button click (e.g., Schedule Interview action)
  function handleSubmit() {
    alert("Invitation sent");
    navigate('/home');
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Navbar */}
      <Navbarapp />

      <div className="flex" style={{ marginTop: '4rem', minHeight: '100vh' }}> {/* Set full screen height */}
        {/* Sidebar */}
        <Sidebar className="h-full" /> {/* Apply full height to sidebar */}

        <div className="md:ml-8 p-4 md:p-8 flex-grow bg-gray-100">
          <h1 className="text-3xl md:text-4xl text-center mb-6 md:mb-8 font-bold" style={{ color: '#800080' }}>
            ShortList Candidates
          </h1>

          <div className="flex flex-col md:flex-row mb-6 md:mb-8 justify-center space-y-4 md:space-y-0 md:space-x-4">
            <input
              type="text"
              placeholder="Give your specific requirements here"
              className="w-full max-w-lg p-3 border-2 rounded-lg"
              style={{ borderColor: '#AB30AB' }}
              value={prompt}
              onChange={handlePromptChange}
            />
            <button
              className="bg-black text-white px-12 md:px-24 py-3 rounded-lg transition hover:bg-indigo-700"
              onClick={handlePromptSearch}
            >
              Filter Candidates
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-purp text-white" style={{ backgroundColor: '#800080' }}>
                  <th className="border p-3 text-left"></th>
                  <th className="border p-3 text-left">Name</th>
                  <th className="border p-3 text-left">AI Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center p-3 text-gray-500">
                      No candidates found based on your requirements.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate, index) => (
                    <tr key={index} className="bg-gray-700 text-white">
                      <td className="p-3 text-center">
                        <input type="checkbox" className="form-checkbox h-5 w-5 text-green-600" />
                      </td>
                      <td className="border p-3">{candidate.name}</td>
                      <td className="border p-3">{candidate.score}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-8">
            <button
              className="bg-black text-white px-12 md:px-24 py-3 rounded-lg transition"
              onClick={handleSubmit}
            >
              Schedule Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortlistCandidate;
