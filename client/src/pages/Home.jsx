import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { 
  FaUserMd, 
  FaAmbulance, 
  FaTint, 
  FaFlask, 
  FaCalendarCheck,
  FaArrowRight,
  FaStethoscope,
  FaHeartbeat,
  FaHospital,
  FaUserPlus,
  FaSignInAlt
} from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const heroSlides = [
    {
      id: 1,
      title: "Welcome to Modern Healthcare",
      subtitle: isLoggedIn ? "Access Your Health Dashboard" : "Join Us Today",
      description: isLoggedIn 
        ? "Manage your appointments, view test results, and access all services in one place"
        : "Create your account and access comprehensive healthcare services at your fingertips",
      buttonText: isLoggedIn ? "Go to Dashboard" : "Sign Up Now",
      buttonAction: () => navigate(isLoggedIn ? '/account' : '/signup'),
      icon: isLoggedIn ? FaHospital : FaUserPlus,
      gradient: "from-blue-600 to-cyan-500",
      image: "hero-img01.png"
    },
    {
      id: 2,
      title: isLoggedIn ? "Book Your Appointment" : "Already Have an Account?",
      subtitle: isLoggedIn ? "Connect with Expert Doctors" : "Sign In to Continue",
      description: isLoggedIn
        ? "Schedule appointments with our qualified doctors and get expert medical consultation"
        : "Log in to your account to book appointments, request services, and manage your health",
      buttonText: isLoggedIn ? "Book Appointment" : "Login Now",
      buttonAction: () => navigate(isLoggedIn ? '/account' : '/login'),
      icon: isLoggedIn ? FaUserMd : FaSignInAlt,
      gradient: "from-purple-600 to-pink-500",
      image: "hero-img02.png"
    },
    {
      id: 3,
      title: "Emergency Ambulance Service",
      subtitle: "24/7 Emergency Response",
      description: "Request ambulance service anytime, anywhere. Our team is ready to respond to your emergency needs",
      buttonText: isLoggedIn ? "Request Ambulance" : "Sign Up to Request",
      buttonAction: () => navigate(isLoggedIn ? '/account' : '/signup'),
      icon: FaAmbulance,
      gradient: "from-red-600 to-orange-500",
      image: "hero-img03.png"
    },
    {
      id: 4,
      title: "Blood Request & Donation",
      subtitle: "Save Lives, Donate Blood",
      description: "Request blood or register as a donor. Be a hero and help save lives in your community",
      buttonText: isLoggedIn ? "Request Blood" : "Join as Donor",
      buttonAction: () => navigate(isLoggedIn ? '/account' : '/signup'),
      icon: FaTint,
      gradient: "from-pink-600 to-red-500",
      image: "doctor-img01.png"
    },
    {
      id: 5,
      title: "Medical Test Results",
      subtitle: "Quick & Secure Access",
      description: "Get your laboratory test results online. Fast, secure, and accessible from anywhere",
      buttonText: isLoggedIn ? "View Results" : "Sign Up for Access",
      buttonAction: () => navigate(isLoggedIn ? '/account' : '/signup'),
      icon: FaFlask,
      gradient: "from-green-600 to-teal-500",
      image: "doctor-img02.png"
    }
  ];

  const services = [
    {
      icon: FaUserMd,
      title: "Book Doctor Appointment",
      description: "Schedule appointments with qualified doctors across various specializations",
      color: "blue",
      link: isLoggedIn ? '/account' : '/login'
    },
    {
      icon: FaAmbulance,
      title: "Emergency Ambulance",
      description: "24/7 ambulance service for medical emergencies with trained staff",
      color: "red",
      link: isLoggedIn ? '/account' : '/login'
    },
    {
      icon: FaTint,
      title: "Blood Request",
      description: "Find blood donors or donate blood to save lives in your community",
      color: "pink",
      link: isLoggedIn ? '/account' : '/login'
    },
    {
      icon: FaFlask,
      title: "Test Results",
      description: "Access your laboratory test results online securely and conveniently",
      color: "green",
      link: isLoggedIn ? '/account' : '/login'
    }
  ];

  const features = [
    {
      icon: FaCalendarCheck,
      title: "Easy Scheduling",
      description: "Book appointments with just a few clicks"
    },
    {
      icon: FaStethoscope,
      title: "Expert Doctors",
      description: "Qualified and experienced medical professionals"
    },
    {
      icon: FaHeartbeat,
      title: "24/7 Support",
      description: "Round-the-clock emergency services"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Slider Section */}
      <section className="relative">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          effect="fade"
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          className="h-[600px] md:h-[700px]"
        >
          {heroSlides.map((slide) => {
            const Icon = slide.icon;
            return (
              <SwiperSlide key={slide.id}>
                <div className={`relative h-full bg-gradient-to-r ${slide.gradient} overflow-hidden`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                      backgroundSize: '50px 50px'
                    }}></div>
                  </div>

                  <div className="container mx-auto h-full">
                    <div className="grid md:grid-cols-2 gap-8 items-center h-full py-12 px-6">
                      {/* Left Content */}
                      <div className="text-white space-y-6 z-10">
                        <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                          <Icon className="text-3xl" />
                          <span className="font-semibold text-lg">{slide.subtitle}</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                          {slide.title}
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                          {slide.description}
                        </p>

                        <button
                          onClick={slide.buttonAction}
                          className="group inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-2xl hover:shadow-white/50"
                        >
                          {slide.buttonText}
                          <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </button>

                        {!isLoggedIn && slide.id <= 2 && (
                          <div className="pt-4">
                            <p className="text-white/80">
                              {slide.id === 1 ? (
                                <>Already have an account? <button onClick={() => navigate('/login')} className="underline font-semibold hover:text-white">Login here</button></>
                              ) : (
                                <>New to our platform? <button onClick={() => navigate('/signup')} className="underline font-semibold hover:text-white">Sign up here</button></>
                              )}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right Image */}
                      <div className="hidden md:flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl"></div>
                          <img 
                            src={`/src/assets/images/${slide.image}`}
                            alt={slide.title}
                            className="relative w-full max-w-md rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-headingColor mb-4">
              Our Services
            </h2>
            <p className="text-xl text-textColor max-w-2xl mx-auto">
              Comprehensive healthcare services designed to meet all your medical needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  onClick={() => navigate(service.link)}
                  className="group cursor-pointer bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${getColorClasses(service.color)} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="text-4xl text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-headingColor mb-4 group-hover:text-primaryColor transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-textColor leading-relaxed mb-4">
                    {service.description}
                  </p>

                  <div className="flex items-center gap-2 text-primaryColor font-semibold group-hover:gap-4 transition-all">
                    Learn More <FaArrowRight />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primaryColor to-irisBlueColor">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Experience healthcare excellence with modern technology and compassionate care
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="text-4xl text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-white/80 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      {!isLoggedIn && (
        <section className="py-20 px-6 bg-gradient-to-r from-purpleColor to-primaryColor">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied patients who trust us with their healthcare needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center justify-center gap-3 bg-white text-primaryColor px-10 py-5 rounded-full text-lg font-bold hover:scale-105 transform transition-all duration-300 shadow-2xl"
              >
                <FaUserPlus className="text-2xl" />
                Create Account
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-white hover:text-primaryColor transform transition-all duration-300"
              >
                <FaSignInAlt className="text-2xl" />
                Login
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: "Expert Doctors" },
              { number: "10K+", label: "Happy Patients" },
              { number: "24/7", label: "Emergency Service" },
              { number: "15+", label: "Years Experience" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-primaryColor mb-2">
                  {stat.number}
                </div>
                <div className="text-textColor font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
