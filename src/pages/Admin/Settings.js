import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import Loading from '../../components/Loading';
import IconSelector from '../../components/IconSelector';
import {
  FaCog, FaSave, FaPalette, FaEye, FaEyeSlash, FaImage, FaMapMarkerAlt,
  FaLink, FaHome, FaInfoCircle, FaPlus, FaTrash, FaFacebook, FaTwitter,
  FaInstagram, FaYoutube, FaLinkedin, FaWhatsapp, FaTelegram, FaGlobe,
  FaUsers, FaUserTie, FaBolt, FaBullhorn, FaCheckCircle, FaStar, FaAward,
  FaTimes, FaUpload
} from 'react-icons/fa';
import { renderIcon } from '../../components/IconSelector';
import { API_SERVER_URL } from '../../config';

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(null);
  const [showSocialIconSelector, setShowSocialIconSelector] = useState(null);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', { settings });
      showToast('تم حفظ الإعدادات بنجاح', 'success');
    } catch (error) {
      showToast('خطأ في حفظ الإعدادات: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (path, value) => {
    const keys = path.split('.');
    const newSettings = { ...settings };
    let current = newSettings;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
  };

  const addSocialLink = () => {
    const newLinks = [...(settings.social?.links || []), { name: '', url: '', icon: 'FaGlobe' }];
    updateSetting('social.links', newLinks);
  };

  const removeSocialLink = (index) => {
    const newLinks = settings.social?.links?.filter((_, i) => i !== index) || [];
    updateSetting('social.links', newLinks);
  };

  const updateSocialLink = (index, field, value) => {
    const newLinks = [...(settings.social?.links || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    updateSetting('social.links', newLinks);
  };

  const addAboutFeature = () => {
    const newFeatures = [...(settings.about?.features || []), { icon: 'FaCheckCircle', text: '' }];
    updateSetting('about.features', newFeatures);
  };

  const removeAboutFeature = (index) => {
    const newFeatures = settings.about?.features?.filter((_, i) => i !== index) || [];
    updateSetting('about.features', newFeatures);
  };

  const updateAboutFeature = (index, field, value) => {
    const newFeatures = [...(settings.about?.features || [])];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    updateSetting('about.features', newFeatures);
  };

  if (loading) {
    return <Loading fullScreen message="جاري تحميل الإعدادات..." />;
  }

  if (!settings) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0 mb-6 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2 text-gray-800">
          <FaCog className="text-gray-600 text-base md:text-2xl" />
          إعدادات الموقع
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto px-4 md:px-6 py-2 md:py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm md:text-base font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <FaSave className="text-sm" />
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Header Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <FaHome className="text-gray-600" />
            إعدادات الرأس
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">نص الشعار</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={settings.header?.logoText || ''}
                onChange={(e) => updateSetting('header.logoText', e.target.value)}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-1 text-gray-700">
                <FaImage />
                صورة الشعار (URL)
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={settings.header?.logoImage || ''}
                onChange={(e) => updateSetting('header.logoImage', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Hero Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <FaImage className="text-gray-600" />
            إعدادات القسم الرئيسي
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">العنوان الرئيسي</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={settings.hero?.headline || ''}
                onChange={(e) => updateSetting('hero.headline', e.target.value)}
                placeholder="KAF"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">العنوان الفرعي (اختياري)</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={settings.hero?.subtitle || ''}
                onChange={(e) => updateSetting('hero.subtitle', e.target.value)}
                placeholder="منصة متخصصة في تنظيم الاجتماعات والرحلات"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">شفافية الخلفية (0-1)</label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={settings.hero?.overlayOpacity ?? 0.6}
                onChange={(e) => updateSetting('hero.overlayOpacity', parseFloat(e.target.value) || 0.6)}
              />
              <p className="text-xs text-gray-500 mt-1">قيمة أعلى = خلفية أغمق</p>
            </div>
            <div>
              <label className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.hero?.enabled !== false}
                  onChange={(e) => updateSetting('hero.enabled', e.target.checked)}
                  className="w-4 h-4"
                />
                <span>تفعيل القسم الرئيسي</span>
              </label>
            </div>

            {/* Hero Images - 4 Images */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700">
                صور القسم الرئيسي (4 صور)
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((index) => {
                  const imagePath = settings.hero?.images?.[index] || '';
                  const apiServerUrl = API_SERVER_URL || 'http://localhost:5000';
                  return (
                    <div key={index} className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">
                        صورة {index + 1}
                      </label>
                      {imagePath ? (
                        <div className="relative group">
                          <img
                            src={`${apiServerUrl}/${imagePath}`}
                            alt={`Hero ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              const newImages = [...(settings.hero?.images || ['', '', '', ''])];
                              newImages[index] = '';

                              // Update local state
                              updateSetting('hero.images', newImages);

                              // Save to database immediately
                              const updatedSettings = { ...settings };
                              if (!updatedSettings.hero) updatedSettings.hero = {};
                              updatedSettings.hero.images = newImages;

                              try {
                                await api.put('/settings', { settings: updatedSettings });
                                setSettings(updatedSettings);
                                showToast('تم حذف الصورة بنجاح', 'success');
                              } catch (error) {
                                showToast('خطأ في حذف الصورة: ' + (error.response?.data?.message || error.message), 'error');
                              }
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;

                              setUploadingHeroImage(index);
                              const formData = new FormData();
                              formData.append('image', file);

                              try {
                                const response = await api.post('/images/upload', formData, {
                                  headers: {
                                    'Content-Type': 'multipart/form-data'
                                  }
                                });

                                console.log('Upload response:', response.data);
                                const imagePath = response.data.image.path;
                                console.log('Image path:', imagePath);

                                const newImages = [...(settings.hero?.images || ['', '', '', ''])];
                                newImages[index] = imagePath;
                                console.log('New images array:', newImages);

                                // Update local state first
                                updateSetting('hero.images', newImages);

                                // Save to database immediately
                                const updatedSettings = { ...settings };
                                if (!updatedSettings.hero) updatedSettings.hero = {};
                                updatedSettings.hero.images = newImages;

                                console.log('Saving settings with images:', updatedSettings.hero.images);
                                const saveResponse = await api.put('/settings', { settings: updatedSettings });
                                console.log('Save response:', saveResponse.data);

                                // Update local state with saved data
                                setSettings(updatedSettings);

                                showToast('تم رفع الصورة وحفظها بنجاح', 'success');
                              } catch (error) {
                                console.error('Error uploading image:', error);
                                console.error('Error response:', error.response?.data);
                                showToast('خطأ في رفع الصورة: ' + (error.response?.data?.message || error.message), 'error');
                              } finally {
                                setUploadingHeroImage(null);
                                e.target.value = ''; // Reset input
                              }
                            }}
                            className="hidden"
                            id={`hero-image-${index}`}
                            disabled={uploadingHeroImage === index}
                          />
                          <label
                            htmlFor={`hero-image-${index}`}
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${uploadingHeroImage === index
                              ? 'border-gray-400 bg-gray-100 opacity-50'
                              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                              }`}
                          >
                            {uploadingHeroImage === index ? (
                              <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mb-2"></div>
                                <span className="text-xs text-gray-600">جاري الرفع...</span>
                              </div>
                            ) : (
                              <>
                                <FaUpload className="text-2xl text-gray-400 mb-1" />
                                <span className="text-xs text-gray-500">رفع صورة</span>
                              </>
                            )}
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                يمكنك رفع 4 صور لعرضها في القسم الرئيسي
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <FaBolt className="text-gray-600" />
            إعدادات الإجراءات السريعة
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">عنوان القسم</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={settings.quickActions?.title || ''}
                onChange={(e) => updateSetting('quickActions.title', e.target.value)}
                placeholder="إجراءات سريعة"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">الوصف</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={settings.quickActions?.subtitle || ''}
                onChange={(e) => updateSetting('quickActions.subtitle', e.target.value)}
                placeholder="استكشف خدماتنا ومواردنا"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.quickActions?.enabled !== false}
                  onChange={(e) => updateSetting('quickActions.enabled', e.target.checked)}
                  className="w-4 h-4"
                />
                <span>تفعيل قسم الإجراءات السريعة</span>
              </label>
            </div>
          </div>
        </div>

        {/* About Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <FaInfoCircle className="text-gray-600" />
            إعدادات قسم من نحن
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">عنوان القسم</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={settings.about?.title || ''}
                onChange={(e) => updateSetting('about.title', e.target.value)}
                placeholder="من نحن"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">المحتوى</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                rows="5"
                value={settings.about?.content || ''}
                onChange={(e) => updateSetting('about.content', e.target.value)}
              />
            </div>

            {/* About Features */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">المميزات</label>
              {(settings.about?.features || []).map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <div className="flex-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowIconSelector(`about-feature-${index}`)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center min-w-[48px]"
                    >
                      {renderIcon(feature.icon || 'FaCheckCircle', 'text-xl')}
                    </button>
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={feature.text || ''}
                      onChange={(e) => updateAboutFeature(index, 'text', e.target.value)}
                      placeholder="نص الميزة"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAboutFeature(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addAboutFeature}
                className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2"
              >
                <FaPlus />
                إضافة ميزة
              </button>
              {showIconSelector && showIconSelector.startsWith('about-feature-') && (
                <div className="mt-2">
                  <IconSelector
                    value={(settings.about?.features || [])[parseInt(showIconSelector.split('-').pop())]?.icon || ''}
                    onChange={(icon) => {
                      const index = parseInt(showIconSelector.split('-').pop());
                      updateAboutFeature(index, 'icon', icon);
                      setShowIconSelector(null);
                    }}
                    label="اختر أيقونة"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.about?.enabled !== false}
                  onChange={(e) => updateSetting('about.enabled', e.target.checked)}
                  className="w-4 h-4"
                />
                <span>تفعيل قسم من نحن</span>
              </label>
            </div>
          </div>
        </div>

        {/* Announcements Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <FaBullhorn className="text-gray-600" />
            إعدادات الإعلانات
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">عنوان القسم</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={settings.announcements?.title || ''}
                onChange={(e) => updateSetting('announcements.title', e.target.value)}
                placeholder="الإعلانات"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">الوصف</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={settings.announcements?.subtitle || ''}
                onChange={(e) => updateSetting('announcements.subtitle', e.target.value)}
                placeholder="تابع آخر الأخبار والفعاليات"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.announcements?.enabled !== false}
                  onChange={(e) => updateSetting('announcements.enabled', e.target.checked)}
                  className="w-4 h-4"
                />
                <span>تفعيل قسم الإعلانات</span>
              </label>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <FaPalette className="text-gray-600" />
            الألوان
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">اللون الأساسي</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-16 h-10 rounded border border-gray-300"
                  value={settings.colors?.primary || '#3B82F6'}
                  onChange={(e) => updateSetting('colors.primary', e.target.value)}
                />
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={settings.colors?.primary || '#3B82F6'}
                  onChange={(e) => updateSetting('colors.primary', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">اللون الثانوي</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-16 h-10 rounded border border-gray-300"
                  value={settings.colors?.secondary || '#8B5CF6'}
                  onChange={(e) => updateSetting('colors.secondary', e.target.value)}
                />
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={settings.colors?.secondary || '#8B5CF6'}
                  onChange={(e) => updateSetting('colors.secondary', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">لون التمييز</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-16 h-10 rounded border border-gray-300"
                  value={settings.colors?.accent || '#10B981'}
                  onChange={(e) => updateSetting('colors.accent', e.target.value)}
                />
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={settings.colors?.accent || '#10B981'}
                  onChange={(e) => updateSetting('colors.accent', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">لون الخلفية</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-16 h-10 rounded border border-gray-300"
                  value={settings.colors?.background || '#FFFFFF'}
                  onChange={(e) => updateSetting('colors.background', e.target.value)}
                />
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={settings.colors?.background || '#FFFFFF'}
                  onChange={(e) => updateSetting('colors.background', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">لون النص</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-16 h-10 rounded border border-gray-300"
                  value={settings.colors?.text || '#1F2937'}
                  onChange={(e) => updateSetting('colors.text', e.target.value)}
                />
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={settings.colors?.text || '#1F2937'}
                  onChange={(e) => updateSetting('colors.text', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sections Visibility */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <FaEye className="text-gray-600" />
            إظهار/إخفاء الأقسام
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.keys(settings.sections || {}).map((section) => (
              <label key={section} className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.sections[section] !== false}
                  onChange={(e) => updateSetting(`sections.${section}`, e.target.checked)}
                  className="w-4 h-4"
                />
                <span>{section}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <FaLink className="text-gray-600 text-base md:text-lg" />
            روابط التواصل الاجتماعي
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">عنوان القسم</label>
              <input
                type="text"
                className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={settings.social?.title || ''}
                onChange={(e) => updateSetting('social.title', e.target.value)}
                placeholder="تابعنا على"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">الروابط</label>
              {(settings.social?.links || []).map((link, index) => (
                <div key={index} className="space-y-2 mb-4 p-3 md:p-4 border border-gray-200 rounded-lg">
                  <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-start">
                    <button
                      type="button"
                      onClick={() => setShowSocialIconSelector(`social-${index}`)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center min-w-[48px] md:min-w-[48px] w-full md:w-auto"
                      title="اختر الأيقونة"
                    >
                      {renderIcon(link.icon || 'FaGlobe', 'text-lg md:text-xl')}
                    </button>
                    <div className="flex-1 flex flex-col md:flex-row gap-2">
                      <input
                        type="text"
                        className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={link.name || ''}
                        onChange={(e) => updateSocialLink(index, 'name', e.target.value)}
                        placeholder="اسم المنصة"
                      />
                      <input
                        type="text"
                        className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={link.url || ''}
                        onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                        placeholder="رابط المنصة"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full md:w-auto"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  {showSocialIconSelector === `social-${index}` && (
                    <div className="mt-2">
                      <IconSelector
                        value={link.icon || 'FaGlobe'}
                        onChange={(icon) => {
                          updateSocialLink(index, 'icon', icon);
                          setShowSocialIconSelector(null);
                        }}
                        label="اختر أيقونة"
                      />
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSocialLink}
                className="mt-2 w-full md:w-auto px-4 py-2 text-sm md:text-base bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2"
              >
                <FaPlus />
                إضافة رابط
              </button>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <FaMapMarkerAlt className="text-gray-600" />
            الموقع
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">اسم المكان</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={settings.location?.name || ''}
                onChange={(e) => updateSetting('location.name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">العنوان</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={settings.location?.address || ''}
                onChange={(e) => updateSetting('location.address', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">رابط الخريطة</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={settings.location?.mapUrl || ''}
                onChange={(e) => updateSetting('location.mapUrl', e.target.value)}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.location?.enabled !== false}
                  onChange={(e) => updateSetting('location.enabled', e.target.checked)}
                  className="w-4 h-4"
                />
                <span>تفعيل قسم الموقع</span>
              </label>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <FaUsers className="text-gray-600" />
            الإحصائيات
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">عدد الأفراد</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={settings.metrics?.servedPeople || 0}
                  onChange={(e) => updateSetting('metrics.servedPeople', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">تسمية عدد الأفراد</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={settings.metrics?.servedPeopleLabel || ''}
                  onChange={(e) => updateSetting('metrics.servedPeopleLabel', e.target.value)}
                  placeholder="عدد افراد العيلة"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">عدد الخدام</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={settings.metrics?.staffCount || 0}
                  onChange={(e) => updateSetting('metrics.staffCount', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">تسمية عدد الخدام</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={settings.metrics?.staffCountLabel || ''}
                  onChange={(e) => updateSetting('metrics.staffCountLabel', e.target.value)}
                  placeholder="عدد خدام الاجتماع"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
