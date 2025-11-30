import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import TagInput from '../../components/TagInput';
import { FaImages, FaEdit, FaTrash, FaImage, FaDownload, FaExternalLinkAlt, FaPlus, FaTimes, FaStar, FaCheckCircle } from 'react-icons/fa';
import { API_SERVER_URL } from '../../config';

const AdminCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [collectionImages, setCollectionImages] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImageDeleteConfirm, setShowImageDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '', tags: [] });

  // Debug: Log state changes
  useEffect(() => {
    console.log('showImageDeleteConfirm:', showImageDeleteConfirm);
    console.log('itemToDelete:', itemToDelete);
  }, [showImageDeleteConfirm, itemToDelete]);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/collections');
      setCollections(response.data.collections || []);
    } catch (error) {
      showToast('خطأ في جلب المجموعات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionImages = async (collectionId) => {
    try {
      const response = await api.get(`/collections/${collectionId}`);
      setCollectionImages(response.data.collection?.images || []);
    } catch (error) {
      showToast('خطأ في جلب صور المجموعة', 'error');
    }
  };

  const handleEdit = (collection) => {
    setSelectedCollection(collection);
    setEditData({
      name: collection.name,
      description: collection.description || '',
      tags: collection.tags || []
    });
    setShowEditModal(true);
  };

  const handleManageImages = async (collection) => {
    setSelectedCollection(collection);
    await fetchCollectionImages(collection._id);
    setShowImagesModal(true);
  };

  const handleSave = async () => {
    try {
      await api.put(`/collections/${selectedCollection._id}`, {
        name: editData.name,
        description: editData.description,
        tags: editData.tags || []
      });
      showToast('تم تحديث المجموعة بنجاح', 'success');
      setShowEditModal(false);
      fetchCollections();
    } catch (error) {
      showToast('خطأ في التحديث', 'error');
    }
  };

  const handleDelete = (collectionId) => {
    setItemToDelete(collectionId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/collections/${itemToDelete}`);
      showToast('تم حذف المجموعة بنجاح', 'success');
      fetchCollections();
    } catch (error) {
      showToast('خطأ في الحذف', 'error');
    } finally {
      setItemToDelete(null);
    }
  };

  const handleDeleteImage = (imageId) => {
    console.log('imageId to delete', imageId);
    setItemToDelete(imageId);
    setShowImageDeleteConfirm(true);
    console.log('showImageDeleteConfirm set to true');
  };

  const confirmDeleteImage = async () => {
    try {
      await api.delete(`/images/${itemToDelete}`);
      showToast('تم حذف الصورة بنجاح', 'success');
      await fetchCollectionImages(selectedCollection._id);
      fetchCollections();
    } catch (error) {
      showToast('خطأ في حذف الصورة', 'error');
    } finally {
      setItemToDelete(null);
    }
  };

  const handleSetCoverImage = async (imagePath) => {
    try {
      await api.put(`/collections/${selectedCollection._id}`, {
        coverImage: imagePath
      });
      showToast('تم تعيين الصورة كصورة الغلاف بنجاح', 'success');
      await fetchCollectionImages(selectedCollection._id);
      fetchCollections();
    } catch (error) {
      showToast('خطأ في تعيين صورة الغلاف', 'error');
    }
  };

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    acceptedFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      await api.post(`/collections/${selectedCollection._id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });
      showToast(`تم رفع ${acceptedFiles.length} صورة بنجاح`, 'success');
      await fetchCollectionImages(selectedCollection._id);
      fetchCollections();
    } catch (error) {
      showToast('خطأ في رفع الصور', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/collections', {
        name: newCollection.name,
        description: newCollection.description,
        tags: newCollection.tags || []
      });
      showToast('تم إنشاء المجموعة بنجاح', 'success');
      setShowCreateModal(false);
      setNewCollection({ name: '', description: '', tags: [] });
      fetchCollections();
    } catch (error) {
      showToast('خطأ في إنشاء المجموعة: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  if (loading) return <Loading fullScreen />;

  const apiServerUrl = API_SERVER_URL || 'http://localhost:5000';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaImages className="text-gray-600" />
          إدارة المجموعات
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <FaPlus />
            مجموعة جديدة
          </button>
          <Link to="/collections" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2">
            <FaExternalLinkAlt />
            عرض الصفحة العامة
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <FaImages className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-xl">لا توجد مجموعات</p>
          </div>
        ) : (
          collections.map((collection) => (
            <div key={collection._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {collection.coverImage ? (
                <img
                  src={`${apiServerUrl}/${collection.coverImage}`}
                  alt={collection.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <FaImage className="text-4xl text-gray-400 mx-auto mb-2" />
                    <span className="text-gray-500 text-sm">لا توجد صورة</span>
                  </div>
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{collection.name}</h3>
              {collection.description && (
                <p className="text-gray-600 mb-4 line-clamp-2">{collection.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {collection.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <FaImage />
                  {collection.images?.length || 0} صورة
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <FaDownload />
                  {collection.downloadCount || 0} تحميل
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(collection)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-1"
                >
                  <FaEdit />
                  تعديل
                </button>
                <button
                  onClick={() => handleManageImages(collection)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-1"
                >
                  <FaImages />
                  الصور
                </button>
                <button
                  onClick={() => handleDelete(collection._id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm flex items-center gap-1"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCollection(null);
          setEditData({});
        }}
        title="تعديل المجموعة"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">اسم المجموعة *</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              value={editData.name || ''}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">الوصف</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              rows="4"
              value={editData.description || ''}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              العلامات
            </label>
            <TagInput
              tags={editData.tags || []}
              onChange={(tags) => setEditData({ ...editData, tags })}
              placeholder="أضف علامة جديدة"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={handleSave} className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors">
              حفظ
            </button>
            <button
              onClick={() => {
                setShowEditModal(false);
                setSelectedCollection(null);
                setEditData({});
              }}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>

      {/* Images Management Modal */}
      <Modal
        isOpen={showImagesModal}
        onClose={() => {
          setShowImagesModal(false);
          setSelectedCollection(null);
          setCollectionImages([]);
        }}
        title={`إدارة صور: ${selectedCollection?.name || ''}`}
        size="large"
      >
        <div className="space-y-6">
          {/* Upload Area */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">إضافة صور جديدة</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} disabled={uploading} />
              {uploading ? (
                <div className="flex flex-col items-center w-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-700 font-medium mb-2">جاري الرفع...</p>

                  {/* Progress Bar */}
                  <div className="w-full max-w-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">التقدم</span>
                      <span className="text-sm font-bold text-blue-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-2"
                        style={{ width: `${uploadProgress}%` }}
                      >
                        {uploadProgress > 10 && (
                          <span className="text-xs text-white font-medium">{uploadProgress}%</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">يرجى الانتظار حتى اكتمال الرفع...</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FaPlus className="text-4xl text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-1">
                    {isDragActive ? 'أفلت الصور هنا' : 'اسحب وأفلت الصور هنا أو انقر للاختيار'}
                  </p>
                  <p className="text-sm text-gray-500">يمكنك رفع عدة صور في مرة واحدة</p>
                </div>
              )}
            </div>
          </div>

          {/* Images Grid */}
          {collectionImages.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                الصور ({collectionImages.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {collectionImages.map((image) => {
                  const isCoverImage = selectedCollection?.coverImage === image.path;
                  return (
                    <div key={image._id} className="relative group">
                      <div className={`relative overflow-hidden rounded-lg ${isCoverImage ? 'ring-4 ring-blue-500 ring-offset-2' : ''}`}>
                        <img
                          src={`${apiServerUrl}/${image.path}`}
                          alt={image.originalName}
                          className="w-full h-32 object-cover"
                        />
                        {isCoverImage && (
                          <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white px-2 py-1 text-xs font-semibold flex items-center justify-center gap-1">
                            <FaStar className="text-xs" />
                            صورة الغلاف
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleSetCoverImage(image.path);
                            }}
                            className={`opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${isCoverImage
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                              }`}
                            title={isCoverImage ? 'صورة الغلاف الحالية' : 'تعيين كصورة الغلاف'}
                            disabled={isCoverImage}
                          >
                            {isCoverImage ? (
                              <>
                                <FaCheckCircle />
                                غلاف
                              </>
                            ) : (
                              <>
                                <FaStar />
                                تعيين غلاف
                              </>
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleDeleteImage(image._id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white p-2 rounded-full z-10"
                            title="حذف الصورة"
                          >
                            <FaTimes className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaImage className="text-4xl text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">لا توجد صور في هذه المجموعة</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Collection Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="حذف المجموعة"
        message="هل أنت متأكد من حذف هذه المجموعة؟ سيتم حذف جميع الصور المرتبطة بها ولا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
      />

      {/* Delete Image Confirm Dialog */}
      <ConfirmDialog
        isOpen={showImageDeleteConfirm}
        onClose={() => {
          setShowImageDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDeleteImage}
        title="حذف الصورة"
        message="هل أنت متأكد من حذف هذه الصورة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
      />

      {/* Create Collection Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewCollection({ name: '', description: '', tags: [] });
        }}
        title="إنشاء مجموعة جديدة"
      >
        <form onSubmit={handleCreateCollection}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">اسم المجموعة *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={newCollection.name}
                onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">الوصف</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                rows="3"
                value={newCollection.description}
                onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                العلامات
              </label>
              <TagInput
                tags={newCollection.tags || []}
                onChange={(tags) => setNewCollection({ ...newCollection, tags })}
                placeholder="أضف علامة جديدة"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button type="submit" className="flex-1 px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors">
              إنشاء
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setNewCollection({ name: '', description: '', tags: '' });
              }}
              className="flex-1 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCollections;
