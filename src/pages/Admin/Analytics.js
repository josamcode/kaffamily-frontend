import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import Loading from '../../components/Loading';
import {
  FaChartBar, FaChartLine, FaEye, FaDownload, FaCalendarAlt, FaFilter,
  FaArrowUp, FaArrowDown, FaUsers, FaGlobe, FaImage, FaUser
} from 'react-icons/fa';

const AdminAnalytics = () => {
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState([]);
  const [pageVisits, setPageVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const [dashboardRes, analyticsRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics', { params })
      ]);

      setStats(dashboardRes.data);
      setAnalytics(analyticsRes.data.analytics || []);
      setPageVisits(analyticsRes.data.statistics?.pageVisits || []);
    } catch (error) {
      showToast('خطأ في جلب التحليلات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    fetchData();
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <FaChartBar className="text-blue-600" />
        التحليلات والإحصائيات
      </h1>

      {/* Date Filter */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-gray-600" />
          <h2 className="text-xl font-semibold">فلترة البيانات</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FaCalendarAlt />
              من تاريخ
            </label>
            <input
              type="date"
              className="input-field"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FaCalendarAlt />
              إلى تاريخ
            </label>
            <input
              type="date"
              className="input-field"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <button onClick={handleDateFilter} className="btn-primary flex items-center gap-2">
              <FaFilter />
              تطبيق الفلتر
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-600 mb-2">زيارات اليوم</h3>
              <p className="text-4xl font-bold text-blue-600">{stats.todayVisits || 0}</p>
            </div>
            <FaEye className="text-4xl text-blue-400 opacity-50" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-600 mb-2">زيارات هذا الأسبوع</h3>
              <p className="text-4xl font-bold text-purple-600">{stats.thisWeekVisits || 0}</p>
            </div>
            <FaChartLine className="text-4xl text-purple-400 opacity-50" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-600 mb-2">زيارات هذا الشهر</h3>
              <p className="text-4xl font-bold text-green-600">{stats.thisMonthVisits || 0}</p>
            </div>
            <FaChartBar className="text-4xl text-green-400 opacity-50" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-600 mb-2">إجمالي الزيارات</h3>
              <p className="text-4xl font-bold text-orange-600">{stats.totalVisits || 0}</p>
            </div>
            <FaGlobe className="text-4xl text-orange-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Page Visits Breakdown */}
      {pageVisits.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaChartBar className="text-blue-600" />
            زيارات الصفحات
          </h2>
          <div className="space-y-2">
            {pageVisits.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium flex items-center gap-2">
                  <FaGlobe className="text-gray-400" />
                  {page._id || 'غير محدد'}
                </span>
                <span className="text-blue-600 font-bold flex items-center gap-2">
                  <FaEye />
                  {page.count} زيارة
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FaChartLine className="text-blue-600" />
          النشاط الأخير
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right p-4">التاريخ</th>
                <th className="text-right p-4">النوع</th>
                <th className="text-right p-4">الصفحة</th>
                <th className="text-right p-4">المستخدم</th>
              </tr>
            </thead>
            <tbody>
              {analytics.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-8 text-gray-500">
                    <FaChartBar className="text-4xl mx-auto mb-2 text-gray-300" />
                    لا يوجد نشاط
                  </td>
                </tr>
              ) : (
                analytics.slice(0, 50).map((item) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      {new Date(item.createdAt).toLocaleString('ar-EG')}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {item.visitType === 'page_entry' && 'دخول صفحة'}
                        {item.visitType === 'collection_download' && 'تحميل مجموعة'}
                        {item.visitType === 'image_view' && 'عرض صورة'}
                      </span>
                    </td>
                    <td className="p-4">{item.page || '-'}</td>
                    <td className="p-4">
                      {item.user?.name || 'زائر'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

