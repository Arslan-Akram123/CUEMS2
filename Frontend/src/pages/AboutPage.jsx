// src/pages/AboutPage.jsx
import UserLayout from '../components/UserLayout';

const AboutPage = () => {
    return (
        <UserLayout>
            <div className="container mx-auto px-4 py-16 bg-white">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">About EventOps Hub</h1>
                    <div className="text-lg text-gray-700 space-y-6 leading-relaxed">
                        <p>
                            EventOps Hub was born from a simple idea: to create a single, unified platform that bridges the gap between university administrations and the student body. We noticed that students often missed out on valuable events and opportunities simply because information was scattered across various portals, websites, and social media pages.
                        </p>
                        <p>
                            Our mission is to centralize all university-related activities, from academic workshops and tech festivals to cultural nights and sports events. By providing a clean, searchable, and easy-to-use interface, we empower students to discover new interests, connect with their peers, and make the most of their university experience.
                        </p>
                        <p>
                            For administrators, we provide a powerful, all-in-one backend system to manage events, handle bookings, communicate with attendees, and gain insights into event performance. Our goal is to simplify logistics and operations, allowing event organizers to focus on what truly matters: creating memorable and impactful experiences.
                        </p>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

export default AboutPage;