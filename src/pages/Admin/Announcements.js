import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  FaBullhorn, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle,
  FaCalendarAlt, FaImage, FaBell, FaBellSlash, FaUpload
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
  const [uploadingImage, setUploadingImage] = useState(false);
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

  const handleImageUpload = async (e, announcementId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post(`/announcements/${announcementId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showToast('تم رفع الصورة بنجاح', 'success');
      fetchAnnouncements();
    } catch (error) {
      showToast('خطأ في رفع الصورة: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setUploadingImage(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleRemoveImage = async (announcementId) => {
    try {
      await api.put(`/announcements/${announcementId}`, { image: '' });
      showToast('تم حذف الصورة بنجاح', 'success');
      fetchAnnouncements();
    } catch (error) {
      showToast('خطأ في حذف الصورة', 'error');
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0 mb-6">
        <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
          <FaBullhorn className="text-blue-600 text-base md:text-2xl" />
          إدارة الإعلانات
        </h1>
        <button onClick={handleCreate} className="w-full md:w-auto btn-primary text-sm md:text-base flex items-center justify-center gap-2 px-3 md:px-4">
          <FaPlus className="text-sm" />
          إعلان جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {announcements.length === 0 ? (
          <div className="col-span-full text-center py-12 md:py-16">
            <FaBullhorn className="text-4xl md:text-6xl text-gray-300 mx-auto mb-3 md:mb-4" />
            <p className="text-gray-600 text-base md:text-xl">لا توجد إعلانات</p>
          </div>
        ) : (
          announcements.map((announcement) => {
            const apiServerUrl = process.env.REACT_APP_API_SERVER_URL || 'http://localhost:5000';
            return (
              <div
                key={announcement._id}
                className={`card p-3 md:p-6 ${!announcement.isActive ? 'opacity-60' : ''}`}
              >
                {/* Image Section - Square */}
                <div className="relative w-full aspect-square mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                  {announcement.image ? (
                    <>
                      <img
                        src={`${apiServerUrl}/${announcement.image}`}
                        alt={announcement.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-1.5 md:gap-2">
                        <label className="cursor-pointer p-1.5 md:p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors">
                          <FaImage className="text-gray-700 text-xs md:text-sm" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, announcement._id)}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </label>
                        <button
                          onClick={() => handleRemoveImage(announcement._id)}
                          className="p-1.5 md:p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
                          title="حذف الصورة"
                        >
                          <FaTimesCircle className="text-red-600 text-xs md:text-sm" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <FaImage className="text-3xl md:text-4xl text-gray-400 mx-auto mb-2" />
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-white hover:bg-gray-50 rounded-lg shadow-sm transition-colors text-xs md:text-sm text-gray-700">
                          <FaImage className="text-xs" />
                          رفع صورة
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, announcement._id)}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base md:text-xl font-semibold truncate">{announcement.title}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs flex items-center gap-1 flex-shrink-0 ${announcement.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {announcement.isActive ? <FaBell className="text-xs" /> : <FaBellSlash className="text-xs" />}
                    <span className="hidden sm:inline">{announcement.isActive ? 'نشط' : 'غير نشط'}</span>
                  </span>
                </div>
                <p className="text-gray-600 mb-3 md:mb-4 line-clamp-3 text-xs md:text-sm">{announcement.content}</p>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mb-3 md:mb-4">
                  <span className="text-xs md:text-sm text-blue-600">
                    {announcement.type === 'meeting' && 'اجتماع'}
                    {announcement.type === 'trip' && 'رحلة'}
                    {announcement.type === 'outing' && 'خروجة'}
                    {announcement.type === 'general' && 'عام'}
                  </span>
                  {announcement.expiresAt && (
                    <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                      <FaCalendarAlt className="text-xs" />
                      <span className="hidden sm:inline">ينتهي: </span>
                      {new Date(announcement.expiresAt).toLocaleDateString('ar-EG')}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="btn-secondary text-xs md:text-sm flex items-center justify-center gap-1 px-3 py-2"
                  >
                    <FaEdit className="text-xs" />
                    تعديل
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActive(announcement)}
                      className={`flex-1 text-xs md:text-sm px-3 py-2 rounded-lg flex items-center justify-center gap-1 ${announcement.isActive
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                    >
                      {announcement.isActive ? <FaBellSlash className="text-xs" /> : <FaBell className="text-xs" />}
                      {announcement.isActive ? 'تعطيل' : 'تفعيل'}
                    </button>
                    <button
                      onClick={() => handleDelete(announcement._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1"
                    >
                      <FaTrash className="text-xs" />
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            );
          })
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
              <option value="outing">خروجة</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">صورة الإعلان</label>
            {formData.image ? (
              <div className="relative">
                <div className="w-full aspect-square max-w-xs mx-auto mb-3 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={`${process.env.REACT_APP_API_SERVER_URL || 'http://localhost:5000'}/${formData.image}`}
                    alt="Announcement"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image: '' })}
                  className="absolute top-0 right-0 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <FaTimesCircle className="text-sm" />
                </button>
                <p className="text-xs text-gray-500 text-center">يمكنك رفع صورة بعد إنشاء الإعلان</p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FaImage className="text-4xl text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">لا توجد صورة</p>
                <p className="text-xs text-gray-500">يمكنك رفع صورة بعد إنشاء الإعلان</p>
              </div>
            )}
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
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

