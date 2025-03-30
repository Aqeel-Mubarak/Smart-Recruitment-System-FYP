import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HorizontalHistogram = () => {
  // Data for the horizontal bar chart (histogram)
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

  // Options for the chart (optional)
  const options = {
    indexAxis: 'y', // This makes the bar chart horizontal
    scales: {
      x: {
        beginAtZero: true,
        max:50
      },
      y:{
    
        categoryPercentage: 0.8,
        barPercentage: 0.5,
      }
    },
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'Recruitment Report ',
        font: {
          size: 24, // Increase the size here (default is 16)
          weight: 'bold', // Optional: Make the title bold
          family: 'Arial', // Optional: Set a specific font family
          lineHeight: 1.5, // Optional: Adjust line height
      },
      },
    },
    layout: {
      padding: {
        top: 10, // Add padding to the top
        right: 10,
        bottom: 10,
        left: 10,
      },
    },
  };

  return <Bar className='text-2xl' height={250} width={500} data={data} options={options} />;
};

export default HorizontalHistogram;
