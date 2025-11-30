import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  FaBullhorn, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle,
  FaCalendarAlt, FaImage, FaBell, FaBellSlash
} from 'react-icons/fa';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    image: '',
    isActive: true,
    expiresAt: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/announcements/all');
      setAnnouncements(response.data.announcements || []);
    } catch (error) {
      showToast('خطأ في جلب الإعلانات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      type: 'general',
      image: '',
      isActive: true,
      expiresAt: ''
    });
    setShowModal(true);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      image: announcement.image || '',
      isActive: announcement.isActive,
      expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        await api.put(`/announcements/${editingAnnouncement._id}`, formData);
        showToast('تم تحديث الإعلان بنجاح', 'success');
      } else {
        await api.post('/announcements', formData);
        showToast('تم إنشاء الإعلان بنجاح', 'success');
      }
      setShowModal(false);
      fetchAnnouncements();
    } catch (error) {
      showToast('خطأ: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDelete = (id) => {
    setAnnouncementToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/announcements/${announcementToDelete}`);
      showToast('تم حذف الإعلان بنجاح', 'success');
      fetchAnnouncements();
    } catch (error) {
      showToast('خطأ في الحذف', 'error');
    } finally {
      setAnnouncementToDelete(null);
    }
  };

  const toggleActive = async (announcement) => {
    try {
      await api.put(`/announcements/${announcement._id}`, {
        isActive: !announcement.isActive
      });
      showToast('تم تحديث حالة الإعلان', 'success');
      fetchAnnouncements();
    } catch (error) {
      showToast('خطأ في التحديث', 'error');
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaBullhorn className="text-blue-600" />
          إدارة الإعلانات
        </h1>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <FaPlus />
          إعلان جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {announcements.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <FaBullhorn className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-xl">لا توجد إعلانات</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement._id}
              className={`card ${!announcement.isActive ? 'opacity-60' : ''}`}
            >
              {announcement.image && (
                <img
                  src={`${process.env.REACT_APP_API_SERVER_URL || 'http://localhost:5000'}${announcement.image}`}
                  alt={announcement.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">{announcement.title}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${announcement.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {announcement.isActive ? <FaBell /> : <FaBellSlash />}
                  {announcement.isActive ? 'نشط' : 'غير نشط'}
                </span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">{announcement.content}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-blue-600">
                  {announcement.type === 'meeting' && 'اجتماع'}
                  {announcement.type === 'trip' && 'رحلة'}
                  {announcement.type === 'outing' && 'نزهة'}
                  {announcement.type === 'general' && 'عام'}
                </span>
                {announcement.expiresAt && (
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <FaCalendarAlt />
                    ينتهي: {new Date(announcement.expiresAt).toLocaleDateString('ar-EG')}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(announcement)}
                  className="btn-secondary flex-1 text-sm flex items-center justify-center gap-1"
                >
                  <FaEdit />
                  تعديل
                </button>
                <button
                  onClick={() => toggleActive(announcement)}
                  className={`text-sm px-4 py-2 rounded-lg flex items-center gap-1 ${announcement.isActive
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                >
                  {announcement.isActive ? <FaBellSlash /> : <FaBell />}
                  {announcement.isActive ? 'تعطيل' : 'تفعيل'}
                </button>
                <button
                  onClick={() => handleDelete(announcement._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                >
                  <FaTrash />
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingAnnouncement(null);
        }}
        title={editingAnnouncement ? 'تعديل الإعلان' : 'إعلان جديد'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">العنوان *</label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">المحتوى *</label>
            <textarea
              required
              className="input-field"
              rows="5"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">النوع</label>
            <select
              className="input-field"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="general">عام</option>
              <option value="meeting">اجتماع</option>
              <option value="trip">رحلة</option>
              <option value="outing">نزهة</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">صورة (URL)</label>
            <input
              type="text"
              className="input-field"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FaCalendarAlt />
              تاريخ الانتهاء
            </label>
            <input
              type="date"
              className="input-field"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label htmlFor="isActive" className="text-sm">
              نشط
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="submit" className="btn-primary">
              {editingAnnouncement ? 'تحديث' : 'إنشاء'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingAnnouncement(null);
              }}
              className="btn-secondary"
            >
              إلغاء
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setAnnouncementToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="حذف الإعلان"
        message="هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
      />
    </div>
  );
};

export default AdminAnnouncements;

