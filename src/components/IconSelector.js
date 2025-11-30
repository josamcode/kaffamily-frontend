import React, { useState } from 'react';
import {
  FaUser, FaUsers, FaImage, FaImages, FaBullhorn, FaCog, FaUserTie,
  FaGamepad, FaChartBar, FaBolt, FaHome, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaCalendar, FaClock, FaStar, FaHeart, FaBook, FaGraduationCap, FaBuilding,
  FaCamera, FaVideo, FaMusic, FaFilm, FaShoppingCart, FaCreditCard, FaLock,
  FaUnlock, FaEdit, FaTrash, FaPlus, FaMinus, FaCheck, FaTimes, FaSearch,
  FaDownload, FaUpload, FaShare, FaLink, FaExternalLinkAlt, FaInfoCircle,
  FaQuestionCircle, FaExclamationCircle, FaCheckCircle, FaTimesCircle,
  FaArrowRight, FaArrowLeft, FaArrowUp, FaArrowDown, FaChevronRight,
  FaChevronLeft, FaChevronUp, FaChevronDown, FaBars, FaEllipsisV,
  FaBell, FaBellSlash, FaEye, FaEyeSlash, FaFilter, FaSort, FaSortUp,
  FaSortDown, FaTh, FaThList, FaGrid, FaList, FaFolder, FaFolderOpen,
  FaFile, FaFileAlt, FaFilePdf, FaFileImage, FaFileVideo, FaFileAudio,
  FaArchive, FaBox, FaBoxOpen, FaTag, FaTags, FaHashtag, FaAt, FaGlobe,
  FaLanguage, FaFlag, FaMap, FaLocationArrow, FaRoute, FaDirections,
  FaCar, FaBus, FaPlane, FaTrain, FaShip, FaBicycle, FaWalking,
  FaUtensils, FaCoffee, FaPizzaSlice, FaIceCream, FaBirthdayCake,
  FaGift, FaRibbon, FaTrophy, FaMedal, FaAward, FaCertificate,
  FaGraduationCap as FaGraduation, FaBookOpen, FaBookReader, FaPen,
  FaPencilAlt, FaHighlighter, FaMarker, FaEraser, FaPaintBrush,
  FaPalette, FaFill, FaFillDrip, FaSwatchbook, FaBrush, FaStamp,
  FaHandPaper, FaHandRock, FaHandScissors, FaHandPeace, FaThumbsUp,
  FaThumbsDown, FaHandPointRight, FaHandPointLeft, FaHandPointUp,
  FaHandPointDown, FaHandshake, FaFistRaised, FaPeace, FaPrayingHands
} from 'react-icons/fa';
import {
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaWhatsapp,
  FaTelegram, FaPinterest, FaGithub, FaSkype, FaDribbble,
  FaBehance, FaMedium, FaTumblr, FaFlickr, FaVimeo, FaSoundcloud,
  FaSpotify, FaApple, FaGoogle, FaPaypal
} from 'react-icons/fa';

