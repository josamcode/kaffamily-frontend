import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import {
  FaUsers, FaImages, FaBullhorn, FaCog, FaUserTie, FaGamepad,
  FaChartBar, FaBolt, FaCheckCircle, FaTimesCircle, FaClock, FaSyncAlt
} from 'react-icons/fa';
import { renderIcon } from '../../components/IconSelector';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    todayVisits: 0,
    thisWeekVisits: 0,
    thisMonthVisits: 0,
    totalVisits: 0
  });
  const [counts, setCounts] = useState({
    collections: 0,
    games: 0,
    announcements: 0,
    staff: 0,
    totalUsers: 0
  });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, collectionsRes, gamesRes, announcementsRes, staffRes, allUsersRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/users/pending'),
        api.get('/collections'),
        api.get('/games/all'),
        api.get('/announcements/all'),
        api.get('/staff/all'),
        api.get('/users')
      ]);

      setStats(statsRes.data);
      setPendingUsers(usersRes.data.users || []);
      setCounts({
        collections: collectionsRes.data.collections?.length || 0,
        games: gamesRes.data.games?.length || 0,
        announcements: announcementsRes.data.announcements?.length || 0,
        staff: staffRes.data.staff?.length || 0,
        totalUsers: allUsersRes.data.users?.length || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('خطأ في جلب بيانات لوحة التحكم', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.post(`/users/${userId}/approve`);
      showToast('تم الموافقة على المستخدم بنجاح', 'success');
      fetchDashboardData();
    } catch (error) {
      showToast('خطأ: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showToast('يرجى إدخال سبب الرفض', 'warning');
      return;
    }

    try {
      await api.post(`/users/${selectedUser._id}/reject`, { reason: rejectReason });
      showToast('تم رفض المستخدم', 'success');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedUser(null);
      fetchDashboardData();
    } catch (error) {
      showToast('خطأ: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  if (loading) {
    return <Loading fullScreen message="جاري تحميل لوحة التحكم..." />;
  }

  const quickLinks = [
    { to: '/admin/users', icon: FaUsers, label: 'المستخدمون' },
    { to: '/admin/collections', icon: FaImages, label: 'المجموعات' },
    { to: '/admin/announcements', icon: FaBullhorn, label: 'الإعلانات' },
    { to: '/admin/settings', icon: FaCog, label: 'الإعدادات' },
    { to: '/admin/staff', icon: FaUserTie, label: 'الفريق' },
    { to: '/admin/games', icon: FaGamepad, label: 'الألعاب' },
    { to: '/admin/analytics', icon: FaChartBar, label: 'التحليلات' },
    { to: '/admin/quick-actions', icon: FaBolt, label: 'الإجراءات السريعة' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <FaSyncAlt />
          تحديث البيانات
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-600 mb-2">زيارات اليوم</h3>
              <p className="text-3xl font-bold text-gray-800">{stats.todayVisits || 0}</p>
            </div>
            <FaChartBar className="text-3xl text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-600 mb-2">زيارات هذا الأسبوع</h3>
              <p className="text-3xl font-bold text-gray-800">{stats.thisWeekVisits || 0}</p>
            </div>
            <FaChartBar className="text-3xl text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-600 mb-2">زيارات هذا الشهر</h3>
              <p className="text-3xl font-bold text-gray-800">{stats.thisMonthVisits || 0}</p>
            </div>
            <FaChartBar className="text-3xl text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-600 mb-2">إجمالي الزيارات</h3>
              <p className="text-3xl font-bold text-gray-800">{stats.totalVisits || 0}</p>
            </div>
            <FaChartBar className="text-3xl text-gray-400" />
          </div>
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المجموعات</p>
              <p className="text-2xl font-bold text-gray-800">{counts.collections}</p>
            </div>
            <FaImages className="text-2xl text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الألعاب</p>
              <p className="text-2xl font-bold text-gray-800">{counts.games}</p>
            </div>
            <FaGamepad className="text-2xl text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الإعلانات</p>
              <p className="text-2xl font-bold text-gray-800">{counts.announcements}</p>
            </div>
            <FaBullhorn className="text-2xl text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الفريق</p>
              <p className="text-2xl font-bold text-gray-800">{counts.staff}</p>
            </div>
            <FaUserTie className="text-2xl text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المستخدمون</p>
              <p className="text-2xl font-bold text-gray-800">{counts.totalUsers}</p>
            </div>
            <FaUsers className="text-2xl text-gray-400" />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">روابط سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all hover:shadow-sm text-center"
              >
                <IconComponent className="text-3xl mb-2 mx-auto text-gray-600" />
                <h3 className="font-medium text-sm text-gray-700">{link.label}</h3>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Pending Users */}
      {pendingUsers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
              <FaClock className="text-gray-600" />
              طلبات التسجيل المعلقة ({pendingUsers.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-right p-4 font-semibold">الاسم</th>
                  <th className="text-right p-4 font-semibold">رقم الجوال</th>
                  <th className="text-right p-4 font-semibold">البلد</th>
                  <th className="text-right p-4 font-semibold">السنة</th>
                  <th className="text-right p-4 font-semibold">الكلية</th>
                  <th className="text-right p-4 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4 font-mono">{user.mobile}</td>
                    <td className="p-4">{user.country}</td>
                    <td className="p-4">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('ar-EG') : '-'}</td>
                    <td className="p-4">{user.college || '-'}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(user._id)}
                          className="btn-primary text-sm flex items-center gap-1"
                        >
                          <FaCheckCircle />
                          موافقة
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRejectModal(true);
                          }}
                          className="btn-secondary text-sm flex items-center gap-1"
                        >
                          <FaTimesCircle />
                          رفض
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pendingUsers.length === 0 && (
        <div className="card text-center py-12">
          <FaCheckCircle className="text-6xl text-green-300 mx-auto mb-4" />
          <p className="text-gray-600 text-xl font-semibold">لا توجد طلبات تسجيل معلقة</p>
          <p className="text-gray-500 mt-2">جميع الطلبات تم مراجعتها</p>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
          setSelectedUser(null);
        }}
        title="رفض المستخدم"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            المستخدم: <strong>{selectedUser?.name}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium mb-2">سبب الرفض *</label>
            <textarea
              className="input-field"
              rows="4"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="أدخل سبب رفض هذا المستخدم..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={handleReject} className="btn-primary">
              رفض
            </button>
            <button
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
                setSelectedUser(null);
              }}
              className="btn-secondary"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
