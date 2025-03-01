import React, { useState, useRef } from "react";
import { Mic, Video } from "lucide-react";

const questions = [
  "Explain how you would use Adobe Photoshop to create a high-fidelity prototype for a mobile app, incorporating realistic visual elements and interactive elements. What tools and techniques would you utilize?",
  "Describe a challenging UI/UX design problem you faced and how you resolved it.",
  "How do you ensure accessibility in your UI/UX designs?",
  "What are the key principles of good UI/UX design?",
  "How do you handle user feedback in the design process?"
];

export default function MockInterview() {
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [error, setError] = useState(null);
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleAnswerChange = (e) => {
    const newAnswers = [...answers];
    newAnswers[selectedQuestion] = e.target.value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (answers[selectedQuestion].trim() !== "") {
      setError("You have already answered this question.");
    }
  };

  const enableWebcam = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(videoStream);
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";
    
    recognitionRef.current.onstart = () => {
      setRecording(true);
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const newAnswers = [...answers];
      newAnswers[selectedQuestion] = transcript;
      setAnswers(newAnswers);
    };

    recognitionRef.current.onend = () => {
      setRecording(false);
    };

    recognitionRef.current.start();
  };

  const startAudioRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(audioStream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting audio recording:", error);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", marginTop: "20px", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Mock Interview</h1>
      <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#f3f3f3", padding: "10px", borderRadius: "5px" }}>
        {questions.map((_, index) => (
          <button key={index} onClick={() => setSelectedQuestion(index)} style={{ padding: "10px", cursor: "pointer" }}>
            Question {index + 1}
          </button>
        ))}
      </div>
      <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #ddd", borderRadius: "5px", backgroundColor: "#fff" }}>
        <p style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>{questions[selectedQuestion]}</p>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <button onClick={recording ? stopAudioRecording : startAudioRecording} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", cursor: "pointer" }}>
            <Mic size={20} /> {recording ? "Stop Recording" : "Record Answer"}
          </button>
          <button onClick={enableWebcam} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", cursor: "pointer" }}>
            <Video size={20} /> Enable Webcam
          </button>
        </div>
        {stream && (
          <video ref={videoRef} autoPlay playsInline style={{ width: "100%", borderRadius: "5px", marginBottom: "10px" }} />
        )}
        {audioURL && (
          <audio controls src={audioURL} style={{ width: "100%", marginTop: "10px" }}></audio>
        )}
        <textarea
          placeholder="Type your answer here..."
          value={answers[selectedQuestion]}
          onChange={handleAnswerChange}
          style={{ width: "100%", height: "100px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
        ></textarea>
        <button onClick={handleSubmit} style={{ marginTop: "10px", padding: "10px", backgroundColor: "#007BFF", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Submit
        </button>
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </div>
    </div>
  );
}
