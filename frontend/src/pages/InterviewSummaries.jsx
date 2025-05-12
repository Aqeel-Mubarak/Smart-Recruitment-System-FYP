import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, FileText, X, Eye, Search, RefreshCw, 
  ArrowLeft, Printer, Download, BarChart2, User, Clock, ClipboardList
} from 'lucide-react';
import Navbarapp from '../components/Navbarapp';
import Sidebar from '../components/Sidebar';

const InterviewSummaries = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  
  // State variables
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch interview summaries from backend
  useEffect(() => {
    document.title = "Interview Summaries";
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    setLoading(true);
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      // Include the token in the request headers
      const response = await axios.get(`${API_URL}/api/interview-summaries`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSummaries(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching summaries:', err);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Failed to load interview summaries. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch a specific summary by ID
  const fetchSummaryById = async (id) => {
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert('Authentication token not found. Please log in again.');
        return;
      }

      // Include the token in the request headers
      const response = await axios.get(`${API_URL}/api/interview-summary/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSelectedSummary(response.data);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching summary details:', err);
      if (err.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
      } else {
        alert('Failed to load summary details. Please try again.');
      }
    }
  };

  // Filter summaries based on search query
  const filteredSummaries = summaries.filter(summary => 
    summary.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    summary.job_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Print summary
  const printSummary = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Interview Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            h1 { color: #4338ca; }
            h2 { color: #4338ca; margin-top: 20px; }
            .email { color: #6366f1; font-weight: bold; }
            .date { color: #6b7280; margin-bottom: 20px; }
            .summary { background: #f3f4f6; padding: 15px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>${selectedSummary.job_title} Interview Summary</h1>
          <p class="email">Candidate: ${selectedSummary.email}</p>
          <p class="date">Completed on: ${formatDate(selectedSummary.completed_at)}</p>
          <div class="summary">
            <pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${selectedSummary.summary}</pre>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Download as PDF
  const downloadAsPDF = () => {
    // This would need a PDF library implementation
    alert('PDF download feature will be implemented soon');
  };

  // Summary Detail Modal Component
  const SummaryModal = ({ summary, onClose }) => {
    const formatSummaryText = (text) => {
      // Replace **word** with <h3>word</h3>
      return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const heading = part.slice(2, -2); // Remove the ** from the word
          return <h3 key={index} className="font-semibold text-lg text-gray-800 mb-3">{heading}</h3>;
        }
        return part; // Return unchanged text
      });
    };

    return (
      <motion.div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Interview Summary
            </h2>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white/20 p-1 rounded-full transition duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            <div className="mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <h3 className="text-lg font-semibold text-indigo-700 mb-3">{summary.job_title} Position</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2 text-indigo-500" />
                  <span className="text-sm">Candidate: <span className="font-semibold text-indigo-700">{summary.email}</span></span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                  <span className="text-sm">Completed: <span className="font-semibold text-gray-700">{formatDate(summary.completed_at)}</span></span>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-lg text-gray-800 mb-3">Interview Analysis:</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 whitespace-pre-wrap font-sans text-gray-700">
              {formatSummaryText(summary.summary)}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <motion.button
                onClick={downloadAsPDF}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg flex items-center border border-indigo-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </motion.button>
              <motion.button
                onClick={printSummary}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </motion.button>
              <motion.button
                onClick={onClose}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Close
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Error display component
  const ErrorDisplay = () => {
    return (
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Error</h1>
        <p className="text-red-500 mb-6">{error}</p>
        <button 
          onClick={fetchSummaries}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center mx-auto"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 to-white">
      <Navbarapp />
      
      <div className="flex h-[calc(100vh-4rem)] mt-16">
        <aside className="w-[19%] fixed left-0">
          <Sidebar />
        </aside>
        
        <motion.div 
          className="w-[81%] ml-[19%] p-6 md:p-8 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div className="flex items-center">
                <ClipboardList className="w-7 h-7 text-indigo-600 mr-3" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Interview Summaries</h1>
                  <p className="text-gray-500">Review candidate interview results and analyses</p>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex space-x-2">
                <button 
                  onClick={fetchSummaries}
                  className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 flex items-center shadow-sm transition duration-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-700">Loading Interview Summaries</h2>
                  <p className="text-gray-500 mt-2">Please wait while we fetch the data...</p>
                </div>
              </div>
            ) : error ? (
              <ErrorDisplay />
            ) : (
              <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100 mb-8">
                <div className="p-4 border-b border-gray-100 bg-white">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                      placeholder="Search by email or job title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Job Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSummaries.length > 0 ? (
                        filteredSummaries.map((summary) => (
                          <tr key={summary.id} className="hover:bg-gray-50 transition duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium mr-3">
                                  {summary.email.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-sm font-medium text-gray-900">{summary.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{summary.job_title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 flex items-center">
                                <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                                {formatDate(summary.completed_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <motion.button
                                onClick={() => fetchSummaryById(summary.id)}
                                className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center border border-indigo-100 transition duration-200 shadow-sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Eye className="w-4 h-4 mr-1.5" />
                                View Summary
                              </motion.button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                            {searchQuery ? (
                              <div className="flex flex-col items-center">
                                <Search className="w-8 h-8 text-gray-300 mb-2" />
                                <p>No matching results found</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <FileText className="w-8 h-8 text-gray-300 mb-2" />
                                <p>No interview summaries available</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {filteredSummaries.length > 0 && (
                  <div className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 border-t border-gray-100">
                    Showing {filteredSummaries.length} of {summaries.length} interviews
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showModal && selectedSummary && (
          <SummaryModal 
            summary={selectedSummary} 
            onClose={() => setShowModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewSummaries;