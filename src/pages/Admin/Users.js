import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  FaUsers, FaSearch, FaCheckCircle, FaTimesCircle, FaTrash,
  FaUserCheck, FaUserTimes, FaUserShield, FaUser, FaFilter, FaClock
} from 'react-icons/fa';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [filter, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/users', { params });
      setUsers(response.data.users || []);
    } catch (error) {
      showToast('خطأ في جلب المستخدمين', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.post(`/users/${userId}/approve`);
      showToast('تم الموافقة على المستخدم بنجاح', 'success');
      fetchUsers();
    } catch (error) {
      showToast('خطأ في الموافقة: ' + (error.response?.data?.message || error.message), 'error');
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
      fetchUsers();
    } catch (error) {
      showToast('خطأ في الرفض: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      showToast('تم تحديث دور المستخدم', 'success');
      fetchUsers();
    } catch (error) {
      showToast('خطأ في تحديث الدور', 'error');
    }
  };

  const handleDelete = (userId) => {
    setUserToDelete(userId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/users/${userToDelete}`);
      showToast('تم حذف المستخدم بنجاح', 'success');
      fetchUsers();
    } catch (error) {
      showToast('خطأ في الحذف', 'error');
    } finally {
      setUserToDelete(null);
    }
  };

  if (loading) return <Loading fullScreen />;

  const filteredUsers = users.filter(user => {
    if (filter !== 'all' && user.status !== filter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        user.name?.toLowerCase().includes(search) ||
        user.mobile?.includes(search) ||
        user.country?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const stats = {
    all: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    rejected: users.filter(u => u.status === 'rejected').length
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
          <FaUsers className="text-blue-600 text-lg md:text-3xl" />
          <span className="hidden sm:inline">إدارة المستخدمين</span>
          <span className="sm:hidden">المستخدمون</span>
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
        <div className="card bg-blue-50 border-l-4 border-blue-500 p-3 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600">الكل</p>
              <p className="text-lg md:text-2xl font-bold text-blue-600">{stats.all}</p>
            </div>
            <FaUsers className="text-2xl md:text-3xl text-blue-400" />
          </div>
        </div>
        <div className="card bg-yellow-50 border-l-4 border-yellow-500 p-3 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600">معلق</p>
              <p className="text-lg md:text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <FaClock className="text-2xl md:text-3xl text-yellow-400" />
          </div>
        </div>
        <div className="card bg-green-50 border-l-4 border-green-500 p-3 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600">موافق</p>
              <p className="text-lg md:text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <FaUserCheck className="text-2xl md:text-3xl text-green-400" />
          </div>
        </div>
        <div className="card bg-red-50 border-l-4 border-red-500 p-3 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600">مرفوض</p>
              <p className="text-lg md:text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <FaUserTimes className="text-2xl md:text-3xl text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4 md:mb-6 p-3 md:p-6">
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="ابحث عن مستخدم..."
              className="input-field pr-10 text-sm md:text-base py-2 md:py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 md:flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-2 md:px-4 md:py-2 rounded-lg transition-colors flex items-center justify-center gap-1 md:gap-2 text-xs md:text-base ${filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {status === 'all' && <FaUsers className="text-sm" />}
                {status === 'pending' && <FaClock className="text-sm" />}
                {status === 'approved' && <FaUserCheck className="text-sm" />}
                {status === 'rejected' && <FaUserTimes className="text-sm" />}
                <span>
                  {status === 'all' && 'الكل'}
                  {status === 'pending' && 'معلق'}
                  {status === 'approved' && 'موافق'}
                  {status === 'rejected' && 'مرفوض'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table - Desktop */}
      <div className="card overflow-x-auto hidden lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-right p-4 font-semibold text-sm">الاسم</th>
              <th className="text-right p-4 font-semibold text-sm">رقم الجوال</th>
              <th className="text-right p-4 font-semibold text-sm">البلد</th>
              <th className="text-right p-4 font-semibold text-sm">السنة</th>
              <th className="text-right p-4 font-semibold text-sm">الحالة</th>
              <th className="text-right p-4 font-semibold text-sm">الدور</th>
              <th className="text-right p-4 font-semibold text-sm">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-8 text-gray-500">
                  <FaUsers className="text-4xl mx-auto mb-2 text-gray-300" />
                  لا يوجد مستخدمون
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-sm">{user.name}</td>
                  <td className="p-4 font-mono text-sm">{user.mobile}</td>
                  <td className="p-4 text-sm">{user.country}</td>
                  <td className="p-4 text-sm">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('ar-EG') : '-'}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${user.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : user.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {user.status === 'approved' && <FaCheckCircle />}
                      {user.status === 'pending' && <FaClock />}
                      {user.status === 'rejected' && <FaTimesCircle />}
                      {user.status === 'approved' && 'موافق'}
                      {user.status === 'pending' && 'معلق'}
                      {user.status === 'rejected' && 'مرفوض'}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="input-field text-sm py-1 px-2"
                    >
                      <option value="user">مستخدم</option>
                      <option value="admin">مسؤول</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      {user.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(user._id)}
                            className="btn-primary text-xs flex items-center gap-1 px-2 py-1"
                            title="موافقة"
                          >
                            <FaCheckCircle />
                            موافقة
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowRejectModal(true);
                            }}
                            className="btn-secondary text-xs flex items-center gap-1 px-2 py-1"
                            title="رفض"
                          >
                            <FaTimesCircle />
                            رفض
                          </button>
                        </>
                      )}
                      {user.status === 'rejected' && user.rejectionReason && (
                        <span className="text-xs text-red-600" title={user.rejectionReason}>
                          {user.rejectionReason}
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                        title="حذف"
                      >
                        <FaTrash />
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Users Cards - Mobile */}
      <div className="lg:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="card text-center py-12">
            <FaUsers className="text-4xl mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500">لا يوجد مستخدمون</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user._id} className="mobile-card">
              <div className="mb-3 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 text-base">{user.name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${user.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : user.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {user.status === 'approved' && <FaCheckCircle />}
                    {user.status === 'pending' && <FaClock />}
                    {user.status === 'rejected' && <FaTimesCircle />}
                    {user.status === 'approved' && 'موافق'}
                    {user.status === 'pending' && 'معلق'}
                    {user.status === 'rejected' && 'مرفوض'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">رقم الجوال:</span>
                  <span className="text-gray-900 font-mono">{user.mobile}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">البلد:</span>
                  <span className="text-gray-900">{user.country}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">السنة:</span>
                  <span className="text-gray-900">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('ar-EG') : '-'}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600 font-medium">الدور:</span>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="input-field text-xs py-1 px-2 w-28"
                  >
                    <option value="user">مستخدم</option>
                    <option value="admin">مسؤول</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                {user.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(user._id)}
                      className="flex-1 btn-primary text-xs flex items-center justify-center gap-1 py-2"
                    >
                      <FaCheckCircle />
                      موافقة
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowRejectModal(true);
                      }}
                      className="flex-1 btn-secondary text-xs flex items-center justify-center gap-1 py-2"
                    >
                      <FaTimesCircle />
                      رفض
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(user._id)}
                  className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1 px-3 py-2 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  <FaTrash />
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>

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
            <button onClick={handleReject} className="btn-primary flex items-center gap-2">
              <FaTimesCircle />
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

      {/* Delete User Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="حذف المستخدم"
        message="هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
      />
    </div>
  );
};

export default AdminUsers;
