import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Upload, FileText, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Button, Snackbar, Alert, LinearProgress, Typography, Box, Card, CardContent } from "@mui/material";
import axios from "axios";
import Navbarapp from "../components/Navbarapp";
import Sidebar from "../components/Sidebar";

export default function VideoAnalysis() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [summary, setSummary] = useState("");
  const [videoId, setVideoId] = useState("");
  const [processingStatus, setProcessingStatus] = useState("");
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

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    try {
      const response = await axios.post(`${API_BASE_URL}/api/video/upload-video`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
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

  const startPolling = (id) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        const response = await axios.get(`${API_BASE_URL}/api/video/video/${id}`);
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

  // Animation variants
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

  const videoPreviewVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Navbar and Sidebar */}
      <Navbarapp />
      
      <aside className="fixed left-0 top-16 w-[19%] h-[calc(100vh-4rem)] bg-white/80 backdrop-blur-lg shadow-lg">
        <Sidebar />
      </aside>

      <motion.div 
        className="ml-[20%] pt-24 p-8 flex justify-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          variants={itemVariants}
          className="w-full max-w-3xl"
        >
          <Card className="bg-white/80 backdrop-blur-lg shadow-lg border border-indigo-50 rounded-xl overflow-hidden">
            <CardContent className="p-8">
              <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
                <Video className="w-7 h-7 text-indigo-600" />
                <Typography variant="h5" component="h1" className="font-bold text-gray-800">
                  Interview Video Analysis
                </Typography>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mb-6"
              >
                <Typography variant="body1" color="text.secondary" className="mb-4">
                  Upload an interview video to get AI-powered insights and feedback on the interview performance.
                </Typography>
                
                <input
                  type="file"
                  accept="video/mp4, video/mkv, video/avi"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />

                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                    videoFile ? "border-green-400 bg-green-50/30" : "border-indigo-200 bg-white/50 hover:border-indigo-300 hover:bg-indigo-50/30"
                  }`}
                  onClick={openFileSelector}
                >
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{ 
                        scale: videoFile ? 1.1 : 1,
                        rotate: videoFile ? 360 : 0
                      }}
                      transition={{ 
                        type: "spring",
                        duration: 0.6,
                        bounce: 0.5
                      }}
                    >
                      <Upload className={`w-12 h-12 mb-3 transition-colors duration-300 ${
                        videoFile ? 'text-green-600' : 'text-indigo-600'
                      }`} />
                    </motion.div>
                    
                    <motion.p 
                      initial={false}
                      animate={{ 
                        scale: videoFile ? [1, 1.1, 1] : 1,
                        color: videoFile ? "#059669" : "#4B5563"
                      }}
                      transition={{ duration: 0.3 }}
                      className="mb-2 font-medium"
                    >
                      {videoFile ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                          >
                            <CheckCircle className="w-5 h-5" />
                          </motion.span>
                          {videoFile.name}
                        </span>
                      ) : (
                        "Click or drag and drop your interview video"
                      )}
                    </motion.p>
                    
                    <p className="text-gray-500 text-sm">
                      Supported formats: MP4, MKV, AVI
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              <AnimatePresence>
                {videoPreview && (
                  <motion.div 
                    variants={videoPreviewVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="my-6"
                  >
                    <Typography variant="body2" component="p" className="text-gray-700 mb-2 font-medium">
                      Video Preview:
                    </Typography>
                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-md max-w-md mx-auto">
                      <video controls className="w-full max-h-[240px] object-contain">
                        <source src={videoPreview} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {uploading && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="my-6"
                  >
                    <Box sx={{ width: "100%" }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress variant="determinate" value={uploadProgress} />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {uploadProgress}%
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Upload className="w-4 h-4" /> Uploading video...
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {!uploading && processingStatus === "processing" && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="my-6 bg-indigo-50 rounded-lg p-4 flex items-center gap-3"
                  >
                    <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
                    <div>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'rgb(79, 70, 229)' }}>
                        Processing video...
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgb(99, 102, 241)' }}>
                        Our AI is analyzing the interview. This may take several minutes.
                      </Typography>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants} className="mt-6">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpload}
                  fullWidth
                  disabled={uploading || !videoFile || processingStatus === "processing"}
                  sx={{ 
                    py: 1.2,
                    background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #4338CA 0%, #6D28D9 100%)',
                    },
                    '&.Mui-disabled': {
                      background: '#E5E7EB',
                      color: '#9CA3AF'
                    }
                  }}
                  startIcon={<Upload className="w-5 h-5" />}
                >
                  {uploading ? "Uploading..." : processingStatus === "processing" ? "Processing..." : "Upload Video for Analysis"}
                </Button>
              </motion.div>

              <AnimatePresence>
                {summary && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
                    className="mt-8 bg-white/90 rounded-xl p-6 border border-indigo-100 shadow-md"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: '#1F2937' }}>
                        Interview Analysis
                      </Typography>
                    </div>
                    
                    <Box className="prose prose-sm max-w-none">
                      <Typography variant="body1" component="div" sx={{ 
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.7,
                        color: '#374151'
                      }}>
                        {summary.split(/(\*\*.*?\*\*)/).map((part, index) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            // This is a bolded part, remove the ** and apply bold style
                            const boldText = part.substring(2, part.length - 2);
                            return <span key={index} style={{ fontWeight: 'bold', color: '#4F46E5' }}>{boldText}</span>;
                          }
                          // Regular text, return as is
                          return part;
                        })}
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="info" 
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}