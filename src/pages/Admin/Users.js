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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaUsers className="text-blue-600" />
          إدارة المستخدمين
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الكل</p>
              <p className="text-2xl font-bold text-blue-600">{stats.all}</p>
            </div>
            <FaUsers className="text-3xl text-blue-400" />
          </div>
        </div>
        <div className="card bg-yellow-50 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">معلق</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <FaClock className="text-3xl text-yellow-400" />
          </div>
        </div>
        <div className="card bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">موافق</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <FaUserCheck className="text-3xl text-green-400" />
          </div>
        </div>
        <div className="card bg-red-50 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">مرفوض</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <FaUserTimes className="text-3xl text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن مستخدم..."
              className="input-field pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {status === 'all' && <FaUsers />}
                {status === 'pending' && <FaClock />}
                {status === 'approved' && <FaUserCheck />}
                {status === 'rejected' && <FaUserTimes />}
                {status === 'all' && 'الكل'}
                {status === 'pending' && 'معلق'}
                {status === 'approved' && 'موافق'}
                {status === 'rejected' && 'مرفوض'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-right p-4 font-semibold">الاسم</th>
              <th className="text-right p-4 font-semibold">رقم الجوال</th>
              <th className="text-right p-4 font-semibold">البلد</th>
              <th className="text-right p-4 font-semibold">السنة</th>
              <th className="text-right p-4 font-semibold">الحالة</th>
              <th className="text-right p-4 font-semibold">الدور</th>
              <th className="text-right p-4 font-semibold">الإجراءات</th>
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
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4 font-mono">{user.mobile}</td>
                  <td className="p-4">{user.country}</td>
                  <td className="p-4">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('ar-EG') : '-'}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 w-fit ${user.status === 'approved'
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
                      className="input-field text-sm"
                    >
                      <option value="user">
                        <FaUser /> مستخدم
                      </option>
                      <option value="admin">
                        <FaUserShield /> مسؤول
                      </option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {user.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(user._id)}
                            className="btn-primary text-sm flex items-center gap-1"
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
                            className="btn-secondary text-sm flex items-center gap-1"
                            title="رفض"
                          >
                            <FaTimesCircle />
                            رفض
                          </button>
                        </>
                      )}
                      {user.status === 'rejected' && user.rejectionReason && (
                        <span className="text-sm text-red-600" title={user.rejectionReason}>
                          {user.rejectionReason}
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
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
