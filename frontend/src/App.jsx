import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import Home from './pages/home'; // Importing the Home component
import ForgetPassword from './pages/ForgetPassword';
import ApplicationForm from './pages/ApplicationForm';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/resetpassword" element={<ForgetPassword />} />
        <Route path="/application" element={<ApplicationForm />} />


      </Routes>
    </Router>
  );
}

export default App;
