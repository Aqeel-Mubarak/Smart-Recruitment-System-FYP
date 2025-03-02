import { useState, useRef, useEffect } from "react";
import { FaVideo } from "react-icons/fa";
import { Button, Snackbar, Alert, LinearProgress, Typography, Box, Card, CardContent } from "@mui/material";
import axios from "axios"; // Use axios for uploading
import Navbarapp from "../components/Navbarapp"; // Navbar component
import Sidebar from "../components/Sidebar"; // Sidebar component

export default function VideoAnalysis() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [summary, setSummary] = useState(""); // To store the generated summary
  const [videoId, setVideoId] = useState(""); // To store the video ID
  const [processingStatus, setProcessingStatus] = useState(""); // To track processing status
  const fileInputRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === "video/mp4" || file.type === "video/mkv" || file.type === "video/avi")) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      // Reset states when new file is selected
      setSummary("");
      setVideoId("");
      setProcessingStatus("");
    } else {
      setSnackbarMessage("Please upload a valid video file (MP4, MKV, or AVI)");
      setOpenSnackbar(true);
    }
  };

  const handleUpload = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setSnackbarMessage("No access token found.");
      setOpenSnackbar(true);
      return;
    }

    if (!videoFile) {
      setSnackbarMessage("No file selected");
      setOpenSnackbar(true);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("video", videoFile);

    // Ensure the correct API base URL
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    try {
      const response = await axios.post(`${API_BASE_URL}/api/video/upload-video`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // Add token in Authorization header
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });

      if (response.status === 200) {
        setSnackbarMessage("Video uploaded successfully! Processing started...");
        setOpenSnackbar(true);
        setVideoId(response.data.video_id);
        setProcessingStatus("processing");
        
        // Start polling for processing updates
        startPolling(response.data.video_id);
      } else {
        setSnackbarMessage("Failed to upload video. Please try again.");
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setSnackbarMessage(error.response?.data?.detail || "Error uploading video. Please check server connection.");
      setOpenSnackbar(true);
    }

    setUploading(false);
  };

  // Start polling for video processing status
  const startPolling = (id) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/video/video/${id}`);
        setProcessingStatus(response.data.status);

        if (response.data.status === "completed") {
          setSummary(response.data.summary);
          setSnackbarMessage("Video processing completed!");
          setOpenSnackbar(true);
          clearInterval(pollIntervalRef.current);
        } else if (response.data.status === "failed") {
          setSnackbarMessage("Video processing failed. Please try again.");
          setOpenSnackbar(true);
          clearInterval(pollIntervalRef.current);
        }
      } catch (error) {
        console.error("Polling error:", error);
        setSnackbarMessage("Error checking processing status.");
        setOpenSnackbar(true);
        clearInterval(pollIntervalRef.current);
      }
    }, 5000); // Poll every 5 seconds
  };

  const openFileSelector = () => {
    fileInputRef.current.click();
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar and Sidebar */}
      <Navbarapp />
      <aside className="fixed left-0 top-16 w-[19%] h-full bg-white shadow-lg">
        <Sidebar />
      </aside>

      <div className="ml-[20%] w-[80%] p-8 flex justify-center items-center">
        <Card sx={{ maxWidth: 600, width: "100%", marginTop: ".5in"  }}>
          <CardContent>
            {/* Video Analysis Heading with margin-top of 1 inch */}
            <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
             Get Interview Video Analyzed 
            </Typography>

            <input
              type="file"
              accept="video/mp4, video/mkv, video/avi"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />

            <Button
              variant="outlined"
              color="primary"
              onClick={openFileSelector}
              fullWidth
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                marginBottom: 2,
                padding: 2,
                fontWeight: "bold",
              }}
            >
              <FaVideo className="w-5 h-5" /> Select Video
            </Button>

            {videoPreview && (
              <Box sx={{ marginTop: 2, textAlign: "center" }}>
                <video controls className="mt-4 w-full max-w-sm rounded-lg shadow-lg">
                  <source src={videoPreview} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <Typography variant="body2" sx={{ marginTop: 1 }}>
                  {videoFile?.name}
                </Typography>
              </Box>
            )}

            {uploading && (
              <Box sx={{ marginTop: 2, width: "100%" }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" sx={{ textAlign: "center", marginTop: 1 }}>
                  Uploading: {uploadProgress}%
                </Typography>
              </Box>
            )}

            {!uploading && processingStatus === "processing" && (
              <Box sx={{ marginTop: 2, width: "100%" }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ textAlign: "center", marginTop: 1 }}>
                  Processing video... This may take several minutes.
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              fullWidth
              sx={{ marginTop: 4 }}
              disabled={uploading || !videoFile || processingStatus === "processing"}
            >
              {uploading ? "Uploading..." : processingStatus === "processing" ? "Processing..." : "Upload Video"}
            </Button>

            {summary && (
  <Box sx={{ marginTop: 4 }}>
    <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
      Interview Summary:
    </Typography>
    <Card variant="outlined" sx={{ padding: 2, backgroundColor: "#f8f9fa" }}>
      <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
        {summary.split(/(\*\*.*?\*\*)/).map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            // This is a bolded part, remove the ** and apply bold style
            const boldText = part.substring(2, part.length - 2);
            return <span key={index} style={{ fontWeight: 'bold' }}>{boldText}</span>;
          }
          // Regular text, return as is
          return part;
        })}
      </Typography>
    </Card>
  </Box>
)}
          </CardContent>
        </Card>
      </div>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="info" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
