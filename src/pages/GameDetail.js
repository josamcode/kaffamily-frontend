import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useContentProtection } from '../hooks/useContentProtection';
import Loading from '../components/Loading';
import {
  FaArrowRight, FaHashtag, FaCheckCircle, FaTimes, FaTrophy,
  FaLightbulb, FaKey, FaGamepad, FaExclamationCircle
} from 'react-icons/fa';

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [guessNumber, setGuessNumber] = useState('');
  const [guessResult, setGuessResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [settings, setSettings] = useState(null);
  const { user } = useAuth();

  // Enable content protection for this page
  const protectedContainerRef = useContentProtection(true);

  useEffect(() => {
    fetchGame();
    fetchSettings();
  }, [id]);

  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 5000); // Hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  const fetchGame = async () => {
    try {
      const response = await api.get(`/games/${id}`);
      setGame(response.data.game);
    } catch (error) {
      console.error('Error fetching game:', error);
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

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!invitationCode) {
      alert('يرجى إدخال رمز الدعوة');
      return;
    }

    setRegistering(true);
    try {
      await api.post(`/games/${id}/register`, { invitationCode });
      alert('تم التسجيل في اللعبة بنجاح!');
      fetchGame();
      setInvitationCode('');
    } catch (error) {
      alert('خطأ في التسجيل: ' + (error.response?.data?.message || error.message));
    } finally {
      setRegistering(false);
    }
  };

  const handleGuessSubmit = async (e) => {
    e.preventDefault();
    if (!guessNumber) {
      return;
    }

    try {
      const response = await api.post(`/games/${id}/guess`, { guess: guessNumber });
      const isCorrect = response.data.isCorrect;
      setGuessResult({
        success: isCorrect,
        message: response.data.message
      });
      setShowResult(true);

      // Show celebration if correct
      if (isCorrect) {
        setShowCelebration(true);
      }
    } catch (error) {
      setGuessResult({
        success: false,
        message: error.response?.data?.message || 'خطأ في التحقق من الرقم'
      });
      setShowResult(true);
    }
  };

  if (loading) {
    return <Loading fullScreen message="جاري تحميل اللعبة..." />;
  }

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-xl">اللعبة غير موجودة</p>
      </div>
    );
  }

  const isRegistered = user && game.participants?.some(p =>
    (typeof p === 'object' ? p._id : p) === user.id
  );

  const primaryColor = settings?.colors?.primary || '#3B82F6';
  const textColor = settings?.colors?.text || '#111827';
  const apiServerUrl = process.env.REACT_APP_API_SERVER_URL || 'http://localhost:5000';

  // Helper to get color with opacity
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: settings?.colors?.background || '#F9FAFB' }}
      ref={protectedContainerRef}
    >
      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div
            className="relative bg-white rounded-3xl shadow-2xl p-12 text-center transform pointer-events-auto"
            style={{
              animation: 'celebrate 0.6s ease-out',
              maxWidth: '500px',
              width: '90%'
            }}
          >
            {/* Confetti Effect */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][i % 5],
                    animationDelay: `${Math.random() * 0.5}s`,
                    animationDuration: `${1 + Math.random() * 1}s`
                  }}
                />
              ))}
            </div>

            {/* Celebration Content */}
            <div className="relative z-10">
              <div
                className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center animate-pulse"
                style={{ backgroundColor: getColorWithOpacity(primaryColor, 0.2) }}
              >
                <FaTrophy className="text-6xl" style={{ color: '#FFD700' }} />
              </div>
              <h2
                className="text-4xl font-bold mb-4"
                style={{ color: primaryColor }}
              >
                🎉 مبروك! 🎉
              </h2>
              <p
                className="text-xl mb-6"
                style={{ color: textColor }}
              >
                لقد خمنت الرقم الصحيح!
              </p>
              <button
                onClick={() => setShowCelebration(false)}
                className="px-8 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
                style={{ backgroundColor: primaryColor }}
              >
                رائع!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Protection Notice */}
      <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg text-xs z-40 shadow-lg">
        <p className="font-semibold">⚠️ محتوى محمي</p>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/games')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          style={{ color: textColor, opacity: 0.7 }}
        >
          <FaArrowRight className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">العودة إلى الألعاب</span>
        </button>

        {/* Main Game Card */}
        <div
          className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 max-w-5xl mx-auto"
          style={{ borderColor: getColorWithOpacity(primaryColor, 0.2) }}
        >
          {/* Cover Image */}
          {game.coverImage && (
            <div className="relative w-full h-80 overflow-hidden">
              <img
                src={`${apiServerUrl}${game.coverImage}`}
                alt={game.title}
                className="w-full h-full object-cover"
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          )}

          {/* Game Header */}
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1
                  className="text-5xl font-bold mb-4"
                  style={{ color: textColor }}
                >
                  {game.title}
                </h1>
                {game.description && (
                  <p
                    className="text-xl leading-relaxed mb-6"
                    style={{ color: textColor, opacity: 0.8 }}
                  >
                    {game.description}
                  </p>
                )}
              </div>
              {game.type === 'number_guess' && (
                <div
                  className="flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg flex-shrink-0"
                  style={{ backgroundColor: getColorWithOpacity(primaryColor, 0.1) }}
                >
                  <FaHashtag className="text-4xl" style={{ color: primaryColor }} />
                </div>
              )}
            </div>

            {/* Tags */}
            {game.tags && game.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {game.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: getColorWithOpacity(primaryColor, 0.1),
                      color: primaryColor
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Game Steps */}
            {game.steps && game.steps.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">خطوات اللعبة</h2>
                <div className="space-y-6">
                  {game.steps
                    .sort((a, b) => a.order - b.order)
                    .map((step, index) => (
                      <div
                        key={index}
                        className="relative bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Step Number Badge */}
                        <div className="absolute -top-4 -right-4 flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full font-bold text-xl shadow-lg">
                          {step.order}
                        </div>

                        <div className="pr-8">
                          {/* Step Image */}
                          {step.image && (
                            <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                              <img
                                src={step.image}
                                alt={step.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                                draggable="false"
                                onContextMenu={(e) => e.preventDefault()}
                              />
                              {/* Watermark overlay on images */}
                              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 pointer-events-none"></div>
                            </div>
                          )}

                          {/* Step Title */}
                          <h3 className="text-xl font-bold mb-2 text-gray-800">{step.title}</h3>

                          {/* Step Description */}
                          {step.description && (
                            <p className="text-gray-600 mb-4 leading-relaxed">{step.description}</p>
                          )}

                          {/* Step Action */}
                          {step.action === 'link' && step.actionData?.url && (
                            <a
                              href={step.actionData.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                              <span>فتح الرابط</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}

                          {step.action === 'form' && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <p className="text-blue-800 text-sm">نموذج تفاعلي - قيد التطوير</p>
                            </div>
                          )}

                          {step.action === 'quiz' && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                              <p className="text-purple-800 text-sm">اختبار تفاعلي - قيد التطوير</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Game Content */}
            {game.type === 'static' && game.content && !game.steps?.length && (
              <div className="prose max-w-none mb-6">
                {typeof game.content === 'string' ? (
                  <p>{game.content}</p>
                ) : (
                  <pre className="whitespace-pre-wrap">{JSON.stringify(game.content, null, 2)}</pre>
                )}
              </div>
            )}

            {/* Registration Form */}
            {game.type === 'registration' && user && (
              <div className="border-t pt-6 mt-6">
                {isRegistered ? (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    أنت مسجل بالفعل في هذه اللعبة
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">رمز الدعوة</label>
                      <input
                        type="text"
                        required
                        className="input-field"
                        value={invitationCode}
                        onChange={(e) => setInvitationCode(e.target.value)}
                        placeholder="أدخل رمز الدعوة"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={registering}
                      className="btn-primary"
                    >
                      {registering ? 'جاري التسجيل...' : 'تسجيل في اللعبة'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {game.type === 'registration' && game.participants && game.participants.length > 0 && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-xl font-semibold mb-4">المشاركون ({game.participants.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {game.participants.map((participant, index) => (
                    <div key={index} className="text-gray-700">
                      {typeof participant === 'object' ? participant.name : 'مشارك'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Number Guess Game */}
            {game.type === 'number_guess' && (game.numberGuessGame || game.numberGuessGameId) && (
              <div className="border-t pt-8 mt-8" style={{ borderColor: getColorWithOpacity(primaryColor, 0.2) }}>
                {/* Game Instructions Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <FaHashtag className="text-3xl text-white" />
                    </div>
                    <div>
                      <h2
                        className="text-3xl font-bold mb-2"
                        style={{ color: textColor }}
                      >
                        لعبة تخمين الأرقام
                      </h2>
                      <p
                        className="text-lg"
                        style={{ color: textColor, opacity: 0.7 }}
                      >
                        استخدم التلميحات أدناه لتخمين الرقم الصحيح
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instructions and Hints */}
                {(() => {
                  const numberGuessData = game.numberGuessGame || game.numberGuessGameId;
                  return numberGuessData?.numberHints && numberGuessData.numberHints.length > 0 && (
                    <div className="mb-8 space-y-4">
                      <h3
                        className="text-2xl font-bold mb-6 flex items-center gap-3"
                        style={{ color: textColor }}
                      >
                        <FaLightbulb style={{ color: primaryColor }} />
                        التلميحات والتعليمات
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {numberGuessData.numberHints
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map((numberHint, index) => (
                            <div
                              key={index}
                              className="relative rounded-2xl p-6 shadow-lg border-2 transition-all hover:shadow-xl hover:-translate-y-1"
                              style={{
                                backgroundColor: getColorWithOpacity(primaryColor, 0.05),
                                borderColor: getColorWithOpacity(primaryColor, 0.2)
                              }}
                            >
                              {/* Order Badge */}
                              <div
                                className="absolute -top-4 -right-4 flex items-center justify-center w-14 h-14 rounded-full font-bold text-xl shadow-lg"
                                style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                              >
                                {(numberHint.order ?? index) + 1}
                              </div>

                              {/* Hint Content */}
                              <div className="pr-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <FaKey
                                    className="text-xl"
                                    style={{ color: primaryColor, opacity: 0.7 }}
                                  />
                                  <span
                                    className="text-sm font-semibold"
                                    style={{ color: primaryColor }}
                                  >
                                    تلميح {(numberHint.order ?? index) + 1}
                                  </span>
                                </div>
                                <p
                                  className="text-lg leading-relaxed"
                                  style={{ color: textColor }}
                                >
                                  {numberHint.hint}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Guess Input Section */}
                <div
                  className="rounded-2xl p-8 shadow-lg border-2"
                  style={{
                    backgroundColor: getColorWithOpacity(primaryColor, 0.03),
                    borderColor: getColorWithOpacity(primaryColor, 0.2)
                  }}
                >
                  <div className="text-center mb-6">
                    <h3
                      className="text-2xl font-bold mb-2"
                      style={{ color: textColor }}
                    >
                      أدخل الرقم المتوقع
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: textColor, opacity: 0.6 }}
                    >
                      استخدم التلميحات أعلاه لتخمين الرقم الصحيح
                    </p>
                  </div>

                  <form onSubmit={handleGuessSubmit} className="space-y-6">
                    <div>
                      {(() => {
                        const numberGuessData = game.numberGuessGame || game.numberGuessGameId;
                        const correctNumber = numberGuessData?.correctNumber || '';
                        return (
                          <>
                            <div className="relative">
                              <input
                                type="text"
                                className="w-full px-6 py-5 border-2 rounded-2xl text-center text-3xl font-mono transition-all focus:outline-none focus:ring-4"
                                style={{
                                  borderColor: showResult && guessResult?.success
                                    ? '#10B981'
                                    : showResult && !guessResult?.success
                                      ? '#EF4444'
                                      : getColorWithOpacity(primaryColor, 0.3),
                                  color: textColor,
                                  backgroundColor: '#FFFFFF',
                                  focusRingColor: getColorWithOpacity(primaryColor, 0.2)
                                }}
                                value={guessNumber}
                                onChange={(e) => {
                                  const number = e.target.value.replace(/[^0-9]/g, '');
                                  setGuessNumber(number);
                                  setShowResult(false);
                                }}
                                placeholder="أدخل الرقم هنا"
                                maxLength={correctNumber.length || 20}
                                onFocus={(e) => {
                                  e.target.style.borderColor = primaryColor;
                                  e.target.style.boxShadow = `0 0 0 4px ${getColorWithOpacity(primaryColor, 0.1)}`;
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = getColorWithOpacity(primaryColor, 0.3);
                                  e.target.style.boxShadow = 'none';
                                }}
                              />
                              {guessNumber && (
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                  <FaHashtag
                                    className="text-2xl"
                                    style={{ color: primaryColor, opacity: 0.5 }}
                                  />
                                </div>
                              )}
                            </div>
                            {correctNumber && (
                              <p
                                className="text-sm mt-3 text-center flex items-center justify-center gap-2"
                                style={{ color: textColor, opacity: 0.6 }}
                              >
                                <FaKey className="text-xs" />
                                يجب أن يكون الرقم {correctNumber.length} أرقام
                              </p>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    <button
                      type="submit"
                      disabled={!guessNumber}
                      className="w-full px-6 py-4 rounded-2xl font-bold text-xl text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                      style={{
                        backgroundColor: primaryColor,
                        color: '#FFFFFF'
                      }}
                      onMouseEnter={(e) => {
                        if (!e.target.disabled) {
                          e.target.style.filter = 'brightness(1.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.filter = 'brightness(1)';
                      }}
                    >
                      <span className="flex items-center justify-center gap-3">
                        <FaCheckCircle className="text-xl" />
                        التحقق من الرقم
                      </span>
                    </button>
                  </form>

                  {/* Result */}
                  {showResult && guessResult && (
                    <div
                      className={`mt-6 p-6 rounded-2xl border-2 shadow-lg transition-all ${guessResult.success
                        ? 'animate-pulse'
                        : 'animate-shake'
                        }`}
                      style={{
                        backgroundColor: guessResult.success
                          ? '#ECFDF5'
                          : '#FEF2F2',
                        borderColor: guessResult.success
                          ? '#10B981'
                          : '#EF4444'
                      }}
                    >
                      <div className="flex items-center justify-center gap-4 mb-4">
                        {guessResult.success ? (
                          <FaCheckCircle className="text-4xl text-green-600" />
                        ) : (
                          <FaTimes className="text-4xl text-red-600" />
                        )}
                        <p
                          className={`text-center font-bold text-xl ${guessResult.success ? 'text-green-800' : 'text-red-800'
                            }`}
                        >
                          {guessResult.message}
                        </p>
                      </div>
                      {!guessResult.success && (
                        <button
                          onClick={() => {
                            setShowResult(false);
                            setGuessNumber('');
                          }}
                          className="w-full px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                          style={{
                            backgroundColor: getColorWithOpacity(primaryColor, 0.1),
                            color: primaryColor
                          }}
                        >
                          <span className="flex items-center justify-center gap-2">
                            <FaExclamationCircle />
                            المحاولة مرة أخرى
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Celebration Animation Styles */}
      <style>{`
        @keyframes celebrate {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) rotate(5deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default GameDetail;

