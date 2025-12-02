import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import Loading from '../components/Loading';
import { FaUser, FaSignOutAlt, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendar, FaGraduationCap, FaBuilding } from 'react-icons/fa';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Try /users/me first, fallback to /auth/me
      try {
        const response = await api.get('/users/me');
        setUserData(response.data.user);
      } catch (err) {
        // Fallback to auth/me if users/me doesn't exist
        const response = await api.get('/auth/me');
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      showToast('خطأ في جلب بيانات المستخدم', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      showToast('تم تسجيل الخروج بنجاح', 'success');
    } catch (error) {
      showToast('خطأ في تسجيل الخروج', 'error');
    }
  };

  if (loading) {
    return <Loading fullScreen message="جاري تحميل الملف الشخصي..." />;
  }

  const displayUser = userData || user;

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex items-center gap-4 md:gap-6">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-md flex-shrink-0"
              style={{ backgroundColor: '#1F2937' }}
            >
              {displayUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 truncate">
                {displayUser?.name || 'المستخدم'}
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                {displayUser?.role === 'admin' ? 'مدير' : 'مستخدم'}
              </p>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
            <FaUser className="text-gray-600 text-base md:text-xl" />
            المعلومات الشخصية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="flex items-start gap-2 md:gap-3">
              <FaEnvelope className="text-gray-400 mt-1 text-sm md:text-base flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-500 mb-1">البريد الإلكتروني</p>
                <p className="text-sm md:text-base text-gray-900 font-medium break-all">{displayUser?.email || 'غير متوفر'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 md:gap-3">
              <FaPhone className="text-gray-400 mt-1 text-sm md:text-base flex-shrink-0" />
              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">رقم الجوال</p>
                <p className="text-sm md:text-base text-gray-900 font-medium">{displayUser?.mobile || 'غير متوفر'}</p>
              </div>
            </div>
            {displayUser?.country && (
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">البلد</p>
                  <p className="text-gray-900 font-medium">{displayUser.country}</p>
                </div>
              </div>
            )}
            {displayUser?.year && (
              <div className="flex items-start gap-3">
                <FaCalendar className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">السنة</p>
                  <p className="text-gray-900 font-medium">{displayUser.year}</p>
                </div>
              </div>
            )}
            {displayUser?.college && (
              <div className="flex items-start gap-3">
                <FaGraduationCap className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">الكلية</p>
                  <p className="text-gray-900 font-medium">{displayUser.college}</p>
                </div>
              </div>
            )}
            {displayUser?.university && (
              <div className="flex items-start gap-3">
                <FaBuilding className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">الجامعة</p>
                  <p className="text-gray-900 font-medium">{displayUser.university}</p>
                </div>
              </div>
            )}
            {displayUser?.residence && (
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">السكن</p>
                  <p className="text-gray-900 font-medium">{displayUser.residence}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Status */}
        {displayUser?.status && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">حالة الحساب</h2>
            <div className="flex items-center gap-3">
              <div
                className={`px-4 py-2 rounded-lg font-medium ${
                  displayUser.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : displayUser.status === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {displayUser.status === 'approved'
                  ? 'مقبول'
                  : displayUser.status === 'rejected'
                  ? 'مرفوض'
                  : 'قيد الانتظار'}
              </div>
              {displayUser.status === 'rejected' && displayUser.rejectionReason && (
                <p className="text-sm text-gray-600">
                  السبب: {displayUser.rejectionReason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FaSignOutAlt />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

