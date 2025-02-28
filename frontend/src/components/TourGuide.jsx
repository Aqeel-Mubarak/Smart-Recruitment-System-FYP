import React, { useState, useEffect } from 'react';
import Joyride from 'react-joyride';

const TourGuide = () => {
  // Initialize runTour as false.
  const [runTour, setRunTour] = useState(false);

  // Check localStorage on mount. If the tour has not been shown before, run it.
  useEffect(() => {
    const tourShown = localStorage.getItem('tourShown');
    if (!tourShown) {
      setRunTour(true);
      localStorage.setItem('tourShown', 'true');
    }
  }, []);

  const handleTourCallback = (data) => {
    const { status } = data;
    if (status === 'finished' || status === 'skipped') {
      // Stop the tour once finished or skipped.
      setRunTour(false);
    }
  };

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
