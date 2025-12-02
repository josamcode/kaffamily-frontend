import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  FaUserTie, FaPlus, FaEdit, FaTrash, FaPhone, FaEnvelope, FaUsers, FaImage, FaUpload, FaTimes
} from 'react-icons/fa';

const AdminStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    contactNumber: '',
    email: '',
    image: '',
    order: 0,
    isActive: true
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/staff/all');
      setStaff(response.data.staff || []);
    } catch (error) {
      showToast('خطأ في جلب أعضاء الفريق', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      role: '',
      contactNumber: '',
      email: '',
      image: '',
      order: 0,
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      role: member.role,
      contactNumber: member.contactNumber,
      email: member.email || '',
      image: member.image || '',
      order: member.order || 0,
      isActive: member.isActive
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e, staffId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post(`/staff/${staffId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showToast('تم رفع الصورة بنجاح', 'success');
      fetchStaff();
    } catch (error) {
      showToast('خطأ في رفع الصورة: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setUploadingImage(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleRemoveImage = async (staffId) => {
    try {
      await api.put(`/staff/${staffId}`, { image: '' });
      showToast('تم حذف الصورة بنجاح', 'success');
      fetchStaff();
    } catch (error) {
      showToast('خطأ في حذف الصورة', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await api.put(`/staff/${editingStaff._id}`, formData);
        showToast('تم تحديث عضو الفريق بنجاح', 'success');
      } else {
        await api.post('/staff', formData);
        showToast('تم إضافة عضو الفريق بنجاح', 'success');
      }
      setShowModal(false);
      fetchStaff();
    } catch (error) {
      showToast('خطأ: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDelete = (id) => {
    setStaffToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/staff/${staffToDelete}`);
      showToast('تم حذف عضو الفريق بنجاح', 'success');
      fetchStaff();
    } catch (error) {
      showToast('خطأ في الحذف', 'error');
    } finally {
      setStaffToDelete(null);
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0 mb-4 md:mb-6">
        <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
          <FaUserTie className="text-blue-600 text-base md:text-2xl" />
          إدارة الفريق
        </h1>
        <button onClick={handleCreate} className="w-full md:w-auto btn-primary text-sm md:text-base flex items-center justify-center gap-2 px-3 md:px-4">
          <FaPlus className="text-sm" />
          <span className="hidden sm:inline">إضافة عضو جديد</span>
          <span className="sm:hidden">إضافة عضو</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {staff.length === 0 ? (
          <div className="col-span-full text-center py-12 md:py-16">
            <FaUsers className="text-4xl md:text-6xl text-gray-300 mx-auto mb-3 md:mb-4" />
            <p className="text-gray-600 text-base md:text-xl">لا يوجد أعضاء فريق</p>
          </div>
        ) : (
          staff
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((member) => {
              const apiServerUrl = process.env.REACT_APP_API_SERVER_URL || 'http://localhost:5000';
              return (
                <div
                  key={member._id}
                  className={`bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg overflow-hidden transition-all hover:shadow-xl ${!member.isActive ? 'opacity-60' : ''}`}
                >
                  {/* Image Section */}
                  <div className="relative h-48 md:h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                    {member.image ? (
                      <>
                        <img
                          src={`${apiServerUrl}/${member.image}`}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1.5 md:gap-2">
                          <label className="cursor-pointer p-1.5 md:p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors">
                            <FaUpload className="text-gray-700 text-xs md:text-sm" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, member._id)}
                              className="hidden"
                              disabled={uploadingImage}
                            />
                          </label>
                          <button
                            onClick={() => handleRemoveImage(member._id)}
                            className="p-1.5 md:p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
                            title="حذف الصورة"
                          >
                            <FaTimes className="text-red-600 text-xs md:text-sm" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <FaUserTie className="text-4xl md:text-6xl text-gray-400 mx-auto mb-2" />
                          <label className="cursor-pointer inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-white hover:bg-gray-50 rounded-lg shadow-sm transition-colors text-xs md:text-sm text-gray-700">
                            <FaUpload className="text-xs" />
                            رفع صورة
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, member._id)}
                              className="hidden"
                              disabled={uploadingImage}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-3 md:p-6">
                    <h3 className="text-base md:text-xl font-bold mb-1 text-gray-800">{member.name}</h3>
                    <p className="text-gray-600 mb-3 md:mb-4 text-xs md:text-sm">{member.role}</p>

                    <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                      <a
                        href={`tel:${member.contactNumber}`}
                        className="flex items-center gap-2 md:gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-blue-50 rounded-full flex-shrink-0">
                          <FaPhone className="text-blue-600 text-xs md:text-base" />
                        </div>
                        <span className="font-medium text-xs md:text-base">{member.contactNumber}</span>
                      </a>
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-2 md:gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-blue-50 rounded-full flex-shrink-0">
                            <FaEnvelope className="text-blue-600 text-xs md:text-base" />
                          </div>
                          <span className="font-medium text-xs md:text-sm truncate">{member.email}</span>
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2 pt-3 md:pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleEdit(member)}
                        className="flex-1 px-3 md:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center justify-center gap-1 md:gap-2"
                      >
                        <FaEdit className="text-xs" />
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(member._id)}
                        className="flex-1 px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center justify-center gap-1 md:gap-2"
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
          setEditingStaff(null);
        }}
        title={editingStaff ? 'تعديل عضو الفريق' : 'عضو فريق جديد'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">صورة العضو</label>
            {formData.image ? (
              <div className="relative">
                <img
                  src={`${process.env.REACT_APP_API_SERVER_URL || 'http://localhost:5000'}/${formData.image}`}
                  alt="Staff"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image: '' })}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FaImage className="text-4xl text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">لا توجد صورة</p>
                <p className="text-xs text-gray-500">يمكنك رفع صورة بعد إنشاء العضو</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الاسم *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل اسم العضو"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">المنصب *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل المنصب"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">رقم الاتصال *</label>
            <input
              type="text"
              required
              pattern="^01\d{9}$"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="01xxxxxxxxx"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">مثال: 01234567890</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">الترتيب</label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            />
            <p className="text-xs text-gray-500 mt-1">يستخدم لترتيب عرض الأعضاء (الأقل يظهر أولاً)</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              نشط
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="submit" className="btn-primary">
              {editingStaff ? 'تحديث' : 'إضافة'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingStaff(null);
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
          setStaffToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="حذف عضو الفريق"
        message="هل أنت متأكد من حذف هذا العضو؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
      />
    </div>
  );
};

export default AdminStaff;

