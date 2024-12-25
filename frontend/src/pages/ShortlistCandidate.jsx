import React, { useState, useEffect } from 'react';
import Navbarapp from '../components/Navbarapp';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ShortlistCandidate = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [activeFilter, setActiveFilter] = useState(''); // Store single active filter
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No access token found in local storage');
          return;
        }
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };  
        const response = await axios.get('http://127.0.0.1:8000/candidates', config);  
        const shortlistedCandidates = response.data.filter(candidate => candidate.score >= 0);
        setCandidates(shortlistedCandidates);
        setFilteredCandidates(shortlistedCandidates);
      } catch (error) {
        console.error('Error fetching candidates:', error);
      }
    };
  
    fetchCandidates();
  }, []);

  const handlePromptSearch = async () => {
    if (!prompt.trim()) return;
  
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found in local storage');
        return;
      }  
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };  
      const response = await axios.post(
        'http://127.0.0.1:8000/filter_candidates',
        {
          prompt: prompt,
        },
        config
      );
  
      const filteredResults = response.data.filter(candidate => candidate.score >= 50);
  
      // Update the state
      setFilteredCandidates(filteredResults);
      setActiveFilter(prompt); // Set the active filter
      setPrompt(''); // Clear input field
    } catch (error) {
      console.error('Error filtering candidates:', error);
    }
  };

  const removeFilter = () => {
    setActiveFilter('');
    setFilteredCandidates(candidates); // Reset to show all shortlisted candidates
  };

  const handleSubmit = () => {
    alert('Invitation sent');
    navigate('/home');
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbarapp />
      <div className="flex" style={{ marginTop: '4rem', minHeight: '100vh' }}>
        <Sidebar className="h-full" />
        <div className="md:ml-8 p-4 md:p-8 flex-grow bg-gray-100">
          <h1 className="text-3xl md:text-4xl text-center mb-6 md:mb-8 font-bold" style={{ color: '#800080' }}>
            ShortList Candidates
          </h1>
          
          {/* Prompt Input Section */}
          <div className="flex flex-col md:flex-row mb-6 md:mb-8 justify-center space-y-4 md:space-y-0 md:space-x-4">
            <input
              type="text"
              placeholder="Enter your specific requirements"
              className="w-full max-w-lg p-3 border-2 rounded-lg"
              style={{ borderColor: '#AB30AB' }}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePromptSearch()}
            />
            <button
              className="bg-black text-white px-12 md:px-24 py-3 rounded-lg transition hover:bg-indigo-700"
              onClick={handlePromptSearch}
            >
              Filter Candidates
            </button>
          </div>

          {/* Active Filter Display */}
          {activeFilter && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Active Filter:</h3>
              <div className="flex items-center gap-2">
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {activeFilter}
                  <button
                    onClick={removeFilter}
                    className="hover:bg-purple-200 rounded-full w-5 h-5 flex items-center justify-center ml-1"
                  >
                    ×
                  </button>
                </span>
              </div>
            </div>
          )}

          {/* Candidates Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-purp text-white" style={{ backgroundColor: '#800080' }}>
                  <th className="border p-3 text-left"></th>
                  <th className="border p-3 text-left">Name</th>
                  <th className="border p-3 text-left">AI Score</th>
                  <th className="border p-3 text-left">Analysis</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center p-3 text-gray-500">
                      No candidates found based on your requirements.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate, index) => (
                    <tr key={index} className="bg-gray-700 text-white hover:bg-gray-600 transition-colors">
                      <td className="p-3 text-center">
                        <input type="checkbox" className="form-checkbox h-5 w-5 text-green-600" />
                      </td>
                      <td className="border p-3">{candidate.name}</td>
                      <td className="border p-3">{candidate.score}%</td>
                      <td className="border p-3 text-sm">
                        {candidate.analysis || 'Give Your Requirements to get analysis'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Action Button */}
          <div className="flex justify-center mt-8">
            <button
              className="bg-black text-white px-12 md:px-24 py-3 rounded-lg transition hover:bg-gray-800"
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