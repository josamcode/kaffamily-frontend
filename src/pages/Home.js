import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { renderIcon } from '../components/IconSelector';
import {
  FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube,
  FaArrowRight, FaCheckCircle, FaStar, FaAward, FaHandshake
} from 'react-icons/fa';

// Hero Images Display Component - 4 Images Only
const HeroImagesDisplay = ({ images, apiServerUrl, heroSettings }) => {
  // Filter out empty images and limit to 4
  const displayImages = (images || []).filter(img => img && img.trim() !== '').slice(0, 4);

  console.log('displayImages', displayImages);

  // If we have less than 4 images, we'll still display them in a grid
  const imageCount = displayImages.length;

  // Always use 2x2 grid for 4 images, or adjust for fewer
  const getGridCols = () => {
    if (imageCount === 1) return 'grid-cols-1';
    if (imageCount === 2) return 'grid-cols-2';
    if (imageCount === 3) return 'grid-cols-2';
    return 'grid-cols-2'; // 4 images = 2x2 grid
  };

  const gridCols = getGridCols();

  return (
    <div className="relative w-full h-full">
      {/* Grid of Images - 2x2 for 4 images */}
      <div className={`grid ${gridCols} gap-1 bg-gray-900 h-[90vh]`}>
        {displayImages.map((img, index) => (
          <div
            key={index}
            className="relative overflow-hidden group rounded-lg"
          >
            <img
              src={`${apiServerUrl}/${img}`}
              alt={`Hero ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 rounded-lg"
              loading="lazy"
              style={{ filter: 'brightness(0.4)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Dark Overlay covering full section */}
      <div
        className="absolute inset-0 bg-black flex items-center justify-center"
        style={{
          opacity: heroSettings?.overlayOpacity ?? 0.5
        }}
      />

      {/* Headline with full opacity */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center px-4" style={{ opacity: 1 }}>
          <h1
            className="text-6xl md:text-8xl lg:text-9xl text-white mb-4 tracking-wider"
            style={{
              fontFamily: '"Playwrite NO", cursive',
              fontOpticalSizing: 'auto',
              fontWeight: 400,
              fontStyle: 'normal',
              letterSpacing: '0.1em',
              textShadow: '0 4px 20px rgba(0,0,0,0.8)',
              opacity: 1
            }}
          >
            {heroSettings?.headline || 'KAF'}
          </h1>
          {heroSettings?.subtitle && (
            <p
              className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mt-4"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
            >
              {heroSettings.subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [settings, setSettings] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapEmbedUrl, setMapEmbedUrl] = useState(null);

  // Get Google Maps embed URL - Convert goo.gl or maps.app.goo.gl to embed URL
  // Note: Short URLs (goo.gl, maps.app.goo.gl) cannot be directly converted to embed URLs
  // We'll return null for short URLs and show a button to open in new window instead
  const getGoogleMapsEmbedUrl = (mapUrl) => {
    if (!mapUrl) return null;

    // If it's already an embed URL, return it
    if (mapUrl.includes('embed')) return mapUrl;

    // Short URLs (goo.gl, maps.app.goo.gl) cannot be embedded due to X-Frame-Options
    // Return null to show a button instead
    if (mapUrl.includes('goo.gl') || mapUrl.includes('maps.app.goo.gl')) {
      return null;
    }

    // Regular Google Maps URL - try to extract coordinates
    if (mapUrl.includes('google.com/maps')) {
      const coords = mapUrl.match(/@([\d.-]+),([\d.-]+)/);
      if (coords) {
        const lat = coords[1];
        const lng = coords[2];
        const zoom = mapUrl.match(/[?&]z=(\d+)/)?.[1] || '15';
        return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${lat}%2C${lng}!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus&zoom=${zoom}`;
      }

      // Try to extract place ID
      const placeIdMatch = mapUrl.match(/place[\/=]([^\/\?&]+)/);
      if (placeIdMatch) {
        const placeId = placeIdMatch[1];
        // Note: This requires a Google Maps API key, which we don't have
        // Return null to show button instead
        return null;
      }
    }

    return null;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, announcementsRes, quickActionsRes, collectionsRes] = await Promise.all([
        api.get('/settings'),
        api.get('/announcements'),
        api.get('/quick-actions'),
        api.get('/collections')
      ]);

      const settingsData = settingsRes.data.settings;
      setSettings(settingsData);
      setAnnouncements(announcementsRes.data.announcements || []);
      setQuickActions(quickActionsRes.data.actions || []);

      // Process map URL
      if (settingsData?.location?.mapUrl) {
        const embedUrl = getGoogleMapsEmbedUrl(settingsData.location.mapUrl);
        setMapEmbedUrl(embedUrl);
      }

      // Get hero images from settings (4 images controlled by admin)
      const heroImagesFromSettings = settingsData?.hero?.images || [];
      setHeroImages(heroImagesFromSettings);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="جاري تحميل الصفحة..." />;
  }

  if (error) {
    return <Error message={error} onRetry={fetchData} fullScreen />;
  }

  const heroSettings = settings?.hero || {};
  const aboutSettings = settings?.about || {};
  const locationSettings = settings?.location || {};
  const metrics = settings?.metrics || {};
  const colors = settings?.colors || {};

  const apiServerUrl = process.env.REACT_APP_API_SERVER_URL || 'http://localhost:5000';

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section - Grid Layout */}
      {heroSettings.enabled !== false && (
        <section className="relative min-h-[90vh] overflow-hidden">
          {heroImages.length > 0 ? (
            <HeroImagesDisplay images={heroImages} apiServerUrl={apiServerUrl} heroSettings={heroSettings} />
          ) : (
            <div className="relative w-full h-[90vh] bg-gradient-to-br from-gray-800 to-gray-900">
              {/* Dark Overlay */}
              <div
                className="absolute inset-0 bg-black flex items-center justify-center"
                style={{
                  opacity: heroSettings.overlayOpacity ?? 0.5
                }}
              />
              {/* Headline */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center px-4">
                  <h1
                    className="text-6xl md:text-8xl lg:text-9xl text-white mb-4 tracking-wider"
                    style={{
                      fontFamily: '"Playwrite NO", cursive',
                      fontOpticalSizing: 'auto',
                      fontWeight: 400,
                      fontStyle: 'normal',
                      letterSpacing: '0.1em',
                      textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                      opacity: 1
                    }}
                  >
                    {heroSettings.headline || 'KAF'}
                  </h1>
                  {heroSettings.subtitle && (
                    <p
                      className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mt-4"
                      style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                    >
                      {heroSettings.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Quick Actions - Modern Card Design */}
      {settings?.sections?.quickActions !== false && quickActions.length > 0 && (settings?.quickActions?.enabled !== false) && (
        <section
          className="py-16"
          style={{ backgroundColor: settings?.colors?.background || '#F9FAFB' }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ color: settings?.colors?.text || '#111827' }}
              >
                {settings?.quickActions?.title || 'إجراءات سريعة'}
              </h2>
              <p
                className="text-xl"
                style={{ color: settings?.colors?.text || '#4B5563', opacity: 0.7 }}
              >
                {settings?.quickActions?.subtitle || 'استكشف خدماتنا ومواردنا'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Link
                  key={action._id}
                  to={action.link}
                  target={action.linkType === 'external' ? '_blank' : '_self'}
                  className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                >
                  <div className="relative p-8 text-center">
                    {/* Icon */}
                    {action.icon && (
                      <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300 flex justify-center">
                        <div
                          className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-3xl shadow-md"
                          style={{ backgroundColor: settings?.colors?.primary || '#3B82F6' }}
                        >
                          {renderIcon(action.icon, 'text-3xl')}
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <h3
                      className="text-2xl font-bold mb-3 transition-colors"
                      style={{
                        color: settings?.colors?.text || '#111827'
                      }}
                    >
                      {action.title}
                    </h3>
                    {action.description && (
                      <p
                        className="mb-4 line-clamp-2"
                        style={{ color: settings?.colors?.text || '#4B5563', opacity: 0.8 }}
                      >
                        {action.description}
                      </p>
                    )}

                    {/* Arrow */}
                    <div
                      className="flex items-center justify-center font-semibold group-hover:translate-x-2 transition-transform"
                      style={{ color: settings?.colors?.primary || '#3B82F6' }}
                    >
                      <span>اكتشف المزيد</span>
                      <FaArrowRight className="mr-2" />
                    </div>
                  </div>

                  {/* Decorative Element */}
                  <div
                    className="absolute bottom-0 left-0 w-full h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                    style={{ backgroundColor: settings?.colors?.primary || '#3B82F6' }}
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section - Image and Text with Icons */}
      {aboutSettings.enabled !== false && (
        <section
          className="py-16"
          style={{ backgroundColor: settings?.colors?.background || '#FFFFFF' }}
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Image Side */}
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  {heroImages.length > 0 ? (
                    <img
                      src={`${apiServerUrl}/${heroImages[0]}`}
                      alt="About KAF"
                      className="w-full h-[500px] object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-[500px] flex items-center justify-center"
                      style={{ backgroundColor: settings?.colors?.primary || '#3B82F6' }}
                    >
                      <FaUsers className="text-9xl text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                {/* Decorative Elements */}
                <div
                  className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-20 blur-3xl"
                  style={{ backgroundColor: settings?.colors?.primary || '#3B82F6' }}
                />
                <div
                  className="absolute -top-6 -left-6 w-32 h-32 rounded-full opacity-20 blur-3xl"
                  style={{ backgroundColor: settings?.colors?.primary || '#3B82F6' }}
                />
              </div>

              {/* Text Side */}
              <div>
                <h2
                  className="text-4xl md:text-5xl font-bold mb-6"
                  style={{ color: settings?.colors?.text || '#111827' }}
                >
                  {settings?.about?.title || 'من نحن'}
                </h2>
                <p
                  className="text-lg leading-relaxed mb-8"
                  style={{ color: settings?.colors?.text || '#374151', opacity: 0.9 }}
                >
                  {aboutSettings.content || 'KAF'}
                </p>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div
                    className="rounded-xl p-6 border-l-4"
                    style={{
                      backgroundColor: `${settings?.colors?.primary || '#3B82F6'}15`,
                      borderColor: settings?.colors?.primary || '#3B82F6'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <FaUsers
                        className="text-3xl"
                        style={{ color: settings?.colors?.primary || '#3B82F6' }}
                      />
                      <span
                        className="text-3xl font-bold"
                        style={{ color: settings?.colors?.text || '#111827' }}
                      >
                        {metrics.servedPeople || 150}+
                      </span>
                    </div>
                    <p
                      className="font-medium"
                      style={{ color: settings?.colors?.text || '#374151' }}
                    >
                      {settings?.metrics?.servedPeopleLabel || 'عدد افراد العيلة'}
                    </p>
                  </div>
                  <div
                    className="rounded-xl p-6 border-l-4"
                    style={{
                      backgroundColor: `${settings?.colors?.primary || '#3B82F6'}15`,
                      borderColor: settings?.colors?.primary || '#3B82F6'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <FaHandshake
                        className="text-3xl"
                        style={{ color: settings?.colors?.primary || '#3B82F6' }}
                      />
                      <span
                        className="text-3xl font-bold"
                        style={{ color: settings?.colors?.text || '#111827' }}
                      >
                        {metrics.staffCount || 0}+
                      </span>
                    </div>
                    <p
                      className="font-medium"
                      style={{ color: settings?.colors?.text || '#374151' }}
                    >
                      {settings?.metrics?.staffCountLabel || 'عدد خدام الاجتماع'}
                    </p>
                  </div>
                </div>

                {/* Feature Icons */}
                {settings?.about?.features && settings.about.features.length > 0 && (
                  <div className="flex flex-wrap gap-6">
                    {settings.about.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${settings?.colors?.primary || '#3B82F6'}20` }}
                        >
                          {renderIcon(feature.icon, 'text-xl', { color: settings?.colors?.primary || '#3B82F6' })}
                        </div>
                        <span
                          className="font-medium"
                          style={{ color: settings?.colors?.text || '#374151' }}
                        >
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Announcements */}
      {settings?.sections?.announcements !== false && announcements.length > 0 && (settings?.announcements?.enabled !== false) && (
        <section
          className="py-16"
          style={{ backgroundColor: settings?.colors?.background || '#FFFFFF' }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ color: settings?.colors?.text || '#111827' }}
              >
                {settings?.announcements?.title || 'الإعلانات'}
              </h2>
              <p
                className="text-xl"
                style={{ color: settings?.colors?.text || '#4B5563', opacity: 0.7 }}
              >
                {settings?.announcements?.subtitle || 'تابع آخر الأخبار والفعاليات'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {announcements.map((announcement) => (
                <div
                  key={announcement._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
                >
                  {announcement.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={`${apiServerUrl}${announcement.image}`}
                        // src={`${announcement.image}`}
                        alt={announcement.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <FaCalendarAlt style={{ color: settings?.colors?.primary || '#3B82F6' }} />
                      <span
                        className="text-sm font-semibold"
                        style={{ color: settings?.colors?.primary || '#3B82F6' }}
                      >
                        {announcement.type === 'meeting' && 'اجتماع'}
                        {announcement.type === 'trip' && 'رحلة'}
                        {announcement.type === 'outing' && 'نزهة'}
                        {announcement.type === 'general' && 'عام'}
                      </span>
                    </div>
                    <h3
                      className="text-2xl font-bold mb-3"
                      style={{ color: settings?.colors?.text || '#111827' }}
                    >
                      {announcement.title}
                    </h3>
                    <p
                      className="mb-4 line-clamp-3"
                      style={{ color: settings?.colors?.text || '#4B5563', opacity: 0.8 }}
                    >
                      {announcement.content}
                    </p>
                    {announcement.expiresAt && (
                      <p
                        className="text-sm"
                        style={{ color: settings?.colors?.text || '#6B7280', opacity: 0.6 }}
                      >
                        الميعاد: {new Date(announcement.expiresAt).toLocaleDateString('ar-EG')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social Links */}
      {settings?.sections?.social !== false && settings?.social?.links && settings.social.links.length > 0 && (
        <section
          className="py-16 relative overflow-hidden"
          style={{ backgroundColor: settings?.colors?.primary || '#1F2937' }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-10">
              <h3
                className="text-4xl md:text-5xl font-bold text-white mb-4"
                style={{
                  letterSpacing: '0.05em'
                }}
              >
                {settings?.social?.title || 'تابعنا على'}
              </h3>
              <div className="w-24 h-1 bg-white/30 mx-auto mb-8"></div>
            </div>

            <div className="flex justify-center gap-6 flex-wrap max-w-4xl mx-auto">
              {settings.social.links.map((link, index) => {
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 border border-white/20 hover:border-white/40 shadow-lg hover:shadow-2xl"
                    title={link.name || ''}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                      {renderIcon(link.icon || 'FaGlobe', 'text-2xl md:text-3xl')}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                      {link.name || 'رابط'}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Decorative Elements */}
            <div className="mt-12 text-center">
              <p className="text-white/70 text-sm">
                تواصل معنا عبر منصاتنا الاجتماعية
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Location - Full Page Google Maps */}
      {settings?.sections?.location !== false && locationSettings?.enabled !== false && locationSettings && (locationSettings.name || locationSettings.address || locationSettings.mapUrl) && (
        <section className="relative w-full py-16">
          {locationSettings.mapUrl ? (
            <div
              className="w-full h-full flex items-center justify-center"
            // style={{ backgroundColor: settings?.colors?.background || '#F3F4F6' }}
            >
              <div className="text-center max-w-2xl px-4">
                <FaMapMarkerAlt
                  className="text-6xl mx-auto mb-6"
                  style={{ color: settings?.colors?.primary || '#3B82F6' }}
                />
                <h3
                  className="text-3xl font-bold mb-4"
                  style={{ color: settings?.colors?.text || '#111827' }}
                >
                  الموقع
                </h3>
                {locationSettings.name && (
                  <p
                    className="text-xl font-semibold mb-2"
                    style={{ color: settings?.colors?.text || '#1F2937' }}
                  >
                    {locationSettings.name}
                  </p>
                )}
                {locationSettings.address && (
                  <p
                    className="mb-6 text-lg"
                    style={{ color: settings?.colors?.text || '#4B5563', opacity: 0.8 }}
                  >
                    {locationSettings.address}
                  </p>
                )}
                <a
                  href={locationSettings.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-opacity hover:opacity-90 shadow-lg"
                  style={{ backgroundColor: settings?.colors?.primary || '#3B82F6' }}
                >
                  <span>فتح في Google Maps</span>
                  <FaArrowRight />
                </a>
                <p
                  className="mt-4 text-sm"
                  style={{ color: settings?.colors?.text || '#6B7280', opacity: 0.7 }}
                >
                  انقر على الزر أعلاه لفتح الخريطة في نافذة جديدة
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <FaMapMarkerAlt className="text-6xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-xl">لا توجد خريطة متاحة</p>
              </div>
            </div>
          )}

          {/* Location Info Overlay - Only show if map is embedded */}
          {mapEmbedUrl && (locationSettings.name || locationSettings.address) && (
            <div className="absolute bottom-8 left-8 right-8 md:left-auto md:right-8 md:w-96 bg-white rounded-xl shadow-2xl p-6 z-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="text-white text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">الموقع</h3>
                  {locationSettings.name && (
                    <p className="text-lg font-semibold text-gray-800 mb-2">{locationSettings.name}</p>
                  )}
                  {locationSettings.address && (
                    <p className="text-gray-600 mb-4">{locationSettings.address}</p>
                  )}
                  {locationSettings.mapUrl && (
                    <a
                      href={locationSettings.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      <span>فتح في Google Maps</span>
                      <FaArrowRight />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Home;
