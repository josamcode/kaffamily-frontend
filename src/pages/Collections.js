import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import JSZip from 'jszip';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import {
  FaImages, FaDownload, FaSearch, FaFilter, FaTimes, FaCheck,
  FaChevronLeft, FaChevronRight, FaCalendarAlt, FaSortAmountDown,
  FaPlus, FaCheckSquare, FaSquare
} from 'react-icons/fa';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [allImages, setAllImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('collections'); // 'collections' or 'images'
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '', tags: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'collection'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month', 'year'
  const [collectionFilter, setCollectionFilter] = useState('all');
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const apiServerUrl = process.env.REACT_APP_API_SERVER_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (viewMode === 'images' && selectedCollectionId && filteredImages.length > 0) {
      // Re-filter and sort when filters change
      filterAndSortImagesForCollection(filteredImages);
    }
  }, [searchTerm, sortBy, sortOrder, dateFilter]);

  const filterAndSortImagesForCollection = (images) => {
    let filtered = [...images];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(img =>
        img.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.collectionName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(img => {
        const imgDate = new Date(img.createdAt || img.collectionCreatedAt);
        switch (dateFilter) {
          case 'today':
            return imgDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return imgDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return imgDate >= monthAgo;
          case 'year':
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            return imgDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.originalName || '';
          bValue = b.originalName || '';
          break;
        case 'date':
        default:
          aValue = new Date(a.createdAt || a.collectionCreatedAt);
          bValue = new Date(b.createdAt || b.collectionCreatedAt);
          break;
      }

      if (sortBy === 'date') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        const comparison = aValue.localeCompare(bValue, 'ar');
        return sortOrder === 'asc' ? comparison : -comparison;
      }
    });

    setFilteredImages(filtered);
  };

  const handleCollectionSelect = async (collection) => {
    setSelectedCollection(collection);
    setSelectedCollectionId(collection._id);
    setViewMode('images');
    setSelectedImages(new Set());
    setSearchTerm(''); // Reset search when selecting collection

    // Fetch collection details with images
    try {
      const response = await api.get(`/collections/${collection._id}`);
      const collectionData = response.data.collection;
      if (collectionData.images && collectionData.images.length > 0) {
        const collectionImages = collectionData.images.map(img => ({
          ...img,
          collectionId: collection._id,
          collectionName: collection.name,
          collectionCreatedAt: collection.createdAt || collectionData.createdAt
        }));
        // Apply filters and sorting
        filterAndSortImagesForCollection(collectionImages);
      } else {
        setFilteredImages([]);
      }
    } catch (error) {
      console.error('Error fetching collection images:', error);
      // Fallback to filtering from allImages
      const collectionImages = allImages.filter(img => img.collectionId === collection._id);
      filterAndSortImagesForCollection(collectionImages);
    }
  };

  const handleBackToCollections = () => {
    setViewMode('collections');
    setSelectedCollection(null);
    setSelectedCollectionId(null);
    setSelectedImage(null);
    setSelectedImages(new Set());
    setFilteredImages([]);
  };

  const handleImageClick = (image, index) => {
    setSelectedImage({ image, index });
  };

  const handleNextImage = useCallback(() => {
    if (selectedImage) {
      const nextIndex = (selectedImage.index + 1) % filteredImages.length;
      setSelectedImage({ image: filteredImages[nextIndex], index: nextIndex });
    }
  }, [selectedImage, filteredImages]);

  const handlePrevImage = useCallback(() => {
    if (selectedImage) {
      const prevIndex = selectedImage.index === 0 ? filteredImages.length - 1 : selectedImage.index - 1;
      setSelectedImage({ image: filteredImages[prevIndex], index: prevIndex });
    }
  }, [selectedImage, filteredImages]);

  // Keyboard navigation for desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;

      if (e.key === 'ArrowLeft') {
        handleNextImage();
      } else if (e.key === 'ArrowRight') {
        handlePrevImage();
      } else if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, handleNextImage, handlePrevImage]);

  const fetchCollections = async () => {
    try {
      const response = await api.get('/collections');
      const collectionsData = response.data.collections || [];
      setCollections(collectionsData);

      // Collect all images from all collections
      const images = [];
      collectionsData.forEach(collection => {
        if (collection.images && collection.images.length > 0) {
          collection.images.forEach(img => {
            images.push({
              ...img,
              collectionId: collection._id,
              collectionName: collection.name,
              collectionCreatedAt: collection.createdAt
            });
          });
        }
      });
      setAllImages(images);
    } catch (error) {
      console.error('Error fetching collections:', error);
      showToast('خطأ في جلب المجموعات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortImages = () => {
    // Start with images from selected collection or all images
    let filtered = selectedCollectionId
      ? allImages.filter(img => img.collectionId === selectedCollectionId)
      : [...allImages];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(img =>
        img.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.collectionName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Collection filter - if a collection is selected, show only its images (already filtered above)
    if (!selectedCollectionId && collectionFilter !== 'all') {
      filtered = filtered.filter(img => img.collectionId === collectionFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(img => {
        const imgDate = new Date(img.createdAt || img.collectionCreatedAt);
        switch (dateFilter) {
          case 'today':
            return imgDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return imgDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return imgDate >= monthAgo;
          case 'year':
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            return imgDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.originalName || '';
          bValue = b.originalName || '';
          break;
        case 'collection':
          aValue = a.collectionName || '';
          bValue = b.collectionName || '';
          break;
        case 'date':
        default:
          aValue = new Date(a.createdAt || a.collectionCreatedAt);
          bValue = new Date(b.createdAt || b.collectionCreatedAt);
          break;
      }

      if (sortBy === 'date') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        const comparison = aValue.localeCompare(bValue, 'ar');
        return sortOrder === 'asc' ? comparison : -comparison;
      }
    });

    setFilteredImages(filtered);
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    try {
      const tags = newCollection.tags.split(',').map(t => t.trim()).filter(t => t);
      const response = await api.post('/collections', {
        ...newCollection,
        tags
      });
      setCollections([response.data.collection, ...collections]);
      setShowCreateModal(false);
      setNewCollection({ name: '', description: '', tags: '' });
      showToast('تم إنشاء المجموعة بنجاح', 'success');
      await fetchCollections();
    } catch (error) {
      showToast('خطأ في إنشاء المجموعة: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDownloadImage = async (imagePath, imageName) => {
    try {
      const token = localStorage.getItem('token');
      const fullUrl = `${apiServerUrl}/${imagePath}`;

      const response = await axios.get(fullUrl, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = imageName || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast('تم تحميل الصورة بنجاح', 'success');
    } catch (error) {
      showToast('خطأ في تحميل الصورة', 'error');
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedImages.size === 0) return;

    try {
      showToast('جاري تحضير الملفات للتحميل...', 'info');
      const token = localStorage.getItem('token');

      // Download images one by one and create a zip
      const zip = new JSZip();

      for (const imageId of selectedImages) {
        const image = filteredImages.find(img => img._id === imageId);
        if (image) {
          try {
            const fullUrl = `${apiServerUrl}/${image.path}`;
            const response = await axios.get(fullUrl, {
              responseType: 'blob',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            zip.file(image.originalName || `image_${imageId}.jpg`, response.data);
          } catch (error) {
            console.error(`Error downloading image ${imageId}:`, error);
          }
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `selected_images_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast(`تم تحميل ${selectedImages.size} صورة بنجاح`, 'success');
      setSelectedImages(new Set());
    } catch (error) {
      showToast('خطأ في تحميل الصور', 'error');
    }
  };

  const handleDownloadCollection = async () => {
    if (!selectedCollection || !selectedCollection._id) return;

    try {
      showToast('جاري تحضير المجموعة للتحميل...', 'info');
      const token = localStorage.getItem('token');

      // Use the backend download endpoint
      const response = await api.get(`/collections/${selectedCollection._id}/download`);

      if (response.data.downloadUrl) {
        // Download the ZIP file using axios with authentication
        try {
          const downloadResponse = await axios.get(`${apiServerUrl}${response.data.downloadUrl}`, {
            responseType: 'blob',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          // Create a blob URL and trigger download
          const blob = new Blob([downloadResponse.data], { type: 'application/zip' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${selectedCollection.name.replace(/[^a-z0-9]/gi, '_')}_images.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          // Delete the ZIP file from server after successful download
          if (response.data.deleteUrl) {
            try {
              // Wait a bit to ensure download completes
              setTimeout(async () => {
                try {
                  await axios.delete(`${apiServerUrl}${response.data.deleteUrl}`, {
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  });
                  console.log('ZIP file deleted from server');
                } catch (deleteError) {
                  console.error('Error deleting ZIP file:', deleteError);
                  // Don't show error to user, file will be cleaned up later
                }
              }, 3000); // Wait 3 seconds before deletion
            } catch (deleteError) {
              console.error('Error scheduling ZIP deletion:', deleteError);
            }
          }

          showToast('تم تحميل الصور بنجاح', 'success');
        } catch (downloadError) {
          console.error('Error downloading ZIP file:', downloadError);
          // Fallback: download all images manually
          showToast('جاري تحميل الصور يدوياً...', 'info');
          const zip = new JSZip();
          const images = filteredImages.length > 0 ? filteredImages : allImages.filter(img => img.collectionId === selectedCollection._id);

          for (const image of images) {
            try {
              const fullUrl = `${apiServerUrl}/${image.path}`;
              const imgResponse = await axios.get(fullUrl, {
                responseType: 'blob',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              zip.file(image.originalName || `image_${image._id}.jpg`, imgResponse.data);
            } catch (error) {
              console.error(`Error downloading image ${image._id}:`, error);
            }
          }

          const blob = await zip.generateAsync({ type: 'blob' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${selectedCollection.name.replace(/[^a-z0-9]/gi, '_')}_images.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          showToast(`تم تحميل ${images.length} صورة بنجاح`, 'success');
        }
      } else {
        // Fallback: download all images manually
        const zip = new JSZip();
        const images = filteredImages.length > 0 ? filteredImages : allImages.filter(img => img.collectionId === selectedCollection._id);

        for (const image of images) {
          try {
            const fullUrl = `${apiServerUrl}/${image.path}`;
            const imgResponse = await axios.get(fullUrl, {
              responseType: 'blob',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            zip.file(image.originalName || `image_${image._id}.jpg`, imgResponse.data);
          } catch (error) {
            console.error(`Error downloading image ${image._id}:`, error);
          }
        }

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedCollection.name.replace(/[^a-z0-9]/gi, '_')}_images.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showToast(`تم تحميل ${images.length} صورة بنجاح`, 'success');
      }
    } catch (error) {
      console.error('Error downloading collection:', error);
      showToast('خطأ في تحميل الصور: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  // Swipe handlers for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextImage();
    } else if (isRightSwipe) {
      handlePrevImage();
    }
  };

  const toggleImageSelection = (imageId) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedImages.size === filteredImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(filteredImages.map(img => img._id)));
    }
  };

  const onDrop = async (acceptedFiles, collectionId) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      await api.post(`/collections/${collectionId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchCollections();
      showToast('تم رفع الصور بنجاح', 'success');
    } catch (error) {
      showToast('خطأ في رفع الصور: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setUploading(false);
    }
  };

  const CollectionDropzone = ({ collectionId }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files) => onDrop(files, collectionId),
      accept: {
        'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
      },
      multiple: true
    });

    return (
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-600">قم بإسقاط الملفات هنا...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">اسحب وأفلت الصور هنا، أو انقر للاختيار</p>
            <p className="text-sm text-gray-500">يمكن رفع عدة صور في نفس الوقت</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <Loading fullScreen message="جاري تحميل المجموعات..." />;
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-6">
      {/* Header with Search and Filters */}
      <div className="mb-4 md:mb-6 space-y-3 md:space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FaImages className="text-gray-600 text-xl md:text-3xl" />
            معرض الصور
          </h1>
          <div className="flex gap-2 w-full sm:w-auto">
            {/* {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <FaPlus />
                مجموعة جديدة
              </button>
            )} */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 sm:flex-none px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base ${showFilters
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <FaFilter className="text-sm" />
              فلاتر
            </button>
          </div>
        </div>

        {/* Search Bar - Only show in images view */}
        {viewMode === 'images' && (
          <div className="relative mt-3 md:mt-4">
            <FaSearch className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="ابحث عن الصور..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 md:pr-12 pl-3 md:pl-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2 flex items-center gap-2">
                  <FaSortAmountDown className="text-xs" />
                  الترتيب حسب
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="date">التاريخ</option>
                  <option value="name">الاسم</option>
                  <option value="collection">المجموعة</option>
                </select>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">الاتجاه</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="desc">تنازلي</option>
                  <option value="asc">تصاعدي</option>
                </select>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2 flex items-center gap-2">
                  <FaCalendarAlt className="text-xs" />
                  الفترة الزمنية
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="all">الكل</option>
                  <option value="today">اليوم</option>
                  <option value="week">آخر أسبوع</option>
                  <option value="month">آخر شهر</option>
                  <option value="year">آخر سنة</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">المجموعة</label>
                <select
                  value={collectionFilter}
                  onChange={(e) => setCollectionFilter(e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="all">جميع المجموعات</option>
                  {collections.map(collection => (
                    <option key={collection._id} value={collection._id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Selection Bar */}
        {selectedImages.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 md:gap-4">
              <span className="font-medium text-gray-800 text-sm md:text-base">
                تم اختيار {selectedImages.size} صورة
              </span>
              <button
                onClick={toggleSelectAll}
                className="text-xs md:text-sm text-blue-600 hover:text-blue-800"
              >
                {selectedImages.size === filteredImages.length ? 'إلغاء الكل' : 'تحديد الكل'}
              </button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleDownloadSelected}
                className="flex-1 sm:flex-none px-3 py-2 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-xs md:text-base"
              >
                <FaDownload className="text-xs" />
                <span className="hidden sm:inline">تحميل المحدد ({selectedImages.size})</span>
                <span className="sm:hidden">تحميل ({selectedImages.size})</span>
              </button>
              <button
                onClick={() => setSelectedImages(new Set())}
                className="px-3 py-2 md:px-4 md:py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors text-xs md:text-base"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Collections View */}
      {viewMode === 'collections' && (
        <div>
          {collections.length === 0 ? (
            <div className="text-center py-12 md:py-16">
              <FaImages className="text-4xl md:text-6xl text-gray-300 mx-auto mb-3 md:mb-4" />
              <p className="text-gray-600 text-base md:text-xl">لا توجد مجموعات</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {collections.map((collection) => (
                <div
                  key={collection._id}
                  onClick={() => handleCollectionSelect(collection)}
                  className="bg-white rounded-lg md:rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border border-gray-200"
                >
                  {/* Cover Image */}
                  <div className="relative h-48 md:h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                    {collection.coverImage ? (
                      <img
                        src={`${apiServerUrl}/${collection.coverImage}`}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaImages className="text-4xl md:text-6xl text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4 left-3 md:left-4">
                      <h3 className="text-lg md:text-xl font-bold text-white mb-1">{collection.name}</h3>
                      <p className="text-xs md:text-sm text-white/90 flex items-center gap-2">
                        <FaImages className="text-xs" />
                        {collection.images?.length || 0} صورة
                      </p>
                    </div>
                  </div>

                  {/* Collection Info */}
                  <div className="p-4 md:p-5">
                    {collection.description && (
                      <p className="text-gray-600 mb-3 md:mb-4 line-clamp-2 text-xs md:text-sm">{collection.description}</p>
                    )}
                    {collection.tags && collection.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4">
                        {collection.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 md:py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {collection.tags.length > 3 && (
                          <span className="px-2 py-0.5 md:py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            +{collection.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    <button className="w-full px-3 py-2 md:px-4 md:py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base">
                      <FaImages className="text-xs md:text-base" />
                      عرض الصور
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Images View */}
      {viewMode === 'images' && (
        <>
          {selectedCollection && (
            <div className="mb-4 md:mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg md:rounded-xl p-4 md:p-6 border border-blue-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">{selectedCollection.name}</h2>
                  {selectedCollection.description && (
                    <p className="text-gray-600 mb-1 md:mb-2 text-sm md:text-base">{selectedCollection.description}</p>
                  )}
                  <p className="text-xs md:text-sm text-gray-500">
                    {filteredImages.length} صورة في هذه المجموعة
                  </p>
                </div>
                <button
                  onClick={handleDownloadCollection}
                  className="w-full sm:w-auto px-4 py-2 md:px-6 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg text-sm md:text-base"
                >
                  <FaDownload className="text-xs md:text-base" />
                  <span className="hidden sm:inline">تحميل الصور</span>
                  <span className="sm:hidden">تحميل</span>
                </button>
              </div>
            </div>
          )}

          {filteredImages.length === 0 ? (
            <div className="text-center py-12 md:py-16">
              <FaImages className="text-4xl md:text-6xl text-gray-300 mx-auto mb-3 md:mb-4" />
              <p className="text-gray-600 text-base md:text-xl">لا توجد صور في هذه المجموعة</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {filteredImages.map((image, index) => {
                const isSelected = selectedImages.has(image._id);
                return (
                  <div
                    key={image._id}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden ${isSelected ? 'ring-2 md:ring-4 ring-blue-500' : ''
                      }`}
                    onClick={() => handleImageClick(image, index)}
                  >
                    <img
                      src={`${apiServerUrl}/${image.path}`}
                      alt={image.originalName || 'صورة'}
                      className="w-full h-32 md:h-48 object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 md:gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadImage(image.path, image.originalName);
                          }}
                          className="p-1.5 md:p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          title="تحميل"
                        >
                          <FaDownload className="text-gray-700 text-xs md:text-base" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleImageSelection(image._id);
                          }}
                          className={`p-1.5 md:p-2 rounded-full transition-colors ${isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-white hover:bg-gray-100 text-gray-700'
                            }`}
                          title={isSelected ? 'إلغاء التحديد' : 'تحديد'}
                        >
                          {isSelected ? <FaCheckSquare className="text-xs md:text-base" /> : <FaSquare className="text-xs md:text-base" />}
                        </button>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 md:top-2 right-1 md:right-2 bg-blue-600 text-white p-0.5 md:p-1 rounded-full">
                        <FaCheck className="text-xs" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Image Viewer Modal */}
      {selectedImage && (
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          size="full"
        >
          <div
            className="relative h-[90vh] flex items-center justify-center bg-black"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
            <button
              onClick={handlePrevImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors hidden md:flex items-center justify-center"
            >
              <FaChevronRight className="text-2xl" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors hidden md:flex items-center justify-center"
            >
              <FaChevronLeft className="text-2xl" />
            </button>
            <img
              src={`${apiServerUrl}/${selectedImage.image.path}`}
              alt={selectedImage.image.originalName || 'صورة'}
              className="max-w-full max-h-full object-contain select-none"
              draggable="false"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
              <p className="text-sm">
                {selectedImage.index + 1} / {filteredImages.length}
              </p>
            </div>
            <div className="absolute bottom-4 right-4 z-20 flex gap-2">
              <button
                onClick={() => handleDownloadImage(selectedImage.image.path, selectedImage.image.originalName)}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                title="تحميل"
              >
                <FaDownload />
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Collection Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewCollection({ name: '', description: '', tags: '' });
        }}
        title="إنشاء مجموعة جديدة"
      >
        <form onSubmit={handleCreateCollection}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم المجموعة *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={newCollection.name}
                onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الوصف</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                rows="3"
                value={newCollection.description}
                onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">العلامات (مفصولة بفواصل)</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={newCollection.tags}
                onChange={(e) => setNewCollection({ ...newCollection, tags: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button type="submit" className="flex-1 px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors">
              إنشاء
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
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

export default Collections;
