import React, { useState, useRef, useEffect } from 'react';
import { Video, Mic, MicOff, Send } from 'lucide-react';

export default function MockInterview() {
  const [jobTitle, setJobTitle] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState(null);
  const [gazeStatus, setGazeStatus] = useState(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState('');
  const [interviewAnalysis, setInterviewAnalysis] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Get base API URL
  const getApiBaseUrl = () => {
    // For development, use a specific port for the API if needed
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:8000';
    }
    // For production, use the same origin
    return '';
  };

  // Get WebSocket URL
  const getWebSocketURL = () => {
    if (process.env.NODE_ENV === 'development') {
      return 'ws://localhost:8000/ws/video';
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws/video`;
  };

  // Fetch questions based on job title from backend
  const fetchQuestions = async (title) => {
    if (!title.trim()) {
      setError('Please enter a valid job title.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const encodedTitle = encodeURIComponent(title.trim());
      const apiUrl = `${getApiBaseUrl()}/api/get-questions/${encodedTitle}`;
      console.log("Fetching from:", apiUrl);
      
      const response = await fetch(apiUrl);
      
      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned non-JSON response: ${contentType}`);
      }
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Questions data:", data);
      
      if (data.questions && data.questions.length > 0) {
        setGeneratedQuestions(data.questions);
        setAnswers(Array(data.questions.length).fill('')); // Initialize answers array
        setError(null);
      } else {
        setError("No questions were returned. Please try a different job title.");
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      // Try to generate questions directly as a fallback
      generateQuestions(title);
    } finally {
      setLoading(false);
    }
  };
  
  const generateQuestions = async (title) => {
    if (!title.trim()) {
      setError('Please enter a valid job title.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = `${getApiBaseUrl()}/api/generate-questions`;
      console.log("Generating from:", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_title: title.trim() })
      });
      
      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned non-JSON response: ${contentType}`);
      }
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Generated questions data:", data);
      
      if (data.questions && data.questions.length > 0) {
        setGeneratedQuestions(data.questions);
        setAnswers(Array(data.questions.length).fill('')); // Initialize answers array
        setError(null);
      } else {
        throw new Error("No questions were generated");
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      setError(`Failed to generate questions: ${error.message}`);
      
      // Use hardcoded fallback questions if all else fails
      const fallbackQuestions = [
        "Tell me about your background and experience relevant to this role.",
        "What are your key strengths that make you a good fit for this position?",
        "Describe a challenging situation at work and how you handled it.",
        "Why are you interested in this position?",
        "What are your career goals for the next 3-5 years?"
      ];
      
      setGeneratedQuestions(fallbackQuestions);
      setAnswers(Array(fallbackQuestions.length).fill(''));
      setError("Using generic questions. API connection failed.");
    } finally {
      setLoading(false);
    }
  };
  
  const speakQuestion = (question) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.pitch = 1;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const enableWebcam = async () => {
    try {
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const videoStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } 
      });
      
      setStream(videoStream);
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
      }

      // Connect to WebSocket
      connectWebSocket();
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError(`Webcam access failed: ${err.message}`);
    }
  };
  
  const connectWebSocket = () => {
    // Close existing WebSocket connection if any
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
    
    try {
      // Create new WebSocket
      const wsUrl = getWebSocketURL();
      console.log("Connecting to WebSocket:", wsUrl);
      socketRef.current = new WebSocket(wsUrl);
      
      socketRef.current.onopen = () => {
        console.log('WebSocket connected');
      };
      
      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setGazeStatus(data.gazeStatus);
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

  // Clean up resources when component unmounts
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

  const startInterview = () => {
    if (!jobTitle || !jobTitle.trim()) {
      setError('Please enter a job title.');
      return;
    }
    
    setInterviewStarted(true);
    fetchQuestions(jobTitle); // Fetch questions from backend
    enableWebcam();
  };

  const analyzeInterview = async () => {
    if (!jobTitle || !generatedQuestions.length) {
      return;
    }
    
    setAnalysisLoading(true);
    
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/analyze-interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: generatedQuestions,
          answers: answers.map(a => a || "Not answered"),
          job_title: jobTitle
        }),
      });
      
      const data = await response.json();
      setInterviewAnalysis(data.analysis || 'No analysis available');
    } catch (error) {
      console.error('Error analyzing interview:', error);
      setInterviewAnalysis('Failed to analyze the interview.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const endInterview = () => {
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
    analyzeInterview();
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      setAudioFeedback('Initializing audio recording...');
      
      // Request microphone access
      const audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      // Create MediaRecorder with specific audio settings
      const mediaRecorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm',  // More widely supported format
        audioBitsPerSecond: 128000
      });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstart = () => {
        setIsRecording(true);
        setAudioFeedback('Recording... Speak your answer clearly');
        audioChunksRef.current = [];
      };
      
      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setAudioFeedback('Uploading and transcribing your answer...');
        
        // Create audio blob from recorded chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Create FormData for upload
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('job_title', jobTitle);
        formData.append('question_id', selectedQuestion);
        
        try {
          // Upload to backend
          const response = await fetch(`${getApiBaseUrl()}/api/transcribe-audio`, {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Update the answer with the transcription from backend
          const newAnswers = [...answers];
          newAnswers[selectedQuestion] = data.transcription;
          setAnswers(newAnswers);
          
          setAudioFeedback('Transcription completed');
          setTimeout(() => setAudioFeedback(''), 3000);
        } catch (error) {
          console.error('Error uploading audio:', error);
          setAudioFeedback(`Failed to process audio: ${error.message}`);
        }
        
        // Stop all audio tracks
        audioStream.getTracks().forEach(track => track.stop());
      };
      
      // Store the media recorder for stopping later
      mediaRecorderRef.current = mediaRecorder;
      
      // Start recording
      mediaRecorder.start();
    } catch (error) {
      console.error('Error starting audio recording:', error);
      setAudioFeedback(`Recording failed: ${error.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const getAnswerFeedback = async () => {
    if (!answers[selectedQuestion]) {
      setAudioFeedback('No answer to analyze');
      return;
    }
    
    setAudioFeedback('Analyzing your answer...');
    
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/analyze-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: generatedQuestions[selectedQuestion],
          answer: answers[selectedQuestion],
          job_title: jobTitle
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Display the feedback
      setAudioFeedback(data.feedback || 'No feedback available');
    } catch (error) {
      console.error('Error getting answer feedback:', error);
      setAudioFeedback(`Couldn't analyze answer: ${error.message}`);
    }
  };

  const moveToNextQuestion = () => {
    if (selectedQuestion < generatedQuestions.length - 1) {
      setSelectedQuestion(selectedQuestion + 1);
      
      // Automatically speak the next question
      setTimeout(() => {
        speakQuestion(generatedQuestions[selectedQuestion + 1]);
      }, 1000);
    } else {
      // If this was the last question, suggest ending the interview
      setAudioFeedback("You've completed all the questions! You can now end the interview.");
      setTimeout(() => setAudioFeedback(''), 5000);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', marginTop: '20px', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {!interviewStarted && !interviewEnded ? (
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Mock Interview</h1>
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>Please enter the job title you're applying for:</p>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Enter job title"
            style={{ padding: '10px', fontSize: '16px', width: '100%', marginBottom: '20px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button
            onClick={startInterview}
            disabled={loading}
            style={{
              padding: '15px 30px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              backgroundColor: loading ? '#cccccc' : '#007BFF',
              color: 'white',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            {loading ? 'Please wait...' : 'Start Interview'}
          </button>
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </div>
      ) : interviewEnded ? (
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Interview Completed</h1>
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>
            Your interview is completed. Here's a summary of your answers:
          </p>
          <div style={{ textAlign: 'left', marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
            {generatedQuestions.map((question, index) => (
              <div key={index} style={{ marginBottom: '20px' }}>
                <p style={{ fontWeight: 'bold' }}>{`Q${index + 1}: ${question}`}</p>
                <p style={{ marginLeft: '20px' }}>{`A: ${answers[index] || 'Not answered'}`}</p>
              </div>
            ))}
          </div>
          
          {/* Interview Analysis Section */}
          <div style={{ textAlign: 'left', marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Interview Analysis</h2>
            {analysisLoading ? (
              <p>Analyzing your interview, please wait...</p>
            ) : (
              <div style={{ whiteSpace: 'pre-line' }}>{interviewAnalysis}</div>
            )}
          </div>
          
          <button
            onClick={() => {
              setInterviewEnded(false);
              setInterviewStarted(false);
              setGeneratedQuestions([]);
              setAnswers([]);
              setSelectedQuestion(0);
              setError(null);
              setInterviewAnalysis('');
            }}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#007BFF',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Start a New Interview
          </button>
        </div>
      ) : (
        <div>
          <h1 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
            Mock Interview: {jobTitle}
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '20px', width: '100%', textAlign: 'center' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '360px',
                  height: '270px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  marginBottom: '10px'
                }}
              />
              
              {gazeStatus && (
                <div style={{ 
                  marginTop: '5px', 
                  padding: '5px 10px', 
                  display: 'inline-block',
                  backgroundColor: gazeStatus === 'Looking at Camera' ? '#d4edda' : '#f8d7da',
                  color: gazeStatus === 'Looking at Camera' ? '#155724' : '#721c24',
                  borderRadius: '3px',
                  fontSize: '14px'
                }}>
                  {gazeStatus}
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <p>Loading questions...</p>
              </div>
            ) : generatedQuestions.length > 0 ? (
              <div style={{ width: '100%', marginBottom: '20px' }}>
                <div style={{ 
                  padding: '15px', 
                  backgroundColor: '#f9f9f9', 
                  borderRadius: '5px', 
                  border: '1px solid #ddd',
                  marginBottom: '10px'
                }}>
                  <p style={{ fontWeight: 'bold' }}>
                    Question {selectedQuestion + 1} of {generatedQuestions.length}:
                  </p>
                  <p>{generatedQuestions[selectedQuestion]}</p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '20px' }}>
                  <button
                    onClick={() => speakQuestion(generatedQuestions[selectedQuestion])}
                    style={{
                      padding: '10px 15px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      backgroundColor: '#28A745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px'
                    }}
                  >
                    Read Question Aloud
                  </button>
                  
                  {!isRecording && !answers[selectedQuestion] ? (
                    <button
                      onClick={startRecording}
                      style={{
                        padding: '10px 15px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Mic size={16} /> Record Answer
                    </button>
                  ) : isRecording ? (
                    <button
                      onClick={stopRecording}
                      style={{
                        padding: '10px 15px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <MicOff size={16} /> Stop Recording
                    </button>
                  ) : (
                    <button
                      onClick={moveToNextQuestion}
                      style={{
                        padding: '10px 15px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        backgroundColor: '#007BFF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Send size={16} /> Next Question
                    </button>
                  )}
                </div>
                
                {audioFeedback && (
                  <div style={{
                    padding: '10px',
                    marginBottom: '15px',
                    backgroundColor: isRecording ? '#d4edda' : '#f8d7da',
                    color: isRecording ? '#155724' : '#721c24',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}>
                    {audioFeedback}
                  </div>
                )}
                
                {answers[selectedQuestion] && (
                  <div style={{
                    padding: '15px',
                    marginBottom: '15px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}>
                    <p style={{ fontWeight: 'bold' }}>Your Answer:</p>
                    <p>{answers[selectedQuestion]}</p>
                    
                    {/* Add feedback button */}
                    <button
                      onClick={getAnswerFeedback}
                      style={{
                        padding: '5px 15px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        marginTop: '10px'
                      }}
                    >
                      Get AI Feedback
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <p>{error || "No questions available. Please try a different job title."}</p>
                <button
                  onClick={() => generateQuestions(jobTitle)}
                  style={{
                    padding: '10px 15px',
                    backgroundColor: '#007BFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '10px'
                  }}
                >
                  Generate Questions Manually
                </button>
              </div>
            )}
          </div>

          <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', justifyContent: 'space-between' }}>
              <button
                onClick={enableWebcam}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '5px', 
                  padding: '10px', 
                  border: '1px solid #ccc', 
                  borderRadius: '5px', 
                  cursor: 'pointer',
                  backgroundColor: '#f8f9fa'
                }}
              >
                <Video size={20} /> Restart Webcam
              </button>
              
              <button
                onClick={endInterview}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#FF5733',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                End Interview
              </button>
            </div>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}