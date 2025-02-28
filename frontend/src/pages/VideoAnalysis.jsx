import { useState, useRef } from "react";
import { FaVideo } from "react-icons/fa";
import Navbarapp from "../components/Navbarapp"; // Your existing Navbar component
import Sidebar from "../components/Sidebar";

export default function VideoAnalysis() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "video/mp4") {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    } else {
      alert("Please upload an MP4 video file.");
    }
  };

  const handleUpload = () => {
    if (!videoFile) {
      alert("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);

    // Here you would send the formData to your backend API
    console.log("Uploading video: ", videoFile.name);
  };

  const openFileSelector = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Static Navbar */}
      <Navbarapp />

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row">
        {/* Fixed Static Sidebar */}
        <aside className="md:fixed left-0 top-16 w-full md:w-[19%] h-auto md:h-screen overflow-y-auto overflow-x-hidden bg-white shadow-lg">
          <Sidebar />
        </aside>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 mt-10 md:mt-16 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 w-full max-w-lg">
            <input
              type="file"
              accept="video/mp4"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg w-full"
              onClick={openFileSelector}
            >
              <FaVideo className="w-5 h-5" /> Select Video
            </button>

            {videoPreview && (
              <video controls className="mt-4 w-full rounded-lg">
                <source src={videoPreview} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}

            <button className="mt-4 w-full px-4 py-2 bg-black text-white hover:bg-gray-900 rounded-lg" onClick={handleUpload}>
              Upload Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
