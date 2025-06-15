import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary components for Chart.js
// These components are required for the horizontal bar chart to function properly
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// HorizontalHistogram component - Renders a horizontal bar chart using Chart.js
const HorizontalHistogram = () => {
  // Define the chart data structure
  // labels: Categories to be displayed on the y-axis
  // datasets: Contains the actual data points and styling information
  const data = {
    labels: ['Category A', 'Category B', 'Category C', 'Category D'],
    datasets: [
      {
        label: 'Values',
        data: [23, 17, 35, 29], // Values for each category
        backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0'], // Custom bar colors
        borderColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0'], // Border color same as bar color
        borderWidth: 10, // Set large border
      },
    ],
  };

  // Chart configuration options
  // These options control the appearance and behavior of the chart
  const options = {
    indexAxis: 'y', // Makes the bar chart horizontal instead of vertical
    scales: {
      x: {
        beginAtZero: true, // Start x-axis from 0
        max:50 // Set maximum value on x-axis
      },
      y:{
        // Configure y-axis appearance
        categoryPercentage: 0.8, // Controls the width of the bars relative to the available space
        barPercentage: 0.5, // Controls the spacing between bars
      }
    },
    plugins: {
      legend: {
        display: true, // Show the legend
      },
      title: {
        display: true,
        text: 'Recruitment Report ',
        font: {
          size: 24, // Title font size
          weight: 'bold', // Make title bold
          family: 'Arial', // Font family
          lineHeight: 1.5, // Line height for better readability
      },
      },
    },
    layout: {
      padding: {
        // Add padding around the chart for better visual appearance
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
      },
    },
  };

  // Render the Bar component with specified height, width, data, and options
  return <Bar className='text-2xl' height={250} width={500} data={data} options={options} />;
};

export default HorizontalHistogram;
