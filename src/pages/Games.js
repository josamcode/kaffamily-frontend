import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import {
  FaGamepad, FaSearch, FaHashtag, FaUsers, FaFileAlt, FaPuzzlePiece,
  FaTrophy, FaClock, FaUser, FaArrowLeft
} from 'react-icons/fa';

const Games = () => {
  const [games, setGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const { isAdmin } = useAuth();

  const apiServerUrl = process.env.REACT_APP_API_SERVER_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchGames();
    fetchSettings();
  }, [searchTerm]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await api.get('/games', { params });
      setGames(response.data.games || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const getGameTypeInfo = (type) => {
    const primaryColor = settings?.colors?.primary || '#3B82F6';
    const secondaryColor = settings?.colors?.secondary || primaryColor;
    const textColor = settings?.colors?.text || '#111827';

    // Helper function to lighten color (returns rgba for better opacity control)
    const getLightColor = (color, opacity) => {
      // Convert hex to rgb
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const primaryLight = getLightColor(primaryColor, 0.1); // 10% opacity
    const primaryBorder = getLightColor(primaryColor, 0.3); // 30% opacity

    switch (type) {
      case 'number_guess':
        return {
          icon: FaHashtag,
          label: 'تخمين الأرقام',
          primaryColor: primaryColor,
          secondaryColor: secondaryColor,
          bgColor: primaryLight,
          borderColor: primaryBorder,
          textColor: textColor
        };
      case 'static':
        return {
          icon: FaFileAlt,
          label: 'معلومات ثابتة',
          primaryColor: primaryColor,
          secondaryColor: secondaryColor,
          bgColor: primaryLight,
          borderColor: primaryBorder,
          textColor: textColor
        };
      case 'registration':
        return {
          icon: FaUsers,
          label: 'يتطلب تسجيل',
          primaryColor: primaryColor,
          secondaryColor: secondaryColor,
          bgColor: primaryLight,
          borderColor: primaryBorder,
          textColor: textColor
        };
      case 'custom':
        return {
          icon: FaPuzzlePiece,
          label: 'مخصص',
          primaryColor: primaryColor,
          secondaryColor: secondaryColor,
          bgColor: primaryLight,
          borderColor: primaryBorder,
          textColor: textColor
        };
      default:
        return {
          icon: FaGamepad,
          label: 'لعبة',
          primaryColor: primaryColor,
          secondaryColor: secondaryColor,
          bgColor: primaryLight,
          borderColor: primaryBorder,
          textColor: textColor
        };
    }
  };

  if (loading) {
    return <Loading fullScreen message="جاري تحميل الألعاب..." />;
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div>
          <h1
            className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 flex items-center gap-2 md:gap-3"
            style={{ color: settings?.colors?.text || '#111827' }}
          >
            <FaGamepad className="text-xl md:text-4xl" style={{ color: settings?.colors?.primary || '#3B82F6' }} />
            <span className="hidden sm:inline">الألعاب والأنشطة</span>
            <span className="sm:hidden">الألعاب</span>
          </h1>
          <p className="text-sm md:text-base" style={{ color: settings?.colors?.text || '#4B5563', opacity: 0.7 }}>
            استمتع بمجموعة متنوعة من الألعاب التفاعلية
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/admin/games"
            className="px-4 py-2 md:px-6 md:py-3 text-white rounded-lg md:rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 text-sm md:text-base"
            style={{
              backgroundColor: settings?.colors?.primary || '#1F2937',
              color: '#FFFFFF'
            }}
            onMouseEnter={(e) => {
              const color = settings?.colors?.primary || '#1F2937';
              e.target.style.backgroundColor = color;
              e.target.style.filter = 'brightness(0.9)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = settings?.colors?.primary || '#1F2937';
              e.target.style.filter = 'brightness(1)';
            }}
          >
            <FaGamepad className="text-sm md:text-base" />
            <span className="hidden sm:inline">إدارة الألعاب</span>
            <span className="sm:hidden">إدارة</span>
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6 md:mb-8">
        <div className="relative max-w-md">
          <FaSearch
            className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-base md:text-lg"
            style={{ color: settings?.colors?.text || '#9CA3AF', opacity: 0.5 }}
          />
          <input
            type="text"
            placeholder="ابحث عن لعبة..."
            className="w-full pr-10 md:pr-12 pl-3 md:pl-4 py-3 md:py-4 border-2 rounded-lg md:rounded-xl text-sm md:text-lg transition-colors"
            style={{
              borderColor: settings?.colors?.primary ? `${settings.colors.primary}30` : '#E5E7EB',
              color: settings?.colors?.text || '#111827'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = settings?.colors?.primary || '#3B82F6';
              e.target.style.boxShadow = `0 0 0 3px ${settings?.colors?.primary || '#3B82F6'}20`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = settings?.colors?.primary ? `${settings.colors.primary}30` : '#E5E7EB';
              e.target.style.boxShadow = 'none';
            }}
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Games Grid */}
      {games.length === 0 ? (
        <div className="text-center py-12 md:py-20">
          <FaGamepad className="text-6xl md:text-8xl text-gray-300 mx-auto mb-4 md:mb-6" />
          <p className="text-gray-600 text-lg md:text-2xl font-semibold mb-1 md:mb-2">لا توجد ألعاب حالياً</p>
          <p className="text-gray-500 text-sm md:text-base">جرّب البحث بكلمات مختلفة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {games.map((game) => {
            const typeInfo = getGameTypeInfo(game.type);
            const IconComponent = typeInfo.icon;
            const isNumberGuess = game.type === 'number_guess';

            return (
              <Link
                key={game._id}
                to={`/games/${game._id}`}
                className="group relative bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2"
                style={{ borderColor: typeInfo.borderColor }}
              >
                {/* Cover Image or Gradient Background */}
                {game.coverImage ? (
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    <img
                      src={`${apiServerUrl}${game.coverImage}`}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  </div>
                ) : (
                  <div
                    className="relative h-48 md:h-56 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${typeInfo.primaryColor} 0%, ${typeInfo.secondaryColor || typeInfo.primaryColor} 100%)`
                    }}
                  >
                    <IconComponent className="text-6xl md:text-8xl text-white/30" />
                    {isNumberGuess && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-5xl md:text-6xl font-bold text-white/40">?</div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>
                )}

                {/* Game Type Badge */}
                <div className="absolute top-3 md:top-4 right-3 md:right-4">
                  <div
                    className="flex items-center gap-1 md:gap-2 px-2 py-1 md:px-4 md:py-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border-2"
                    style={{ borderColor: isNumberGuess ? typeInfo.primaryColor : typeInfo.borderColor }}
                  >
                    <IconComponent
                      className="text-xs md:text-sm"
                      style={{ color: typeInfo.primaryColor }}
                    />
                    <span
                      className="text-xs font-bold"
                      style={{ color: typeInfo.primaryColor }}
                    >
                      {typeInfo.label}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 md:p-6">
                  {/* Title */}
                  <h3
                    className="text-lg md:text-2xl font-bold mb-2 md:mb-3 transition-colors"
                    style={{ color: typeInfo.textColor }}
                  >
                    {game.title}
                  </h3>

                  {/* Description */}
                  {game.description && (
                    <p
                      className="mb-3 md:mb-4 line-clamp-2 text-xs md:text-sm leading-relaxed"
                      style={{ color: typeInfo.textColor, opacity: 0.7 }}
                    >
                      {game.description}
                    </p>
                  )}

                  {/* Number Guess Game Special Info */}
                  {isNumberGuess && game.numberGuessGameId && (
                    <div
                      className="mb-3 md:mb-4 p-3 md:p-4 rounded-lg md:rounded-xl border"
                      style={{
                        backgroundColor: typeInfo.bgColor,
                        borderColor: typeInfo.borderColor
                      }}
                    >
                      <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                        <FaHashtag className="text-xs md:text-sm" style={{ color: typeInfo.primaryColor }} />
                        <span
                          className="text-xs md:text-sm font-semibold"
                          style={{ color: typeInfo.primaryColor }}
                        >
                          لعبة تخمين الأرقام
                        </span>
                      </div>
                      <p
                        className="text-xs"
                        style={{ color: typeInfo.primaryColor }}
                      >
                        استخدم الأدلة المتاحة لتخمين الرقم الصحيح
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {game.tags && game.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4">
                      {game.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 md:px-3 md:py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {game.tags.length > 3 && (
                        <span className="px-2 py-0.5 md:px-3 md:py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                          +{game.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer Info */}
                  <div className="flex items-center justify-between pt-3 md:pt-4 border-t" style={{ borderColor: typeInfo.borderColor }}>
                    <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm" style={{ color: typeInfo.textColor, opacity: 0.6 }}>
                      {game.type === 'registration' && game.participants && (
                        <div className="flex items-center gap-1">
                          <FaUsers className="text-xs" style={{ color: typeInfo.primaryColor }} />
                          <span className="font-medium">{game.participants.length}</span>
                        </div>
                      )}
                      {game.createdBy && (
                        <div className="flex items-center gap-1">
                          <FaUser className="text-xs" style={{ color: typeInfo.textColor, opacity: 0.4 }} />
                          <span className="text-xs hidden sm:inline">{game.createdBy.name}</span>
                        </div>
                      )}
                    </div>
                    <div
                      className="flex items-center gap-1 md:gap-2 transition-colors"
                      style={{ color: typeInfo.primaryColor }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      <span className="text-xs md:text-sm font-semibold">ابدأ اللعب</span>
                      <FaArrowLeft className="text-xs group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div
                  className="absolute inset-0 transition-all duration-300 pointer-events-none"
                  style={{
                    background: `linear-gradient(to top, transparent 0%, transparent 100%)`,
                  }}
                  onMouseEnter={(e) => {
                    const color = typeInfo.primaryColor;
                    e.target.style.background = `linear-gradient(to top, ${color}08 0%, transparent 100%)`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(to top, transparent 0%, transparent 100%)';
                  }}
                ></div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Games;

