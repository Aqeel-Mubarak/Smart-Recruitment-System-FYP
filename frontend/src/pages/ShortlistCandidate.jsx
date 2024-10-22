import React from 'react';
import Navbarapp from '../components/Navbarapp';
import Sidebar from '../components/Sidebar';
import  useNavigate  from 'react-router-dom';

const ShortlistCandidate = () => {
    const navigate = useNavigate();

    function handleSubmit() {
        alert("Invitation sent")
        navigate('/home');
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Navbar */}
            <Navbarapp />

            <div className="flex flex-col md:flex-row" style={{ marginTop: '4rem' }}>
                {/* Sidebar */}
                <Sidebar />

                <div className="md:ml-8 p-4 md:p-8 flex-grow bg-gray-100">
                    <h1 className="text-3xl md:text-4xl text-center mb-6 md:mb-8 font-bold" style={{ color: '#800080' }}>
                        ShortList Candidates
                    </h1>

                    <div className="flex mb-6 md:mb-8 justify-center">
                        <input
                            type="text"
                            placeholder="Search Candidates"
                            className="w-full max-w-lg p-3 border-2 rounded-lg"
                            style={{ borderColor: '#AB30AB' }}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="bg-purp text-white" style={{ backgroundColor: '#800080' }}>
                                    <th className="border p-3 text-left"></th>
                                    <th className="border p-3 text-left">Name</th>
                                    <th className="border p-3 text-left">Experience</th>
                                    <th className="border p-3 text-left">CGPA</th>
                                    <th className="border p-3 text-left">AI Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { name: "Muhammad Aqeel", experience: "2 yrs", cgpa: "3.4", aiScore: "90.7" },
                                    { name: "Talha Rashid", experience: "5 yrs", cgpa: "3.5", aiScore: "93.6" },
                                    { name: "Ubaidullah", experience: "14 yrs", cgpa: "3.9", aiScore: "99.7" },
                                    { name: "Najam ul Hassan", experience: "4 yrs", cgpa: "3.7", aiScore: "94.3" },
                                    { name: "Muhammad Aqeel", experience: "2 yrs", cgpa: "3.4", aiScore: "90.7" },
                                    { name: "Talha Rashid", experience: "5 yrs", cgpa: "3.5", aiScore: "93.6" },
                                    { name: "Ubaidullah", experience: "14 yrs", cgpa: "3.9", aiScore: "99.7" },
                                    { name: "Najam ul Hassan", experience: "4 yrs", cgpa: "3.7", aiScore: "94.3" },
                                ].map((candidate, index) => (
                                    <tr key={index} className="bg-gray-700 text-white">
                                        <td className="p-3 text-center">
                                            <input type="checkbox" className="form-checkbox h-5 w-5 text-green-600" />
                                        </td>
                                        <td className="border p-3">{candidate.name}</td>
                                        <td className="border p-3">{candidate.experience}</td>
                                        <td className="border p-3">{candidate.cgpa}</td>
                                        <td className="border p-3">{candidate.aiScore}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-center mt-8">
                        <button
                            className="bg-black text-white px-12 md:px-24 py-3 rounded-lg transition"
                            onClick={handleSubmit}
                        >
                            Schedule Interview
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShortlistCandidate;
