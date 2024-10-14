import React, { useState } from 'react';
import Navbarapp from '../components/Navbarapp'; // Adjust the path based on your project structure
import { FiUploadCloud } from 'react-icons/fi'; // Import react-icons

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    graduationYear: '',
    degreeTitle: '',
    instituteName: '',
    cgpa: '',
    phoneNumber: '',
    email: '',
    resume: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, resume: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbarapp /> {/* Navbar component */}

      <div className="flex justify-between p-12">
        {/* Left Section: Application Form */}
        <div className="w-1/2 bg-white p-10 rounded-lg shadow-lg space-y-6">
          <h2 className="text-2xl font-bold mb-6">Application Form</h2>

          <label className="block font-bold text-sm mb-2">
            First name <span className="text-red-600">*</span>
          </label>
          <input
            className="w-full p-3 mb-4 border rounded border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter your First Name"
            required
          />

          <label className="block font-bold text-sm mb-2">
            Last name <span className="text-red-600">*</span>
          </label>
          <input
            className="w-full p-3 mb-4 border rounded border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter your Last Name"
            required
          />

          <label className="block font-bold text-sm mb-2">
            Graduation Year <span className="text-red-600">*</span>
          </label>
          <input
            className="w-full p-3 mb-4 border rounded border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200"
            type="text"
            name="graduationYear"
            value={formData.graduationYear}
            onChange={handleChange}
            placeholder="20XX"
            required
          />

          <label className="block font-bold text-sm mb-2">
            Degree Title <span className="text-red-600">*</span>
          </label>
          <input
            className="w-full p-3 mb-4 border rounded border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200"
            type="text"
            name="degreeTitle"
            value={formData.degreeTitle}
            onChange={handleChange}
            placeholder="Enter your Degree Title"
            required
          />

          <label className="block font-bold text-sm mb-2">
            Institute Name <span className="text-red-600">*</span>
          </label>
          <input
            className="w-full p-3 mb-4 border rounded border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200"
            type="text"
            name="instituteName"
            value={formData.instituteName}
            onChange={handleChange}
            placeholder="Enter your Institute Name"
            required
          />

          <label className="block font-bold text-sm mb-2">
            CGPA <span className="text-red-600">*</span>
          </label>
          <input
            className="w-full p-3 mb-4 border rounded border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200"
            type="text"
            name="cgpa"
            value={formData.cgpa}
            onChange={handleChange}
            placeholder="x.xx/x.xx"
            required
          />

          <label className="block font-bold text-sm mb-2">
            Phone Number <span className="text-red-600">*</span>
          </label>
          <input
            className="w-full p-3 mb-4 border rounded border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200"
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter Phone number without dashes. e.g(01232387643)"
            required
          />

          <label className="block font-bold text-sm mb-2">
            Email <span className="text-red-600">*</span>
          </label>
          <input
            className="w-full p-3 mb-4 border rounded border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            required
          />

          <label className="block font-bold text-sm mb-2">
            Upload your Resume <span className="text-red-600">*</span>
          </label>
          <div className="flex items-center justify-center gap-3 cursor-pointer bg-gray-100 border-2 border-dashed border-indigo-600 p-6 rounded-lg">
            <FiUploadCloud size={24} />
            <label htmlFor="resume-upload" className="font-bold text-indigo-600 cursor-pointer">
              Drag and drop to upload or <span className="text-indigo-700">Browse</span>
            </label>
            <input
              type="file"
              id="resume-upload"
              name="resume"
              onChange={handleFileChange}
              className="hidden"
              required
            />
          </div>

          <button
            className="bg-black text-white py-3 px-6 rounded-lg w-full mt-6 hover:bg-gray-800"
            type="submit"
            onClick={handleSubmit}
          >
            Submit Application
          </button>
        </div>

        {/* Right Section: Static Job Info */}
        <div className="w-1/2 bg-white p-10 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Job Information</h2>

          <label className="block font-bold text-sm mb-2">Job Title</label>
          <div className="p-4 border rounded bg-gray-100 text-gray-800 mb-6">
            Software Engineer
          </div>

          <label className="block font-bold text-sm mb-2">Job Description</label>
          <div className="p-4 border rounded bg-gray-100 text-gray-800 h-96 overflow-y-auto">
            Responsible for developing scalable web applications using React.js, Node.js, and other cutting-edge technologies.
            This role will require strong communication and problem-solving skills. You will work closely with product teams
            to build seamless user experiences. The job may also include mentoring junior developers and assisting in design
            reviews for various product features.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
