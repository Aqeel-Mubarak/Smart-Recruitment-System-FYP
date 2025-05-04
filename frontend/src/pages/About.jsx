import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Users, Calendar, BarChart2, BriefcaseIcon, Brain, Zap, Shield } from 'lucide-react';

const HeroSVG = () => (
  <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-lg mx-auto drop-shadow-2xl">
    <ellipse cx="250" cy="350" rx="180" ry="30" fill="#e0e7ff" />
    <rect x="120" y="120" width="260" height="160" rx="30" fill="#6366f1" />
    <rect x="140" y="140" width="220" height="120" rx="20" fill="#fff" />
    <rect x="160" y="170" width="180" height="20" rx="10" fill="#c7d2fe" />
    <rect x="160" y="200" width="120" height="16" rx="8" fill="#a5b4fc" />
    <rect x="160" y="225" width="80" height="12" rx="6" fill="#6366f1" />
    <circle cx="370" cy="190" r="18" fill="#6366f1" />
    <rect x="355" y="210" width="30" height="8" rx="4" fill="#a5b4fc" />
    <ellipse cx="250" cy="120" rx="30" ry="10" fill="#a5b4fc" />
    <ellipse cx="250" cy="120" rx="15" ry="5" fill="#6366f1" />
    <rect x="200" y="260" width="100" height="10" rx="5" fill="#c7d2fe" />
    <rect x="220" y="275" width="60" height="8" rx="4" fill="#a5b4fc" />
    <rect x="240" y="290" width="20" height="6" rx="3" fill="#6366f1" />
    <circle cx="180" cy="190" r="10" fill="#6366f1" />
    <circle cx="320" cy="230" r="8" fill="#a5b4fc" />
  </svg>
);

const About = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 18 }
    }
  };

  const features = [
    { icon: <Brain className="w-6 h-6" />, title: "AI-Powered Resume Analysis", description: "Advanced LLMs analyze resumes to match candidates with job requirements efficiently." },
    { icon: <FileText className="w-6 h-6" />, title: "Smart Resume Processing", description: "Automated resume parsing and information extraction to streamline the recruitment process." },
    { icon: <BriefcaseIcon className="w-6 h-6" />, title: "Job Management", description: "Create and manage job postings with detailed requirements and qualifications." },
    { icon: <Users className="w-6 h-6" />, title: "Candidate Shortlisting", description: "Intelligent candidate ranking and shortlisting based on job requirements and skills match." },
    { icon: <Calendar className="w-6 h-6" />, title: "Interview Scheduling", description: "Efficient interview scheduling and management." },
    { icon: <BarChart2 className="w-6 h-6" />, title: "Analytics & Reporting", description: "Comprehensive recruitment analytics and reporting for data-driven decisions." },
    { icon: <Zap className="w-6 h-6" />, title: "Automated Workflow", description: "Streamlined recruitment process with automated stages." },
    { icon: <Shield className="w-6 h-6" />, title: "Secure & Reliable", description: "Enterprise-grade security for protecting sensitive recruitment data." }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-white flex flex-col relative overflow-x-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0 animate-gradient bg-gradient-to-br from-indigo-200 via-blue-100 to-white opacity-80" />
      {/* Back Button */}
      <motion.button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 flex items-center bg-white shadow-md px-4 py-2 rounded-lg text-indigo-700 font-medium hover:bg-indigo-100 transition z-20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </motion.button>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col md:flex-row items-center justify-center pt-28 pb-12 px-4 md:px-0">
        {/* SVG Illustration */}
        <div className="w-full md:w-1/2 flex items-center justify-center mb-8 md:mb-0">
          <HeroSVG />
        </div>
        {/* Hero Text */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start mt-10 md:mt-0 md:pl-12">
          <motion.h1 className="text-5xl md:text-6xl font-extrabold text-indigo-900 mb-6 text-center md:text-left leading-tight drop-shadow-lg">
            About Smart Recruitment System
          </motion.h1>
          <motion.p className="text-2xl text-indigo-700 max-w-xl mb-10 text-center md:text-left font-medium">
            Discover how our AI-powered platform transforms hiring for modern teams. Automate, analyze, and hire the best talent—faster and smarter.
          </motion.p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 pt-8 pb-20 relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.h2 className="text-4xl md:text-5xl font-extrabold text-indigo-900 mb-12 text-center" variants={itemVariants}>
            Platform Features
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl hover:shadow-indigo-200 transition-shadow border border-indigo-100 flex flex-col items-start"
                whileHover={{ y: -8, scale: 1.03 }}
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600 mr-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-indigo-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-indigo-700/90 text-lg font-medium">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Bottom CTA Section */}
      <section className="relative z-10 bg-gradient-to-r from-indigo-500 to-blue-500 py-16 px-4 text-center mt-8">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 drop-shadow-lg" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          Experience the future of recruitment
        </motion.h2>
        <motion.p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          Join hundreds of teams using Smart Recruitment System to find, analyze, and hire the best talent with AI.
        </motion.p>
        <motion.button
          onClick={() => navigate('/home')}
          className="bg-white text-indigo-700 px-12 py-4 rounded-2xl font-bold text-xl shadow-xl hover:bg-indigo-50 transition-all animate-pulse"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.97 }}
        >
          Start Recruiting Smarter
        </motion.button>
      </section>

      {/* Subtle animated background shapes */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 w-[600px] h-[600px] bg-indigo-200 rounded-full opacity-30 blur-3xl animate-pulse-slow" style={{ transform: 'translateX(-50%)' }} />
        <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-blue-200 rounded-full opacity-20 blur-2xl animate-pulse-slow" />
      </div>
    </div>
  );
};

export default About;
