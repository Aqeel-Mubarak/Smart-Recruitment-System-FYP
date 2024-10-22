import React from 'react';
import Navbar from '../components/Navbar'; // Assuming the Navbar is correctly implemented
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faFacebookF } from '@fortawesome/free-brands-svg-icons';

const ContactPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
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
            <label htmlFor="feedback" className="block text-lg font-bold text-gray-700">Type Your Feedback Here</label>
            <textarea id="feedback" rows="10" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="Please enter your feedback..."></textarea>
          </div>
        </div>
        {/* Contact Information Section */}
        <div className="mt-4">
          <p className="text-xl mb-4 font-extrabold text-gray-800">Contact Us At</p> {/* Increased font weight to 'extrabold' */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center bg-[#F0CBF0] text-black p-4 rounded-md shadow">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-black" />
              <span>developer@gmail.com</span>
            </div>
            <div className="flex items-center justify-center bg-[#F0CBF0] text-black p-4 rounded-md shadow">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-black" />
              <span>developer@gmail.com</span>
            </div>
            <div className="flex items-center justify-center bg-[#F0CBF0] text-black p-4 rounded-md shadow">
              <FontAwesomeIcon icon={faInstagram} className="mr-2 text-black" />
              <span>developer.instagram</span>
            </div>
            <div className="flex items-center justify-center bg-[#F0CBF0] text-black p-4 rounded-md shadow">
              <FontAwesomeIcon icon={faFacebookF} className="mr-2 text-black" />
              <span>developer.facebook</span>
            </div>
            <div className="flex items-center justify-center bg-[#F0CBF0] text-black p-4 rounded-md shadow">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-black" />
              <span>developer@gmail.com</span>
            </div>
            <div className="flex items-center justify-center bg-[#F0CBF0] text-black p-4 rounded-md shadow">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-black" />
              <span>developer@gmail.com</span>
            </div>
            <div className="flex items-center justify-center bg-[#F0CBF0] text-black p-4 rounded-md shadow">
              <FontAwesomeIcon icon={faInstagram} className="mr-2 text-black" />
              <span>developer.instagram</span>
            </div>
            <div className="flex items-center justify-center bg-[#F0CBF0] text-black p-4 rounded-md shadow">
              <FontAwesomeIcon icon={faFacebookF} className="mr-2 text-black" />
              <span>developer.facebook</span>
            </div>
            <div className="flex items-center justify-center bg-[#F0CBF0] text-black p-4 rounded-md shadow">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-black" />
              <span>developer@gmail.com</span>
            </div>
            <div className="flex items-center justify-center bg-[#F0CBF0] text-black p-4 rounded-md shadow">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-black" />
              <span>developer@gmail.com</span>
            </div>
            <div className="flex items-center justify-center bg-[#F0CBF0] text-black p-4 rounded-md shadow">
              <FontAwesomeIcon icon={faInstagram} className="mr-2 text-black" />
              <span>developer.instagram</span>
            </div>
            <div className="flex items-center justify-center bg-[#F0CBF0] text-black p-4 rounded-md shadow">
              <FontAwesomeIcon icon={faFacebookF} className="mr-2 text-black" />
              <span>developer.facebook</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
