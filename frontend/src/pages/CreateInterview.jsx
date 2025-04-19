import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, BriefcaseIcon, Code, Send, Copy, ExternalLink, ArrowLeft, Plus, XCircle, Loader2 } from 'lucide-react';
import Navbarapp from '../components/Navbarapp';
import Sidebar from '../components/Sidebar';


const API_URL = import.meta.env.VITE_API_BASE_URL;

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm flex items-center gap-2 ${
        type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
      }`}
    >
      {message}
      <button onClick={onClose} className="ml-2 hover:opacity-80 transition-opacity">
        ×
      </button>
    </motion.div>
  );
};

// Create Interview Component
const CreateInterview = () => {
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };
  
  useEffect(() => {
    document.title = "AI Interview";
  }, []);

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const addSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!jobTitle.trim()) {
      showToast('Job title is required', 'error');
      return;
    }

    setIsLoading(true);
    setGeneratedData(null);

    try {
      const response = await axios.post(`${API_URL}/api/generate-questions`, {
        job_title: jobTitle,
        skills: skills,
        experience: experience
      });

      setGeneratedData(response.data);
      showToast('Interview questions generated successfully!');
    } catch (error) {
      console.error('Error generating questions:', error);
      showToast('Failed to generate interview questions. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => showToast('Link copied to clipboard!'))
      .catch(err => showToast('Failed to copy link.', 'error'));
  };

  const viewInterview = () => {
    if (generatedData?.id) {
      navigate(`/interview/${generatedData.id}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <Navbarapp />
      
      <aside className="fixed left-0 top-16 w-[19%] h-[calc(100vh-4rem)] bg-white/80 backdrop-blur-lg shadow-lg">
        <Sidebar />
      </aside>

      <motion.main
        className="ml-[19%] mt-16 p-6 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence>
          {toast.visible && (
            <Toast message={toast.message} type={toast.type} onClose={hideToast} />
          )}
        </AnimatePresence>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Header Section */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-between bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-indigo-100 p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BriefcaseIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Create Interview</h1>
                <p className="text-gray-600">Generate AI-powered interview questions</p>
              </div>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-indigo-100"
          >
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Job Title*</span>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="e.g. Frontend Developer"
                    required
                  />
                </label>

                <div>
                  <span className="text-sm font-medium text-gray-700">Skills</span>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="e.g. React, TypeScript"
                    />
                    <motion.button
                      type="button"
                      onClick={addSkill}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </motion.button>
                  </div>
                  
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {skills.map((skill, index) => (
                        <motion.span
                          key={index}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-indigo-600 hover:text-indigo-800"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Experience Level</span>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select experience level</option>
                    <option value="entry-level">Entry Level (0-2 years)</option>
                    <option value="mid-level">Mid Level (3-5 years)</option>
                    <option value="senior">Senior (5+ years)</option>
                    <option value="leadership">Leadership/Management</option>
                  </select>
                </label>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                  isLoading 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    Generate Interview Questions
                  </span>
                )}
              </motion.button>
            </form>
          </motion.div>

          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-indigo-100 text-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Generating your interview questions...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </motion.div>
          )}
          
          {generatedData && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-indigo-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Generated Interview</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/interview/${generatedData.id}`)}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                      <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                    </svg>
                    Copy Link
                  </button>
                  <button
                    onClick={viewInterview}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    View
                  </button>
                </div>
              </div>
              
              <h3 className="font-medium text-gray-700 mb-2">Questions:</h3>
              <ul className="bg-gray-50 rounded-md p-4 space-y-3">
                {generatedData.questions.map((question, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="font-medium text-blue-600">{index + 1}.</span>
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </motion.div>
      </motion.main>
    </div>
  );
};

// Interview Page Component
const InterviewPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/interview/${interviewId}`);
        setInterview(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching interview:', err);
        setError('Failed to load this interview. It may have been deleted or the ID is invalid.');
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [interviewId]);

  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => showToast('Link copied to clipboard!'))
      .catch(() => showToast('Failed to copy link.', 'error'));
  };

  const shareInterview = () => {
    if (navigator.share) {
      navigator.share({
        title: `Interview for ${interview?.job_title || 'Position'}`,
        text: 'Check out this interview questions.',
        url: window.location.href,
      })
      .catch(err => console.error('Error sharing:', err));
    } else {
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading interview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-center text-lg font-medium">Interview Not Found</p>
        </div>
        <p className="text-center text-gray-600 mb-6">{error}</p>
        <div className="flex justify-center">
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create New Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {toast.visible && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast}
        />
      )}
      
      <div className="mb-4 flex items-center">
        <button 
          onClick={() => navigate('/')}
          className="text-gray-600 hover:text-blue-600 transition flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <div className="ml-auto">
          <button 
            onClick={copyToClipboard}
            className="mr-2 px-3 py-1 flex items-center gap-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            aria-label="Copy link"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
              <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
            </svg>
            Copy Link
          </button>
          <button 
            onClick={shareInterview}
            className="px-3 py-1 flex items-center gap-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            aria-label="Share interview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            Share
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-xl font-bold text-white">{interview.job_title}</h1>
          <p className="text-blue-100 text-sm mt-1">
            Created {new Date(interview.created_at).toLocaleDateString()}
          </p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-2">Skills</h2>
            {interview.skills && interview.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {interview.skills.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No specific skills listed</p>
            )}
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-2">Experience Level</h2>
            <p className="text-gray-700">
              {interview.experience ? interview.experience : "Not specified"}
            </p>
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-3">Interview Questions</h2>
            <ol className="list-decimal list-inside space-y-4 bg-gray-50 p-4 rounded-lg">
              {interview.questions.map((question, index) => (
                <li key={index} className="pl-2 text-gray-800">
                  {question}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInterview;