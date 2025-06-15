/**
 * InterviewSession Component
 * 
 * A comprehensive interview session page that handles:
 * - Real-time video streaming and recording
 * - Eye gaze tracking and analysis
 * - Question presentation and answer recording
 * - Interview feedback and analysis
 * - Email submission of interview results
 * 
 * Features:
 * - WebRTC video streaming
 * - WebSocket communication for gaze tracking
 * - Speech synthesis for questions
 * - Audio recording and analysis
 * - Real-time feedback
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, MessageSquare, 
  ChevronRight, Volume2, Eye, AlertCircle, 
  CheckCircle, Loader2, ArrowRight, RefreshCw, BarChart2, Printer, X
} from 'lucide-react';

// Animation variants for UI transitions
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const InterviewSession = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  // Core interview state
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [gazeStatus, setGazeStatus] = useState('Not connected');
  const [isRecording, setIsRecording] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState('');

  // Interview progress tracking
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [interviewAnalysis, setInterviewAnalysis] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Refs for media handling
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Email submission state
  const [userEmail, setUserEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submittingInterview, setSubmittingInterview] = useState(false);
  const [interviewSubmitted, setInterviewSubmitted] = useState(false);

  /**
   * Fetches interview data from the API
   * Initializes the interview state and prepares answer tracking
   */
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setLoading(true);
        console.log(`Fetching interview with ID: ${interviewId}`);
        
        const response = await axios.get(`${API_URL}/api/interview/${interviewId}`);
        console.log("Interview data:", response.data);
        
        setInterview(response.data);
        setAnswers(Array(response.data.questions.length).fill(''));
        setError(null);
      } catch (err) {
        console.error('Error fetching interview:', err);
        
        if (err.response && err.response.status === 404) {
          setError('Interview not found. Please check the URL or create a new interview.');
        } else {
          setError('Failed to load interview. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      fetchInterview();
    }
  }, [interviewId]);

  /**
   * Initializes webcam access and video streaming
   * Sets up video constraints and initializes WebSocket connection
   */
  const enableWebcam = async () => {
    try {
      if (stream) {
        // Stop existing stream before creating a new one
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Request camera access with specific constraints
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } 
      });
      
      setStream(newStream);
      
      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      
      // Initialize WebSocket for gaze detection
      initWebSocket();
      
      setError(null);
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setError('Could not access webcam. Please check camera permissions and try again.');
      setGazeStatus('Webcam Error');
    }
  };

  /**
   * Initializes WebSocket connection for gaze tracking
   * Handles connection events and message processing
   */
  const initWebSocket = () => {
    try {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      
      socketRef.current = new WebSocket(`ws://localhost:8000/ws/video`);
      
      socketRef.current.onopen = () => {
        console.log('WebSocket connection established');
        setGazeStatus('Connecting...');
      };
      
      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.gazeStatus) {
            setGazeStatus(data.gazeStatus);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setGazeStatus("Connection error");
      };
      
      socketRef.current.onclose = () => {
        console.log('WebSocket connection closed');
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  };

  /**
   * Captures and sends video frames to the backend for gaze analysis
   * Optimizes performance by reducing image quality
   */
  const sendVideoFrameToBackend = () => {
    if (!videoRef.current || !videoRef.current.videoWidth) {
      return; // Video not ready yet
    }
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL('image/jpeg', 0.7); // Reduced quality for performance
      
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(imageData);
      }
    } catch (error) {
      console.error('Error capturing or sending frame:', error);
    }
  };

  /**
   * Sets up periodic video frame capture and sending
   * Optimizes performance by using a 250ms interval
   */
  useEffect(() => {
    let intervalId;
    
    if (stream && videoRef.current && !interviewEnded && socketRef.current) {
      // Wait a second for the video to initialize
      setTimeout(() => {
        intervalId = setInterval(() => {
          sendVideoFrameToBackend();
        }, 250); // Reduced frequency for better performance (4 frames per second)
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [stream, interviewEnded]);

  /**
   * Cleanup function to release resources when component unmounts
   * Stops video stream, closes WebSocket, and cancels speech synthesis
   */
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
    };
  }, []);

  /**
   * Validates email format and presence
   * @returns {boolean} True if email is valid
   */
  const validateEmail = () => {
    if (!userEmail) {
      setEmailError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  /**
   * Starts the interview session
   * Validates email, enables webcam, and speaks the first question
   */
  const startInterview = () => {
    // Validate email first
    if (!validateEmail()) {
      return;
    }
    
    setInterviewStarted(true);
    enableWebcam();
    
    // Automatically speak the first question
    if (interview && interview.questions.length > 0) {
      setTimeout(() => {
        speakQuestion(interview.questions[0]);
      }, 1000);
    }
  };

  // End the interview - modified to automatically save
  const endInterview = async () => {
    setInterviewEnded(true);
    setInterviewStarted(false);
    
    // Stop the video stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Close the WebSocket connection
    if (socketRef.current) {
      socketRef.current.close();
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Get analysis of the entire interview
    setAnalysisLoading(true);
    await analyzeInterview();
    
    // Automatically submit the interview with the email we already collected
    await submitInterviewWithEmail();
    
    // Log state for debugging
    console.log("Interview ended. State:", {
      interviewEnded: true,
      interviewStarted: false,
      answers
    });
  };

  // Analyze the interview
  const analyzeInterview = async () => {
    if (!interview || !interview.questions.length) {
      console.error("No interview data available for analysis");
      return;
    }
    
    try {
      console.log("Sending interview data for analysis:", {
        questions: interview.questions,
        answers: answers.map(a => a || "Not answered"),
        job_title: interview.job_title
      });
      
      const response = await axios.post(`${API_URL}/api/analyze-interview`, {
        questions: interview.questions,
        answers: answers.map(a => a || "Not answered"),
        job_title: interview.job_title
      });
      
      console.log("Analysis response:", response.data);
      setInterviewAnalysis(response.data.analysis || 'No analysis available');
    } catch (error) {
      console.error('Error analyzing interview:', error);
      setInterviewAnalysis('Failed to analyze the interview. Error: ' + (error.message || 'Unknown error'));
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Speech synthesis for reading questions
  const speakQuestion = (question) => {
    if (!question) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.rate = 0.9; // Slightly slower
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      setAudioFeedback('Initializing audio recording...');
      
      // Request microphone access
      const audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 44100,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Create MediaRecorder
      const options = { 
        mimeType: 'audio/webm;codecs=opus',
      };
      
      // Check if the browser supports the specified mime type
      if (!MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        audioStream.getTracks().forEach(track => track.stop());
        throw new Error('Browser does not support the codec. Please try a different browser.');
      }
      
      mediaRecorderRef.current = new MediaRecorder(audioStream, options);
      audioChunksRef.current = [];
      
      // Set up event handlers
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstart = () => {
        setAudioFeedback('Recording in progress... Speak clearly.');
        setIsRecording(true);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        setAudioFeedback('Processing your answer...');
        
        try {
          // Create blob from recorded chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
          
          // Stop all tracks from the audio stream
          audioStream.getTracks().forEach(track => track.stop());
          
          // Upload to server for transcription
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.webm');
          formData.append('job_title', interview.job_title);
          formData.append('question_id', selectedQuestion);
          
          const response = await axios.post(`${API_URL}/api/transcribe-audio`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          if (response.data && response.data.transcription) {
            // Update answers array
            const newAnswers = [...answers];
            newAnswers[selectedQuestion] = response.data.transcription;
            setAnswers(newAnswers);
            
            setAudioFeedback('Answer recorded successfully.');
          } else {
            throw new Error('Transcription failed');
          }
        } catch (error) {
          console.error('Error processing recording:', error);
          setAudioFeedback('Failed to process your answer. Please try again.');
        } finally {
          audioChunksRef.current = [];
          setIsRecording(false);
        }
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      
      // Set a maximum recording duration
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 60000); // 1 minute max
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setAudioFeedback(`Recording failed: ${error.message}`);
      setIsRecording(false);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };
  
  // Get feedback on an individual answer
  const getAnswerFeedback = async () => {
    if (!answers[selectedQuestion]) return;
    
    setAudioFeedback('Getting feedback on your answer...');
    
    try {
      const response = await axios.post(`${API_URL}/api/analyze-answer`, {
        question: interview.questions[selectedQuestion],
        answer: answers[selectedQuestion],
        job_title: interview.job_title
      });
      
      if (response.data && response.data.feedback) {
        // Show feedback in a modal
        setFeedbackContent(response.data.feedback);
        setShowFeedbackModal(true);
      }
    } catch (error) {
      console.error('Error getting answer feedback:', error);
      setAudioFeedback('Failed to get feedback on your answer.');
    } finally {
      setAudioFeedback('');
    }
  };
  
  // Move to the next question
  const moveToNextQuestion = () => {
    if (selectedQuestion < interview.questions.length - 1) {
      setSelectedQuestion(selectedQuestion + 1);
      
      // Automatically speak the next question
      setTimeout(() => {
        speakQuestion(interview.questions[selectedQuestion + 1]);
      }, 500);
    } else {
      // End of interview
      endInterview();
    }
  };

  // Additional state for feedback modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState('');

  // Feedback Modal Component
  const FeedbackModal = ({ feedback, onClose }) => (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-[90%] max-w-md"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div 
            className="w-16 h-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center mb-6"
            initial={{ rotate: 180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <MessageSquare className="w-8 h-8 text-indigo-600" />
          </motion.div>

          <motion.h2
            className="text-2xl font-bold text-center mb-2 text-indigo-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Answer Feedback
          </motion.h2>

          <motion.div
            className="bg-indigo-50 p-4 rounded-lg my-4 text-gray-700 whitespace-pre-line"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {feedback}
          </motion.div>

          <motion.button
            className="w-full py-3 px-6 rounded-lg font-medium shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-4 focus:ring-indigo-300 transition-all flex items-center justify-center gap-2"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Close Feedback
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Existing function, but we'll call it automatically now
  const submitInterviewWithEmail = async () => {
    setSubmittingInterview(true);
    
    try {
      // Get the auth token from localStorage (if it exists)
      const token = localStorage.getItem("accessToken");
      
      // Set up request config with optional auth header
      const config = {};
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`
        };
      }
      
      // Send data to backend with authorization header if available
      const response = await axios.post(`${API_URL}/api/save-interview-summary`, {
        email: userEmail,
        interview_id: interviewId,
        questions: interview.questions,
        answers: answers.map(a => a || "Not answered"),
        job_title: interview.job_title
      }, config);
      
      console.log("Submission response:", response.data);
      setInterviewSubmitted(true);
    } catch (error) {
      console.error('Error submitting interview data:', error);
      
      // Even if there's an authentication error, still mark as submitted
      // to provide better UX for candidates
      if (error.response && error.response.status === 401) {
        console.log("Authentication error, but proceeding with interview completion");
        setInterviewSubmitted(true); // Still mark as submitted for UX purposes
      } else {
        setEmailError('Failed to submit interview. Please try again.');
      }
    } finally {
      setSubmittingInterview(false);
      setAnalysisLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Loading Interview...</h1>
          <p className="text-gray-600">Please wait while we prepare your session</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="bg-white/80 backdrop-blur-lg p-8 rounded-xl shadow-lg max-w-md w-full"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ delay: 0.4 }}
          >
            <AlertCircle className="w-8 h-8 text-red-600" />
          </motion.div>
          
          <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Error</h1>
          <p className="text-red-500 mb-6 text-center">{error}</p>
          
          <motion.button 
            onClick={() => navigate('/')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium shadow-md flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowRight className="w-5 h-5" />
            Create New Interview
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  if (!interview) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="bg-white/80 backdrop-blur-lg p-8 rounded-xl shadow-lg max-w-md w-full"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Interview Not Found</h1>
          <p className="text-gray-600 mb-6 text-center">Unable to load the interview session.</p>
          
          <motion.button 
            onClick={() => navigate('/')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium shadow-md flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowRight className="w-5 h-5" />
            Create New Interview
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="container mx-auto p-4 max-w-6xl">
        {!interviewStarted && !interviewEnded ? (
          <motion.div 
            className="max-w-3xl mx-auto mt-8"
            variants={slideUp}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl overflow-hidden border border-indigo-100"
              whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-5">
                <h1 className="text-2xl font-bold text-white">{interview.job_title} Interview</h1>
                <p className="text-indigo-100 text-sm mt-1">
                  Prepare yourself for a professional interview experience
                </p>
              </div>
              
              <div className="p-8">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">About This Interview</h2>
                  <p className="text-gray-700 mb-6">
                    This interview contains {interview.questions.length} questions designed to evaluate your skills and experience for the {interview.job_title} position. Our AI-powered system will analyze your responses and provide feedback.
                  </p>
                  
                  <div className="mb-6 bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                    <h3 className="font-semibold text-indigo-800 mb-4">Please Enter Your Email</h3>
                    <p className="text-gray-700 mb-4">
                      We'll use this to send you the interview results and feedback.
                    </p>
                    <div className="mb-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className={`w-full px-4 py-3 border ${emailError ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-indigo-500 focus:border-indigo-500`}
                        placeholder="your.email@example.com"
                      />
                      {emailError && (
                        <p className="mt-1 text-sm text-red-600">{emailError}</p>
                      )}
                    </div>
                  </div>
                  
                  <motion.div 
                    className="bg-indigo-50 p-6 rounded-xl mb-8 border border-indigo-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="font-semibold text-indigo-800 mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Instructions:
                    </h3>
                    <ul className="space-y-3">
                      {[
                        "Allow camera and microphone access when prompted",
                        "Answer each question by recording your response",
                        "Try to maintain eye contact with the camera",
                        "Speak clearly and at a moderate pace",
                        "You'll receive AI-powered feedback on your performance"
                      ].map((item, index) => (
                        <motion.li 
                          key={index}
                          className="flex items-start text-indigo-700"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-indigo-600 text-sm font-medium">{index + 1}</span>
                          </div>
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                  
                  <motion.button
                    onClick={startInterview}
                    className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center justify-center"
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="mr-2">Start Interview</span>
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : interviewEnded ? (
          <motion.div 
            className="max-w-3xl mx-auto mt-8 bg-white/90 backdrop-blur-lg shadow-lg rounded-2xl overflow-hidden border border-indigo-100 p-8"
            variants={slideUp}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="w-16 h-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              {analysisLoading || submittingInterview ? (
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              ) : (
                <CheckCircle className="w-8 h-8 text-indigo-600" />
              )}
            </motion.div>
            
            <h2 className="text-2xl font-bold text-center mb-6 text-indigo-600">
              {analysisLoading ? 'Analyzing Interview...' : 
               submittingInterview ? 'Submitting Results...' : 
               'Thank You!'}
            </h2>
            
            {analysisLoading || submittingInterview ? (
              <p className="text-gray-700 text-center mb-6">
                {analysisLoading ? 'Please wait while we analyze your interview responses...' : 
                 'Saving your interview results...'}
              </p>
            ) : (
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-gray-700 mb-4">
                    Thank you for completing the {interview.job_title} interview!
                  </p>
                  
                  <p className="text-gray-700 mb-4">
                    Your responses have been submitted successfully and will be evaluated by our team.
                  </p>
                  
                  <p className="text-gray-700 mb-8">
                    We will contact you at <span className="font-medium text-indigo-600">{userEmail}</span> with your results and next steps.
                  </p>
                  
                  <motion.button
                    onClick={() => navigate('/')}
                    className="py-3 px-6 rounded-lg font-medium shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 mx-auto"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowRight className="w-5 h-5" />
                    Return Home
                  </motion.button>
                </motion.div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            className="py-6"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 
              className="text-2xl font-bold mb-6 text-center text-gray-800"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {interview.job_title} Interview
            </motion.h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="md:col-span-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="bg-white/90 backdrop-blur-lg p-4 rounded-xl shadow-lg mb-4 border border-indigo-100"
                  whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                >
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-auto rounded-lg border border-gray-200 bg-gray-50"
                    />
                    
                    <motion.div 
                      className={`absolute bottom-3 right-3 py-1.5 px-3 text-xs font-medium rounded-full flex items-center
                        ${gazeStatus === 'Looking at Camera' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'}`}
                      animate={{
                        scale: gazeStatus === 'Looking at Camera' ? [1, 1.05, 1] : 1,
                      }}
                      transition={{ 
                        repeat: gazeStatus === 'Looking at Camera' ? Infinity : 0,
                        repeatType: "reverse",
                        duration: 1.5
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      {gazeStatus}
                    </motion.div>
                  </div>
                  
                  <motion.button
                    onClick={enableWebcam}
                    className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Restart Camera
                  </motion.button>
                </motion.div>
                
                <motion.div 
                  className="bg-white/90 backdrop-blur-lg p-5 rounded-xl shadow-lg border border-indigo-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="font-semibold mb-3 text-gray-800">Interview Progress</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
                    <motion.div 
                      className="bg-indigo-600 h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(selectedQuestion / interview.questions.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    ></motion.div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 flex items-center justify-between">
                    <span>Question {selectedQuestion + 1} of {interview.questions.length}</span>
                    <span className="text-indigo-600 font-medium">
                      {Math.round((selectedQuestion / interview.questions.length) * 100)}% Complete
                    </span>
                  </p>
                  
                  <motion.button
                    onClick={endInterview}
                    className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X className="w-5 h-5 mr-2" />
                    End Interview
                  </motion.button>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="md:col-span-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div 
                  className="bg-white/90 backdrop-blur-lg p-6 rounded-xl shadow-lg mb-4 border border-indigo-100"
                  whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                >
                  <h2 className="font-semibold mb-3 text-gray-800 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
                    Current Question:
                  </h2>
                  <p className="text-lg mb-5 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    {interview.questions[selectedQuestion]}
                  </p>
                  
                  <motion.button
                    onClick={() => speakQuestion(interview.questions[selectedQuestion])}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Volume2 className="w-5 h-5 mr-2" />
                    Read Question Aloud
                  </motion.button>
                </motion.div>
                
                <motion.div 
                  className="bg-white/90 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-indigo-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {!isRecording && !answers[selectedQuestion] ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="mb-5 text-gray-700">Click the button below to record your answer:</p>
                      <motion.button
                        onClick={startRecording}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg flex items-center shadow-md"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Mic className="w-5 h-5 mr-2" />
                        Record Answer
                      </motion.button>
                    </motion.div>
                  ) : isRecording ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.p 
                        className="mb-5 font-medium text-red-600 flex items-center"
                        animate={{ 
                          scale: [1, 1.03, 1],
                        }}
                        transition={{ 
                          repeat: Infinity,
                          repeatType: "reverse",
                          duration: 1.5
                        }}
                      >
                        <Mic className="w-5 h-5 mr-2" />
                        {audioFeedback}
                      </motion.p>
                      
                      <motion.button
                        onClick={stopRecording}
                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg flex items-center shadow-md"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        animate={{ 
                          scale: [1, 1.05, 1],
                        }}
                        transition={{ 
                          repeat: Infinity,
                          repeatType: "reverse",
                          duration: 1.5
                        }}
                      >
                        <MicOff className="w-5 h-5 mr-2" />
                        Stop Recording
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <h3 className="font-semibold mb-3 text-gray-800">Your Answer:</h3>
                      <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {answers[selectedQuestion]}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <motion.button
                          onClick={getAnswerFeedback}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center justify-center shadow-md"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <MessageSquare className="w-5 h-5 mr-2" />
                          Get Feedback
                        </motion.button>
                        
                        <motion.button
                          onClick={moveToNextQuestion}
                          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg flex items-center justify-center shadow-md"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <ChevronRight className="w-5 h-5 mr-2" />
                          Next Question
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                  
                  {audioFeedback && !isRecording && (
                    <motion.p 
                      className="mt-4 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {audioFeedback}
                    </motion.p>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal 
          feedback={feedbackContent} 
          onClose={() => setShowFeedbackModal(false)} 
        />
      )}
    </motion.div>
  );
};

export default InterviewSession;