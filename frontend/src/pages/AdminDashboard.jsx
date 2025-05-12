import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const colors = ["#3b82f6", "#10b981", "#f97316", "#6366f1"];

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    total_applications: 0,
    interviews_today: 0,
    waiting_candidates: 0,
    total_users: 0,
    total_jobs: 0
  });

  const [statusDistribution, setStatusDistribution] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8000/dashboard/metrics').then(res => {
      setMetrics(res.data);
      setStatusDistribution([
        { name: 'Waiting', value: res.data.waiting_candidates },
        { name: 'Other', value: res.data.total_applications - res.data.waiting_candidates }
      ]);
    });
  }, []);

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 to-white min-h-screen">
      {/* Header row */}
      <div className="flex justify-between items-center mb-6 px-4">
        <h1 className="text-5xl font-bold text-indigo-700 px-10">Admin Dashboard</h1>
        <button
          onClick={() => navigate('/admindashboard/users')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl shadow"
        >
          View Users
        </button>
      </div>

      {/* Stat cards */}
      <div className="px-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 space-x-1 space-y-1 mb-4 justify-items-center">
        <StatCard title="Total Applications" value={metrics.total_applications} color="bg-blue-500" />
        <StatCard title="Interviews Today" value={metrics.interviews_today} color="bg-green-500" />
        <StatCard title="Waiting Candidates" value={metrics.waiting_candidates} color="bg-yellow-500" />
      </div>
      <div className="px-40 grid grid-cols-1 sm:grid-cols-2 space-x-1 space-y-1 mb-8 justify-items-center">
        <StatCard title="Total Users" value={metrics.total_users} color="bg-purple-500" />
        <StatCard title="Total Jobs" value={metrics.total_jobs} color="bg-pink-500" />
      </div>

      {/* Graph */}
      <div className="flex justify-center items-center p-6">
        <div className="bg-gray-100 rounded-3xl shadow-lg p-8 w-full max-w-xl">
          <h2 className="text-lg font-semibold mb-6 text-center text-gray-700">Candidate Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className={`w-64 h-32 rounded-2xl shadow-lg p-4 text-white ${color} flex flex-col justify-center items-center`}>
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

export default AdminDashboard;
