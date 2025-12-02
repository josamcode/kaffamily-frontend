import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Loading from '../components/Loading';
import { FaPhone, FaEnvelope, FaUserTie } from 'react-icons/fa';

const Contact = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await api.get('/staff');
      setStaff(response.data.staff || []);
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="جاري تحميل الفريق..." />;
  }

  const apiServerUrl = process.env.REACT_APP_API_SERVER_URL || 'http://localhost:5000';

  return (
    <div className="container mx-auto px-4 py-6 md:py-12">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 text-gray-800">الخدام</h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          تعرف على خدامنا المتميزين
        </p>
      </div>

      {staff.length === 0 ? (
        <div className="text-center py-12 md:py-16">
          <FaUserTie className="text-4xl md:text-6xl text-gray-300 mx-auto mb-3 md:mb-4" />
          <p className="text-gray-600 text-base md:text-xl">لا يوجد خدام حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
          {staff.map((member) => (
            <div
              key={member._id}
              className="bg-white rounded-lg md:rounded-2xl shadow-md md:shadow-lg overflow-hidden transition-all hover:shadow-lg md:hover:shadow-xl hover:-translate-y-0.5 md:hover:-translate-y-1"
            >
              {/* Image Section with Floating Buttons */}
              <div className="relative h-48 md:h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                {member.image ? (
                  <img
                    src={`${apiServerUrl}/${member.image}`}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaUserTie className="text-2xl md:text-6xl text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                {/* Mobile: Floating Icons on Right Bottom with Blur Background */}
                <div className="absolute right-2 bottom-2 flex flex-row gap-2 md:hidden z-10">
                  <a
                    href={`tel:${member.contactNumber}`}
                    className="flex items-center justify-center w-11 h-11 rounded-xl backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/30 shadow-lg transition-all active:scale-95"
                    title={member.contactNumber}
                  >
                    <FaPhone className="text-white text-base drop-shadow-lg" />
                  </a>
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center justify-center w-11 h-11 rounded-xl backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/30 shadow-lg transition-all active:scale-95"
                      title={member.email}
                    >
                      <FaEnvelope className="text-white text-base drop-shadow-lg" />
                    </a>
                  )}
                </div>

                {/* Desktop: Floating Icons on Right Bottom with Blur Background */}
                <div className="absolute right-4 bottom-4 hidden md:flex flex-row gap-3 z-10">
                  <a
                    href={`tel:${member.contactNumber}`}
                    className="flex items-center justify-center w-14 h-14 rounded-2xl backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/30 shadow-xl transition-all hover:scale-110"
                    title={member.contactNumber}
                  >
                    <FaPhone className="text-white text-xl drop-shadow-lg" />
                  </a>
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center justify-center w-14 h-14 rounded-2xl backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/30 shadow-xl transition-all hover:scale-110"
                      title={member.email}
                    >
                      <FaEnvelope className="text-white text-xl drop-shadow-lg" />
                    </a>
                  )}
                </div>
              </div>

              {/* Desktop: Content Section */}
              <div className="block p-2 md:p-6">
                <div className="text-center mb-2">
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-800">{member.name}</h3>
                  <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full">
                    <span className="text-sm font-medium text-gray-700">{member.role}</span>
                  </div>
                </div>

                {/* <div className="space-y-2.5">
                  <a
                    href={`tel:${member.contactNumber}`}
                    className="group flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                      <FaPhone className="text-white text-sm" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-xs text-gray-500 mb-0.5">اتصل بنا</p>
                      <p className="text-sm font-semibold text-gray-800">{member.contactNumber}</p>
                    </div>
                  </a>
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="group flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-700 rounded-lg group-hover:bg-gray-800 transition-colors">
                        <FaEnvelope className="text-white text-sm" />
                      </div>
                      <div className="flex-1 text-right min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">البريد الإلكتروني</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{member.email}</p>
                      </div>
                    </a>
                  )}
                </div> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Contact;

