import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { FiUploadCloud } from "react-icons/fi";
import { useParams } from "react-router-dom";
import axios from "axios";


const Modal = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-2xl font-bold mb-4">Success!</h2>
        <p>{message}</p>
        <div className="flex justify-end mt-4">
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ApplicationForm = () => {
  const { id } = useParams(); 
  const [formData, setFormData] = useState({
    Name: "",
    email: "",
    resume: null,
  });

  const [job, setJob] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


  // ✅ Fetch job details when the page loads
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/get_job_by_id/${id}`);
        setJob(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Error fetching job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // ✅ Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, resume: e.target.files[0] });
  };

  // ✅ Handle Submit (Upload Resume API Call)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage("");

    if (!formData.resume) {
      setMessage("Please upload a resume.");
      setUploading(false);
      return;
    }

    const uploadData = new FormData();
    uploadData.append("file", formData.resume);
    uploadData.append("job_description_id", id);
    try {
      const response = await axios.post(`${API_BASE_URL}/application/upload_resume`, uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage("Your application is received successfully.");
      setShowModal(true);
      console.log("Upload Response:", response.data);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Error uploading resume");
    } finally {
      setUploading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);  // Close the modal
  };

  return (
    <div className="flex bg-sky-10 flex-col min-h-screen">
      <Navbar />

      <div className="flex justify-between p-12 bg-[#f0f4f8]">
        {/* Left Section: Application Form */}
        <div style={{ margin: "30px" }} className="w-1/2 bg-white p-10 rounded-lg shadow-lg space-y-6">
          <h2 className="text-2xl font-bold mb-6">Application Form</h2>

          {/* Input Fields */}
          <label className="block font-bold text-sm mb-2">Full Name *</label>
          <input
            className="w-full p-3 mb-4 border rounded border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200"
            type="text"
            name="Name"
            value={formData.Name}
            onChange={handleChange}
            placeholder="Enter your Name"
            required
          />

          <label className="block font-bold text-sm mb-2">Email *</label>
          <input
            className="w-full p-3 mb-4 border rounded border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            required
          />

          <label className="block font-bold text-sm mb-2">Upload your Resume *</label>
          <div className="flex items-center justify-center gap-3 cursor-pointer bg-gray-100 border-2 border-dashed border-indigo-600 p-6 rounded-lg">
            <FiUploadCloud size={24} />
            <label htmlFor="resume-upload" className="font-bold text-indigo-600 cursor-pointer">
              Drag and drop to upload or <span className="text-indigo-700">Browse</span>
            </label>
            <input type="file" id="resume-upload" name="resume" onChange={handleFileChange} className="hidden" required />
          </div>

          {/* Submit Button */}
          <button
            className="bg-black text-white py-3 px-6 rounded-lg w-full mt-6 hover:bg-gray-800"
            type="submit"
            onClick={handleSubmit}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Submit Application"}
          </button>

          {/* Success/Error Message */}
          {message && <p className="mt-4 text-center text-red-600">{message}</p>}
        </div>

        {/* Right Section: Job Information */}
        <div style={{ margin: "30px" }} className="w-1/2 bg-white p-10 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Job Information</h2>

          {loading ? (
            <p>Loading job details...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <>
              <label className="block font-bold text-sm mb-2">Job Title</label>
              <div className="p-4 border rounded bg-gray-100 text-gray-800 mb-6">{job?.title || "Unknown Job"}</div>

              <label className="block font-bold text-sm mb-2">Job Description</label>
              <div className="p-4 rounded-lg border border-gray-300 bg-gray-100 min-h-[300px] max-h-[300px] overflow-y-auto">
                {job?.description_text || "No description available."}
              </div>
            </>
          )}
        </div>
      </div>
      {/* Modal Component */}
      {showModal && <Modal message={message} onClose={closeModal} />}
    </div>
  );
};

export default ApplicationForm;
