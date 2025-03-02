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
import ContactPage from './pages/ContactPage';
import CandidatesList from './pages/CandidatesList';
import ProtectedRoute from './components/ProtectedRoute';
import Verification from './pages/Verification';
import CalendarPage from './pages/CalendarPage';
import UpcomingInterviews from './pages/UpcomingInterviews';
import NewPassword from './pages/NewPassword';
import AIInterview from "./pages/AIInterview";

import VideoAnalysis from './pages/VideoAnalysis';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/resetpassword" element={<ForgetPassword />} />
        <Route path="/new-password/:token" element={<NewPassword />} />
        <Route path="/Calendar/:isManagement1/:jobid/:useremail?" element={<CalendarPage />} />
        <Route path="/verify/:token" element={<Verification />}/>
        <Route path="/application/:id" element={<ApplicationForm />} />
        <Route path="/ai-interview" element={<AIInterview />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/create-job" element={<CreateJob />} />
          <Route path="/reports" element={<Report />} />
          <Route path='/shortlist-candidate' element={<ShortlistCandidate/>} />
          <Route path='/resume-upload' element={<ResumeUploadPage/>} />
          <Route path='/open-jobs' element={<CurrentOpenJobs/>} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/candidates" element={<CandidatesList />} />
          <Route path="/upcoming-interviews" element={< UpcomingInterviews/>} />
          <Route path="/video-analysis" element={<VideoAnalysis />} /> {/* Route for VideoAnalysis */}
          </Route>
      </Routes>
    </Router>
  );
}

export default App;
