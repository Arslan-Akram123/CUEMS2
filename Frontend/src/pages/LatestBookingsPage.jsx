// src/pages/LatestBookingsPage.jsx
import { Link } from 'react-router-dom';
import UserLayout from '../components/UserLayout';
import { FiSearch, FiCalendar } from 'react-icons/fi';
import { useState, useEffect } from 'react';


const LatestBookingsPage = () => {
    const [mockLatestBookings, setMockLatestBookings] = useState([]);
    
        useEffect(()=>{
            fetch('http://localhost:8001/eventsbook/getAllUserBookings', { credentials: 'include' })
                .then(res => res.json())
                .then(data => setMockLatestBookings(data))
                .catch(err => console.error(err));
        },[])
    return (
        <UserLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-2 justify-between items-center mb-4 border-b pb-4">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
                           <FiCalendar /> Recent Bookings
                        </h1>
                         {/* <div className="relative w-full md:w-1/3">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search bookings..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div> */}
                    </div>

                    <div className="overflow-x-auto">
                        {
                            (() => {
                                const filtered = mockLatestBookings.filter(b => b.userRead === true && b.status !== 'pending');
                                return filtered.length > 0 ? (
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Last Date</th>
                                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                            {filtered.map((booking) => (
                                                <tr key={booking._id}>
                                                    <td className="py-4 px-4 font-semibold">
                                                        <Link to={`/events/${booking.event._id}`} className="text-teal-600 hover:underline">
                                                            {booking.event.name}
                                                        </Link>
                                                    </td>
                                                    <td className="py-4 px-4">{booking.user.fullName}</td>
                                                    <td className="py-4 px-4">{booking.event.endDate? new Date(booking.event.endDate).toLocaleDateString() : new Date(booking.event.startDate).toLocaleDateString()}</td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-center py-16">
                                        <p className="text-red-500 font-semibold">No Booking Data Available</p>
                                    </div>
                                );
                            })()
                        }
                    </div>
                    
                    {/* Pagination */}
                    {/* <div className="flex justify-between items-center mt-4 text-sm">
                        <p className="text-gray-600">Showing 1 to {mockLatestBookings.length} of {mockLatestBookings.length} entries</p>
                         <div className="flex items-center">
                            <button className="px-3 py-1 border rounded-l-md bg-white hover:bg-gray-50">«</button>
                            <button className="px-3 py-1 border-t border-b bg-teal-500 text-white">1</button>
                            <button className="px-3 py-1 border rounded-r-md bg-white hover:bg-gray-50">»</button>
                        </div>
                    </div> */}

                </div>
            </div>
        </UserLayout>
    );
};

export default LatestBookingsPage;