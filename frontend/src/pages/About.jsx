import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Users, Calendar, BarChart2, BriefcaseIcon, Brain, Zap, Shield } from 'lucide-react';

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pt-20 pb-12 relative">
      
      {/* Back Button */}
      <motion.button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 flex items-center bg-white shadow-md px-4 py-2 rounded-lg text-indigo-700 font-medium hover:bg-indigo-100 transition"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </motion.button>

      <motion.div className="container mx-auto px-4" variants={containerVariants} initial="hidden" animate="visible">
        
        {/* Hero Section */}
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-6">
            Smart Recruitment System
          </h1>
          <p className="text-xl text-indigo-700 max-w-3xl mx-auto">
            An intelligent recruitment platform that leverages AI to streamline your hiring process,
            making it more efficient, accurate, and data-driven.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-indigo-50"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 mr-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-indigo-900">
                  {feature.title}
                </h3>
              </div>
              <p className="text-indigo-700/80">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div className="text-center mt-16" variants={itemVariants}>
          <p className="text-lg text-indigo-700 mb-8">
            Experience the future of recruitment with our intelligent platform.
          </p>
          <motion.div
            onClick={() => navigate('/home')}
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:bg-indigo-700 transition-colors cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Recruiting Smarter
          </motion.div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default About;