const iconCategories = {
  'عام': [
    { name: 'home', icon: FaHome, label: 'الرئيسية' },
    { name: 'user', icon: FaUser, label: 'مستخدم' },
    { name: 'users', icon: FaUsers, label: 'مستخدمون' },
    { name: 'cog', icon: FaCog, label: 'إعدادات' },
    { name: 'info', icon: FaInfoCircle, label: 'معلومات' },
    { name: 'question', icon: FaQuestionCircle, label: 'سؤال' },
    { name: 'check', icon: FaCheckCircle, label: 'نجح' },
    { name: 'times', icon: FaTimesCircle, label: 'إغلاق' },
  ],
  'الصور والوسائط': [
    { name: 'image', icon: FaImage, label: 'صورة' },
    { name: 'images', icon: FaImages, label: 'صور' },
    { name: 'camera', icon: FaCamera, label: 'كاميرا' },
    { name: 'video', icon: FaVideo, label: 'فيديو' },
    { name: 'film', icon: FaFilm, label: 'فيلم' },
    { name: 'music', icon: FaMusic, label: 'موسيقى' },
  ],
  'التواصل': [
    { name: 'envelope', icon: FaEnvelope, label: 'بريد' },
    { name: 'phone', icon: FaPhone, label: 'هاتف' },
    { name: 'bullhorn', icon: FaBullhorn, label: 'إعلان' },
    { name: 'bell', icon: FaBell, label: 'إشعار' },
    { name: 'share', icon: FaShare, label: 'مشاركة' },
    { name: 'link', icon: FaLink, label: 'رابط' },
  ],
  'التواصل الاجتماعي': [
    { name: 'facebook', icon: FaFacebook, label: 'Facebook' },
    { name: 'twitter', icon: FaTwitter, label: 'Twitter' },
    { name: 'instagram', icon: FaInstagram, label: 'Instagram' },
    { name: 'linkedin', icon: FaLinkedin, label: 'LinkedIn' },
    { name: 'youtube', icon: FaYoutube, label: 'YouTube' },
    { name: 'whatsapp', icon: FaWhatsapp, label: 'WhatsApp' },
    { name: 'telegram', icon: FaTelegram, label: 'Telegram' },
    { name: 'pinterest', icon: FaPinterest, label: 'Pinterest' },
    { name: 'github', icon: FaGithub, label: 'GitHub' },
    { name: 'skype', icon: FaSkype, label: 'Skype' },
    { name: 'dribbble', icon: FaDribbble, label: 'Dribbble' },
    { name: 'behance', icon: FaBehance, label: 'Behance' },
    { name: 'medium', icon: FaMedium, label: 'Medium' },
    { name: 'tumblr', icon: FaTumblr, label: 'Tumblr' },
    { name: 'flickr', icon: FaFlickr, label: 'Flickr' },
    { name: 'vimeo', icon: FaVimeo, label: 'Vimeo' },
    { name: 'soundcloud', icon: FaSoundcloud, label: 'SoundCloud' },
    { name: 'spotify', icon: FaSpotify, label: 'Spotify' },
    { name: 'apple', icon: FaApple, label: 'Apple' },
    { name: 'google', icon: FaGoogle, label: 'Google' },
    { name: 'paypal', icon: FaPaypal, label: 'PayPal' },
  ],
  'الموقع': [
    { name: 'map-marker', icon: FaMapMarkerAlt, label: 'موقع' },
    { name: 'map', icon: FaMap, label: 'خريطة' },
    { name: 'globe', icon: FaGlobe, label: 'عالم' },
    { name: 'location-arrow', icon: FaLocationArrow, label: 'سهم موقع' },
  ],
  'الأنشطة': [
    { name: 'gamepad', icon: FaGamepad, label: 'لعبة' },
    { name: 'calendar', icon: FaCalendar, label: 'تقويم' },
    { name: 'clock', icon: FaClock, label: 'ساعة' },
    { name: 'trophy', icon: FaTrophy, label: 'كأس' },
    { name: 'medal', icon: FaMedal, label: 'ميدالية' },
    { name: 'award', icon: FaAward, label: 'جائزة' },
  ],
  'التحليلات': [
    { name: 'chart-bar', icon: FaChartBar, label: 'رسم بياني' },
    { name: 'eye', icon: FaEye, label: 'عرض' },
    { name: 'download', icon: FaDownload, label: 'تحميل' },
    { name: 'upload', icon: FaUpload, label: 'رفع' },
  ],
  'الإدارة': [
    { name: 'user-tie', icon: FaUserTie, label: 'موظف' },
    { name: 'cog', icon: FaCog, label: 'إعدادات' },
    { name: 'lock', icon: FaLock, label: 'قفل' },
    { name: 'unlock', icon: FaUnlock, label: 'فتح' },
    { name: 'edit', icon: FaEdit, label: 'تعديل' },
    { name: 'trash', icon: FaTrash, label: 'حذف' },
  ],
  'الملفات': [
    { name: 'folder', icon: FaFolder, label: 'مجلد' },
    { name: 'folder-open', icon: FaFolderOpen, label: 'مجلد مفتوح' },
    { name: 'file', icon: FaFile, label: 'ملف' },
    { name: 'file-alt', icon: FaFileAlt, label: 'ملف نصي' },
    { name: 'archive', icon: FaArchive, label: 'أرشيف' },
  ],
  'أخرى': [
    { name: 'star', icon: FaStar, label: 'نجمة' },
    { name: 'heart', icon: FaHeart, label: 'قلب' },
    { name: 'gift', icon: FaGift, label: 'هدية' },
    { name: 'bolt', icon: FaBolt, label: 'برق' },
    { name: 'book', icon: FaBook, label: 'كتاب' },
    { name: 'graduation-cap', icon: FaGraduationCap, label: 'تخرج' },
  ]
};

const IconSelector = ({ value, onChange, label = 'اختر الأيقونة' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('عام');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedIcon = Object.values(iconCategories)
    .flat()
    .find(icon => icon.name === value);

  const filteredIcons = iconCategories[selectedCategory]?.filter(icon =>
    icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSelect = (iconName) => {
    onChange(iconName);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="input-field flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {selectedIcon ? (
              <>
                <selectedIcon.icon className="text-2xl" />
                <span>{selectedIcon.label}</span>
              </>
            ) : (
              <span className="text-gray-500">اختر أيقونة...</span>
            )}
          </div>
          <span className="text-gray-400">▼</span>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b">
              <input
                type="text"
                placeholder="ابحث عن أيقونة..."
                className="input-field text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Tabs */}
            <div className="flex overflow-x-auto border-b bg-gray-50">
              {Object.keys(iconCategories).map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category);
                    setSearchTerm('');
                  }}
                  className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${selectedCategory === category
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-blue-600'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Icons Grid */}
            <div className="p-4 overflow-y-auto max-h-64">
              <div className="grid grid-cols-4 gap-3">
                {filteredIcons.map((icon) => {
                  const IconComponent = icon.icon;
                  return (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => handleSelect(icon.name)}
                      className={`p-3 rounded-lg border-2 transition-all hover:bg-blue-50 hover:border-blue-300 ${value === icon.name
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200'
                        }`}
                      title={icon.label}
                    >
                      <IconComponent className="text-2xl mx-auto text-gray-700" />
                      <p className="text-xs mt-1 text-center text-gray-600 truncate">
                        {icon.label}
                      </p>
                    </button>
                  );
                })}
              </div>
              {filteredIcons.length === 0 && (
                <p className="text-center text-gray-500 py-4">لا توجد أيقونات</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IconSelector;

// Export icon mapping for use in other components
export const getIconComponent = (iconName) => {
  const icon = Object.values(iconCategories)
    .flat()
    .find(i => i.name === iconName);
  return icon ? icon.icon : null;
};

export const renderIcon = (iconName, className = 'text-2xl') => {
  const IconComponent = getIconComponent(iconName);
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
};

