import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import Home from './pages/home'; 
import ForgetPassword from './pages/ForgetPassword';
import ApplicationForm from './pages/ApplicationForm';
import CreateJob from './pages/CreateJob';
import Report from './pages/Report';
import ShortlistCandidate from './pages/ShortlistCandidate';
import ResumeUploadPage from './pages/ResumeUploadPage';
import CurrentOpenJobs from './pages/CurrentOpenJobs';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/resetpassword" element={<ForgetPassword />} />
        <Route path="/application" element={<ApplicationForm />} />
        <Route path="/create-job" element={<CreateJob />} />
        <Route path="/reports" element={<Report />} />
        <Route path='/shortlist-candidate' element={<ShortlistCandidate/>} />
        <Route path='/resume-upload' element={<ResumeUploadPage/>} />
        <Route path='/open-jobs' element={<CurrentOpenJobs/>} />
      </Routes>
    </Router>
  );
}

export default App;
