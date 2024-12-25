import React, { useState, useEffect } from 'react';
import Navbarapp from '../components/Navbarapp';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from "react-select";

const ShortlistCandidate = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  const [jobs,setJobs]= useState([])
  const [selectedOption, setSelectedOption] = useState(null);
  const hiringmanagerid=3;
  useEffect(() => {
    // Fetch all candidates
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/get_job_description',{
          params:{hiringmanagerid:hiringmanagerid}
        });
        setJobs(
          response.data.jobs.map((option) => ({
            value: option.id,
            label: option.title.charAt(0).toUpperCase() + option.title.slice(1),
          }))
        )
      } catch (error) {
        console.error('Error fetching candidates:', error);
      }
    };
    fetchJobs();
  }, []);

  // useEffect(() => {
  //   // Fetch all candidates
  //   const fetchCandidates = async () => {
  //     try {
  //       const response = await axios.get('http://127.0.0.1:8000/candidates',
  //         {params:{job_description_id:selectedOption.value}}
  //       );
  //       setCandidates(response.data);
  //       setFilteredCandidates(response.data); // Initially, all candidates are shown
  //     } catch (error) {
  //       console.error('Error fetching candidates:', error);
  //     }
  //   };

  //   fetchCandidates();
  // }, []);

  // Handle prompt-based search
  const handlePromptSearch = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/filter_candidates', {
        prompt: prompt, // Send prompt as a JSON object
      });
      setFilteredCandidates(response.data); // Update the filtered candidates
    } catch (error) {
      console.error('Error filtering candidates:', error);
    }
  };
    const handleEmail = () => {
        const jobid=selectedOption.value;
        const linkkk=`http://localhost:5173/Calendar/${hiringmanagerid}/${jobid}`;
        const recipientEmail = candidates.map((data) => ({ email: data.email }));
        console.log(recipientEmail)
        const sendEmail = async () => {
          try {
            const response = await axios.post("http://127.0.0.1:8000/send_email", {
              to_email: recipientEmail,
              subject: "Job Application Update",
              body: `Hello, this is to inform you about the status of your application. ${linkkk}`,
            });
        
            console.log("Email sent successfully:", response.data);
            alert("Email sent successfully!");
          } catch (error) {
            console.error("Error sending email:", error.response?.data || error.message);
            alert("Failed to send email.");
          }
        };
        sendEmail();    
  }
  

  

  const handleForward = () => {
    if (selectedOption) {
      const fetchCandidates = async () => {
        try {
          const response = await axios.get('http://127.0.0.1:8000/candidates',
            {params:{job_description_id:selectedOption.value}}
          );
          setCandidates(response.data);
          setFilteredCandidates(response.data); // Initially, all candidates are shown
        } catch (error) {
          console.error('Error fetching candidates:', error);
        }
      };
  
      fetchCandidates();
    } else {
      alert("Please select an option.");
    }
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
          <div className="flex flex-col md:flex-row mb-6 md:mb-8 justify-center space-y-4 md:space-y-0 md:space-x-4">
          <Select
                options={jobs}
                onChange={(option) => setSelectedOption(option)}
                placeholder="Select a job..."
              />
              <button onClick={handleForward}> Select </button>
            <input
              type="text"
              placeholder="Enter your specific requirements"
              className="w-full max-w-lg p-3 border-2 rounded-lg"
              style={{ borderColor: '#AB30AB' }}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
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
              onClick={handleEmail}
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
