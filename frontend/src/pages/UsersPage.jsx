import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UsersPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/dashboard/hr-users')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error("Failed to fetch HR users:", error);
      });
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-5xl font-bold text-center text-indigo-700 mb-6">Users</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{user.name}</h2>
            <p className="text-sm text-gray-600">📧 <strong>Email:</strong> {user.email}</p>
            <p className="text-sm text-gray-600">📱 <strong>Phone:</strong> {user.phone}</p>
            <p className="text-sm text-gray-600">🌍 <strong>Location:</strong> {user.city}, {user.country}</p>
            <p className="text-sm text-gray-600">🏢 <strong>Company:</strong> {user.company || "N/A"}</p>
            <p className="text-sm text-gray-600">👤 <strong>Gender:</strong> {user.gender}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersPage;
