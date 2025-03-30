import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { buttonVariants } from './animations';
import {
  Home,
  Upload,
  FileText,
  Briefcase,
  Users,
  Calendar,
  BarChart2,
  Video,
  MessageCircle,
  ClipboardList
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/open-jobs', label: 'Jobs', icon: Briefcase },
    { path: '/create-job', label: 'Create Job', icon: FileText },
    { path: '/resume-upload', label: 'Resume Upload', icon: Upload },
    { path: '/shortlist-candidate', label: 'Shortlist Candidates', icon: Users },
    { path: '/upcoming-interviews', label: 'Upcoming Interviews', icon: Calendar },
    { path: '/reports', label: 'Reports', icon: BarChart2 },
    { path: '/video-analysis', label: 'Analyze recorded Interview', icon: Video },
    { path: '/Create-Interview', label: 'Create AI Interview', icon: MessageCircle },
    { path: '/admin/summaries', label: 'AI Interviews Results', icon: ClipboardList },
  ];

  const sidebarVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  return (
    <motion.aside 
      className="w-64 bg-white/80 backdrop-blur-sm text-gray-800 shadow-lg border-r border-indigo-100 h-full flex flex-col"
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      style={{ minHeight: "calc(100vh - 4rem)" }}
    >
      <nav className="p-6 overflow-y-auto flex-1" style={{ maxHeight: "calc(100vh - 4rem)" }}>
        <motion.ul className="space-y-2" variants={sidebarVariants}>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <motion.li key={item.path} variants={itemVariants}>
                <Link
                  to={item.path}
                  className={`
                    group flex items-center justify-between p-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-600 hover:bg-indigo-50/50 hover:text-indigo-600'
                    }
                  `}
                >
                  <span className="flex items-center space-x-3">
                    <motion.div
                      className={`p-2 rounded-lg ${
                        isActive 
                          ? 'bg-indigo-100' 
                          : 'bg-gray-100 group-hover:bg-indigo-100'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className={`w-5 h-5 ${
                        isActive 
                          ? 'text-indigo-600' 
                          : 'text-gray-600 group-hover:text-indigo-600'
                      }`} />
                    </motion.div>
                    <span className="font-medium">{item.label}</span>
                  </span>
                  
                  {isActive && (
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-indigo-600"
                      layoutId="activeIndicator"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                    />
                  )}
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      </nav>
      
      <style jsx>{`
        nav::-webkit-scrollbar {
          width: 6px;
        }
        nav::-webkit-scrollbar-track {
          background: transparent;
        }
        nav::-webkit-scrollbar-thumb {
          background-color: rgba(99, 102, 241, 0.3);
          border-radius: 20px;
        }
        nav::-webkit-scrollbar-thumb:hover {
          background-color: rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </motion.aside>
  );
};

export default Sidebar;
