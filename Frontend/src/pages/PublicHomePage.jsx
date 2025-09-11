// src/pages/PublicHomePage.jsx
import { Link } from 'react-router-dom';
import Logo from '../components/Logo'; 
import homePageImage from '../assets/homelogo.jpeg'; // We'll need to add this image
import { useProfile } from '../context/ProfileContext/ProfileContext';
// A simple header for this page
const PublicHeader = () => {
     const { siteSetting } = useProfile();
    return (
     
    <header className="absolute top-0 left-0 w-full p-6 ">
        <div className="container mx-auto ">
            {/* <Logo /> */}
            <img src={`/uploads/siteSettings/${siteSetting.siteLogo}`} alt="Site Logo" className="h-28 w-48 object-contain" />
        </div>
    </header>
)};

const PublicHomePage = () => {
     const { siteSetting } = useProfile();
    return (
        <div className="bg-white min-h-screen flex flex-col justify-center">
            <PublicHeader />
            <main className="container mx-auto px-6 py-16 flex-grow flex items-center mt-10">
                <div className="flex flex-col md:grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Side: Text Content */}
                    <div className="text-center md:text-left order-1">
                        <h1 className="text-2xl mt-8 md:text-3xl font-bold text-teal-500 tracking-wider">
                            EVENTOPS HUB
                        </h1>
                        <p className="mt-4 text-md  text-gray-600 ">
                           {siteSetting.description}
                        </p>
                        <Link
                            to="/login"
                            className="mt-8 inline-block bg-teal-500 text-white  text-sm py-2 px-2  rounded-lg shadow-lg hover:bg-teal-600 transition-transform transform hover:scale-100"
                        >
                            Login / Demo User
                        </Link>
                    </div>

                    {/* Right Side: Image */}
                    <div className="w-full order-2 mt-10 md:mt-0">
                        <img 
                            src={`/uploads/siteSettings/${siteSetting.siteMainImage}`} 
                            alt="Event management illustration" 
                            className="w-3/4 h-auto mx-auto"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PublicHomePage;