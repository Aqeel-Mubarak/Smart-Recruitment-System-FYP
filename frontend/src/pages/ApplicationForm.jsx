import React, { useState } from 'react';
import Navbar from '../components/Navbar'; // Adjust the path based on your project structure
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
    // Logic for form submission
    console.log(formData);
  };

  // Inline Styles
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f0f4f8', // Background color
    },
    formContainer: {
      width: '48%',
      backgroundColor: '#ffffff', // Form background
      padding: '40px',
      borderRadius: '10px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)', // Shadow
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      margin: 50, 
    },
    formHeader: {
      fontWeight: 'bold', // Bold main heading
      fontSize: '24px',
      marginBottom: '20px',
    },
    label: {
      fontWeight: 'bold',
      marginBottom: '5px',
      fontSize: '14px',
      display: 'block',
    },
    input: {
      width: '100%',
      padding: '10px',
      marginBottom: '15px',
      borderRadius: '5px',
      border: '1px solid #dcdcdc',
      fontSize: '14px',
    },
    uploadResume: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      cursor: 'pointer',
      backgroundColor: '#f3f4f6',
      border: '2px dashed #7400b8',
      padding: '20px',
      borderRadius: '10px',
      textAlign: 'center',
      width: '100%',
      minHeight: '100px',
    },
    button: {
      backgroundColor: 'black',
      color: 'white',
      padding: '15px',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      transition: 'background-color 0.3s ease',
      width: '100%',
    },
    jobInfoContainer: {
      width: '48%',
      backgroundColor: '#ffffff', // Background color for job info form
      padding: '40px',
      borderRadius: '10px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)', // Shadow
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      margin: 50,
      height: '100%', // Set height to match the form
    },
    jobInfoHeader: {
      fontWeight: 'bold', // Bold main heading
      fontSize: '24px',
    },
    jobInfoHeading: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '10px',
    },
    jobInfoBoxTitle: {
      padding: '15px',
      borderRadius: '5px',
      border: '1px solid #dcdcdc',
      backgroundColor: '#f9f9f9',
      minHeight: '50px', // Make the title box smaller
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center', // Center the title text
      wordWrap: 'break-word',
      fontWeight: 'bold',
      color: '#333',
    },
    jobInfoBoxDescription: {
      padding: '15px',
      borderRadius: '5px',
      border: '1px solid #dcdcdc',
      backgroundColor: '#f9f9f9',
      minHeight: '300px', // Set height to match form size
      maxHeight: '300px', // Fix the height for scrollable content
      display: 'flex',
      alignItems: 'flex-start',
      overflowY: 'auto', // Allow vertical scrolling if the text is long
      overflowX: 'hidden',
       // Allow scrolling if the text is long
      wordWrap: 'break-word',
    },
  };

  return (
    <div>
      <Navbar /> {/* Navbar component */}
      <div style={styles.container}>
        {/* Left Section: Application Form */}
        <div style={styles.formContainer}>
          <h2 style={styles.formHeader}>Application Form</h2>

          <label style={styles.label}>First name</label>
          <input
            style={styles.input}
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter your First Name"
          />

          <label style={styles.label}>Last name</label>
          <input
            style={styles.input}
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter your Last Name"
          />

          <label style={styles.label}>Graduation Year</label>
          <input
            style={styles.input}
            type="text"
            name="graduationYear"
            value={formData.graduationYear}
            onChange={handleChange}
            placeholder="20XX"
          />

          <label style={styles.label}>Degree Title</label>
          <input
            style={styles.input}
            type="text"
            name="degreeTitle"
            value={formData.degreeTitle}
            onChange={handleChange}
            placeholder="Enter your Degree Title"
          />

          <label style={styles.label}>Institute Name</label>
          <input
            style={styles.input}
            type="text"
            name="instituteName"
            value={formData.instituteName}
            onChange={handleChange}
            placeholder="Enter your Institute Name"
          />

          <label style={styles.label}>CGPA</label>
          <input
            style={styles.input}
            type="text"
            name="cgpa"
            value={formData.cgpa}
            onChange={handleChange}
            placeholder="x.xx/x.xx"
          />

          <label style={styles.label}>Phone Number</label>
          <input
            style={styles.input}
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter Phone number without dashes. e.g(01232387643)"
          />
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
          />

          <label style={styles.label}>Upload your Resume</label>
          <div style={styles.uploadResume}>
            <FiUploadCloud size={24} />
            <label htmlFor="resume-upload" style={styles.label}>
              Drag and drop to upload or <span>Browse</span>
            </label>
            <input
              type="file"
              id="resume-upload"
              name="resume"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          

          <button style={styles.button} type="submit">
            Submit Application
          </button>
        </div>

        {/* Right Section: Static Job Info */}
        <div style={styles.jobInfoContainer}>
          <h2 style={styles.jobInfoHeader}>Job Information</h2>

          <label style={styles.jobInfoHeading}>Job Title</label>
          <div style={styles.jobInfoBoxTitle}>Software Engineer</div>

          <label style={styles.jobInfoHeading}>Job Description</label>
          <div style={styles.jobInfoBoxDescription}>
        
            The job may also include mentoring junior developers and assisting in design reviews for various product features.
            The job may also include mentoring junior developers and assisting in design reviews for various product features.
            The job may also include mentoring junior developers and assisting in design reviews for various product features.

            The job may also include mentoring junior developers and assisting in design reviews for various product features.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
