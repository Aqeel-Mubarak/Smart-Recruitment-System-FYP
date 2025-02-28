import React from 'react';
import Navbarapp from '../components/Navbarapp'; // Assuming the Navbar is correctly implemented
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faFacebookF } from '@fortawesome/free-brands-svg-icons';

const ContactPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbarapp />
      <div className="flex-grow p-10 bg-white-100" style={{ paddingTop: '90px' }}> {/* Adjusting top padding to create space below the navbar */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Name and Email Input Fields */}
          <div>
            <div className="mb-10">
              <label htmlFor="name" className="block text-lg font-bold text-gray-700">Enter Your Name</label>
              <input type="text" id="name" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="Your Name"/>
            </div>
            <div className="mb-6">
              <label htmlFor="email" className="block text-lg font-bold text-gray-700">Enter Your Email</label>
              <input type="email" id="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="you@example.com"/>
            </div>
            {/* Submit Button */}
            <div className="flex justify-center mt-6">
              <button className="bg-black text-white px-6 py-2 rounded-md shadow hover:bg-gray-800">
                Submit
              </button>
            </div>
          </div>
          {/* Feedback Text Area */}
          <div>
            <label htmlFor="feedback" className="block text-lg font-bold text-gray-700">Type Your Feedback/Complaint Here</label>
            <textarea id="feedback" rows="10" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="Please enter your feedback..."></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
