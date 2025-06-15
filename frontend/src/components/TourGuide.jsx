import React, { useState, useEffect } from 'react';
import Joyride from 'react-joyride';

/**
 * TourGuide Component
 * 
 * This component implements an interactive tour guide for the application using react-joyride.
 * It provides a step-by-step walkthrough of the main features and navigation elements
 * to help new users understand the application's functionality.
 */
const TourGuide = () => {
  // State to control whether the tour should run
  const [runTour, setRunTour] = useState(false);

  /**
   * Effect hook to check if the tour has been shown before
   * If not shown, automatically start the tour and mark it as shown in localStorage
   */
  useEffect(() => {
    const tourShown = localStorage.getItem('tourShown');
    if (!tourShown) {
      setRunTour(true);
      localStorage.setItem('tourShown', 'true');
    }
  }, []);

  /**
   * Callback function to handle tour events
   * Stops the tour when it's either finished or skipped by the user
   */
  const handleTourCallback = (data) => {
    const { status } = data;
    if (status === 'finished' || status === 'skipped') {
      setRunTour(false);
    }
  };

  /**
   * Tour steps configuration
   * Each step defines a target element (using CSS selectors) and its corresponding explanation
   * The steps guide users through the main navigation items in the sidebar
   */
  const steps = [
    {
      target: '.sidebar-home-link',
      content: 'This is the Home page  where you see your main dashboard.',
    },
    {
      target: '.sidebar-resume-link',
      content: 'Upload candidate resumes here.',
    },
    {
      target: '.sidebar-createjob-link',
      content: 'Create a new job posting for candidates to apply.',
    },
    {
      target: '.sidebar-openjobs-link',
      content: 'View and manage all job positions here.',
    },
    {
      target: '.sidebar-shortlist-link',
      content: 'Shortlist candidates who meet the criteria for interviews.',
    },
    {
      target: '.sidebar-upcoming-link',
      content: 'Check all your upcoming interviews and schedule here.',
    },
    {
      target: '.sidebar-reports-link',
      content: 'Access reports and analytics about your hiring process.',
    },
  ];

  /**
   * Render the Joyride tour component with custom styling
   * The tour is configured to:
   * - Run only when runTour state is true
   * - Show steps continuously
   * - Include a skip button
   * - Use custom styling for a consistent look and feel
   */
  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous={true}
      showSkipButton={true}
      callback={handleTourCallback}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#800080', // Purple
          textColor: '#333',
          arrowColor: '#800080',
          backgroundColor: '#fff',
          borderRadius: '8px',
          width: '300px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          padding: '10px',
        },
        buttonNext: {
          backgroundColor: '#800080',
          color: '#fff',
          borderRadius: '4px',
          padding: '8px 16px',
          fontSize: '14px',
          marginLeft: '8px',
        },
        buttonBack: {
          backgroundColor: '#fff',
          color: '#800080',
          border: '1px solid #800080',
          borderRadius: '4px',
          padding: '8px 16px',
          fontSize: '14px',
        },
        buttonSkip: {
          backgroundColor: 'transparent',
          color: '#800080',
          fontSize: '14px',
        },
        tooltipContainer: {
          padding: '16px',
        },
        tooltipTitle: {
          fontSize: '16px',
          marginBottom: '8px',
          fontWeight: 'bold',
        },
      }}
    />
  );
};

export default TourGuide;
