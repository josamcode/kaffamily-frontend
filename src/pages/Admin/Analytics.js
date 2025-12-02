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
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-xl md:text-3xl font-bold mb-6 md:mb-8 flex items-center gap-2">
        <FaChartBar className="text-blue-600 text-base md:text-2xl" />
        التحليلات والإحصائيات
      </h1>

      {/* Date Filter */}
      <div className="card mb-4 md:mb-6 p-4 md:p-6">
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <FaFilter className="text-gray-600 text-sm md:text-base" />
          <h2 className="text-base md:text-xl font-semibold">فلترة البيانات</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1">
            <label className="flex items-center gap-2 text-xs md:text-sm font-medium mb-2">
              <FaCalendarAlt className="text-xs" />
              من تاريخ
            </label>
            <input
              type="date"
              className="input-field text-sm"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>
          <div className="flex-1">
            <label className="flex items-center gap-2 text-xs md:text-sm font-medium mb-2">
              <FaCalendarAlt className="text-xs" />
              إلى تاريخ
            </label>
            <input
              type="date"
              className="input-field text-sm"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
          <div className="flex items-end w-full md:w-auto">
            <button onClick={handleDateFilter} className="btn-primary text-sm md:text-base w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2">
              <FaFilter className="text-xs" />
              تطبيق الفلتر
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <div className="card p-3 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">زيارات اليوم</h3>
              <p className="text-2xl md:text-4xl font-bold text-blue-600">{stats.todayVisits || 0}</p>
            </div>
            <FaEye className="hidden md:block text-4xl text-blue-400 opacity-50" />
          </div>
        </div>
        <div className="card p-3 md:p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">هذا الأسبوع</h3>
              <p className="text-2xl md:text-4xl font-bold text-purple-600">{stats.thisWeekVisits || 0}</p>
            </div>
            <FaChartLine className="hidden md:block text-4xl text-purple-400 opacity-50" />
          </div>
        </div>
        <div className="card p-3 md:p-6 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">هذا الشهر</h3>
              <p className="text-2xl md:text-4xl font-bold text-green-600">{stats.thisMonthVisits || 0}</p>
            </div>
            <FaChartBar className="hidden md:block text-4xl text-green-400 opacity-50" />
          </div>
        </div>
        <div className="card p-3 md:p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">الإجمالي</h3>
              <p className="text-2xl md:text-4xl font-bold text-orange-600">{stats.totalVisits || 0}</p>
            </div>
            <FaGlobe className="hidden md:block text-4xl text-orange-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Page Visits Breakdown */}
      {pageVisits.length > 0 && (
        <div className="card p-4 md:p-6 mb-4 md:mb-6">
          <h2 className="text-base md:text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2">
            <FaChartBar className="text-blue-600 text-sm md:text-xl" />
            زيارات الصفحات
          </h2>
          <div className="space-y-2">
            {pageVisits.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-xs md:text-base flex items-center gap-2 truncate">
                  <FaGlobe className="text-gray-400 text-xs md:text-base flex-shrink-0" />
                  <span className="truncate">{page._id || 'غير محدد'}</span>
                </span>
                <span className="text-blue-600 font-bold text-xs md:text-base flex items-center gap-1 md:gap-2 flex-shrink-0">
                  <FaEye className="text-xs" />
                  {page.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="card p-4 md:p-6">
        <h2 className="text-base md:text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2">
          <FaChartLine className="text-blue-600 text-sm md:text-xl" />
          النشاط الأخير
        </h2>

        {/* Desktop: Table */}
        <div className="hidden md:block overflow-x-auto">
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

        {/* Mobile: Cards */}
        <div className="md:hidden space-y-3">
          {analytics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaChartBar className="text-3xl mx-auto mb-2 text-gray-300" />
              <p className="text-sm">لا يوجد نشاط</p>
            </div>
          ) : (
            analytics.slice(0, 50).map((item) => (
              <div key={item._id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {item.visitType === 'page_entry' && 'دخول صفحة'}
                    {item.visitType === 'collection_download' && 'تحميل'}
                    {item.visitType === 'image_view' && 'عرض صورة'}
                  </span>
                  <FaUser className="text-gray-400 text-xs flex-shrink-0" />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="truncate">{item.page || '-'}</span>
                  <span className="text-gray-500 flex-shrink-0 mr-2">{item.user?.name || 'زائر'}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleString('ar-EG', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

