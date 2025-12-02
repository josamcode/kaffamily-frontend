import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  FaGamepad, FaPlus, FaEdit, FaTrash, FaExternalLinkAlt, FaUsers, FaFileAlt,
  FaListOl, FaImage, FaLink, FaTimes, FaArrowUp, FaArrowDown, FaCheckCircle
} from 'react-icons/fa';

const AdminGames = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'static',
    coverImage: '',
    tags: '',
    teamInvitationCode: '',
    isActive: true,
    content: '',
    steps: [],
    correctNumber: '',
    hints: []
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await api.get('/games/all');
      setGames(response.data.games || []);
    } catch (error) {
      showToast('خطأ في جلب الألعاب', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingGame(null);
    setFormData({
      title: '',
      description: '',
      type: 'static',
      coverImage: '',
      tags: '',
      teamInvitationCode: '',
      isActive: true,
      content: '',
      steps: [],
      numberHints: []
    });
    setShowModal(true);
  };

  const handleEdit = async (game) => {
    setEditingGame(game);

    // Fetch number guess game data if it's a number guess game
    let numberHints = [];
    if (game.type === 'number_guess' && game.numberGuessGameId) {
      try {
        const response = await api.get(`/games/${game._id}`);
        const gameData = response.data.game;

        // Check both possible locations for numberGuessGame data
        const numberGuessData = gameData?.numberGuessGame ||
          (typeof gameData?.numberGuessGameId === 'object' ? gameData.numberGuessGameId : null);

        if (numberGuessData?.numberHints) {
          // Sort by order and ensure we have the correct structure
          numberHints = numberGuessData.numberHints
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(nh => ({
              number: nh.number || '',
              hint: nh.hint || '',
              order: nh.order !== undefined ? nh.order : 0
            }));
        }
      } catch (error) {
        console.error('Error fetching number guess game:', error);
      }
    }

    setFormData({
      title: game.title,
      description: game.description || '',
      type: game.type,
      coverImage: game.coverImage || '',
      tags: game.tags?.join(', ') || '',
      teamInvitationCode: game.teamInvitationCode || '',
      isActive: game.isActive,
      content: typeof game.content === 'string' ? game.content : JSON.stringify(game.content, null, 2),
      steps: game.steps && game.steps.length > 0 ? [...game.steps] : [],
      numberHints
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      let content = {};
      if (formData.content) {
        try {
          content = JSON.parse(formData.content);
        } catch {
          content = { text: formData.content };
        }
      }

      const gameData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        coverImage: formData.coverImage,
        tags,
        isActive: formData.isActive,
        content,
        steps: formData.steps || []
      };

      // For number guess game, calculate correctNumber from numberHints
      if (formData.type === 'number_guess') {
        const numberHints = formData.numberHints || [];
        const correctNumber = numberHints.map(nh => nh.number).join('');
        gameData.correctNumber = correctNumber;
        gameData.numberHints = numberHints.map((nh, index) => ({
          number: nh.number,
          hint: nh.hint,
          order: index
        }));
      }

      if (formData.type === 'registration') {
        gameData.teamInvitationCode = formData.teamInvitationCode;
      }

      if (editingGame) {
        await api.put(`/games/${editingGame._id}`, gameData);
        showToast('تم تحديث اللعبة بنجاح', 'success');
      } else {
        await api.post('/games', gameData);
        showToast('تم إنشاء اللعبة بنجاح', 'success');
      }
      setShowModal(false);
      fetchGames();
    } catch (error) {
      showToast('خطأ: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDelete = (id) => {
    setGameToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/games/${gameToDelete}`);
      showToast('تم حذف اللعبة بنجاح', 'success');
      fetchGames();
    } catch (error) {
      showToast('خطأ في الحذف', 'error');
    } finally {
      setGameToDelete(null);
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0 mb-6">
        <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
          <FaGamepad className="text-blue-600 text-base md:text-2xl" />
          إدارة الألعاب
        </h1>
        <div className="flex gap-2 w-full md:w-auto">
          <Link to="/games" className="flex-1 md:flex-none btn-secondary text-sm md:text-base flex items-center justify-center gap-2 px-3 md:px-4">
            <FaExternalLinkAlt className="text-sm" />
            <span className="hidden sm:inline">عرض الصفحة</span>
            <span className="sm:hidden">عرض</span>
          </Link>
          <button onClick={handleCreate} className="flex-1 md:flex-none btn-primary text-sm md:text-base flex items-center justify-center gap-2 px-3 md:px-4">
            <FaPlus className="text-sm" />
            <span className="hidden sm:inline">لعبة جديدة</span>
            <span className="sm:hidden">جديد</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <FaGamepad className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-xl">لا توجد ألعاب</p>
          </div>
        ) : (
          games.map((game) => (
            <div key={game._id} className={`card ${!game.isActive ? 'opacity-60' : ''}`}>
              {game.coverImage && (
                <img
                  src={`${process.env.REACT_APP_API_SERVER_URL || 'http://localhost:5000'}${game.coverImage}`}
                  alt={game.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{game.title}</h3>
              {game.description && (
                <p className="text-gray-600 mb-4 line-clamp-2">{game.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {game.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                  {game.type === 'static' && 'معلومات ثابتة'}
                  {game.type === 'registration' && 'يتطلب تسجيل'}
                  {game.type === 'custom' && 'مخصص'}
                </span>
                {game.type === 'registration' && game.participants && (
                  <span className="text-sm text-blue-600 flex items-center gap-1">
                    <FaUsers />
                    {game.participants.length} مشارك
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(game)}
                  className="btn-secondary flex-1 text-sm flex items-center justify-center gap-1"
                >
                  <FaEdit />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(game._id)}
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
          setEditingGame(null);
        }}
        title={editingGame ? 'تعديل اللعبة' : 'لعبة جديدة'}
        size="lg"
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
            <label className="block text-sm font-medium mb-2">الوصف</label>
            <textarea
              className="input-field"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">النوع</label>
            <select
              className="input-field"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="static">معلومات ثابتة</option>
              <option value="registration">يتطلب تسجيل</option>
              <option value="custom">مخصص</option>
              <option value="number_guess">لعبة تخمين الأرقام</option>
            </select>
          </div>
          {formData.type === 'registration' && (
            <div>
              <label className="block text-sm font-medium mb-2">رمز الدعوة</label>
              <input
                type="text"
                className="input-field"
                value={formData.teamInvitationCode}
                onChange={(e) => setFormData({ ...formData, teamInvitationCode: e.target.value })}
              />
            </div>
          )}

          {/* Number Guess Game Configuration */}
          {formData.type === 'number_guess' && (
            <div className="space-y-6 border-t pt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
                  <FaListOl className="text-blue-600" />
                  إعدادات لعبة تخمين الأرقام
                </h3>
                <p className="text-sm text-gray-600">أضف كل رقم مع تلميحه. سيتم جمع الأرقام تلقائياً لتكوين الرقم الصحيح النهائي.</p>
              </div>

              {/* Number Hints List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FaListOl />
                    الأرقام والتلميحات
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newNumberHint = {
                        number: '',
                        hint: '',
                        order: formData.numberHints?.length || 0
                      };
                      setFormData({
                        ...formData,
                        numberHints: [...(formData.numberHints || []), newNumberHint]
                      });
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <FaPlus />
                    إضافة رقم
                  </button>
                </div>

                {formData.numberHints && formData.numberHints.length > 0 ? (
                  <div className="space-y-4">
                    {formData.numberHints.map((numberHint, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold text-lg">
                              {index + 1}
                            </span>
                            <h4 className="font-semibold text-gray-800 text-base">الرقم {index + 1}</h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newNumberHints = formData.numberHints.filter((_, i) => i !== index);
                              setFormData({ ...formData, numberHints: newNumberHints });
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <FaTimes />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                              الرقم *
                            </label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
                              value={numberHint.number}
                              onChange={(e) => {
                                const number = e.target.value.replace(/[^0-9]/g, '');
                                const newNumberHints = [...formData.numberHints];
                                newNumberHints[index].number = number;
                                setFormData({ ...formData, numberHints: newNumberHints });
                              }}
                              placeholder="مثال: 1 أو 12 أو 40"
                            />
                            <p className="text-xs text-gray-500 mt-1">يمكن أن يكون رقم واحد أو أكثر</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                              التلميح *
                            </label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={numberHint.hint}
                              onChange={(e) => {
                                const newNumberHints = [...formData.numberHints];
                                newNumberHints[index].hint = e.target.value;
                                setFormData({ ...formData, numberHints: newNumberHints });
                              }}
                              placeholder="مثال: 2 - 1 أو عدد تلاميذ السيد المسيح"
                            />
                            <p className="text-xs text-gray-500 mt-1">وصف أو تلميح للرقم</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-gray-500 mb-4">لا توجد أرقام مضافة</p>
                    <button
                      type="button"
                      onClick={() => {
                        const newNumberHint = {
                          number: '',
                          hint: '',
                          order: 0
                        };
                        setFormData({
                          ...formData,
                          numberHints: [newNumberHint]
                        });
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 mx-auto transition-colors"
                    >
                      <FaPlus />
                      إضافة أول رقم
                    </button>
                  </div>
                )}

                {/* Display Final Number */}
                {formData.numberHints && formData.numberHints.length > 0 && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FaCheckCircle className="text-green-600" />
                      <span className="font-semibold text-gray-800">الرقم الصحيح النهائي:</span>
                    </div>
                    <p className="text-2xl font-mono font-bold text-green-700">
                      {formData.numberHints.map(nh => nh.number).join('') || '(فارغ)'}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">سيتم حفظ هذا الرقم تلقائياً عند إنشاء اللعبة</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hide these fields for number_guess games */}
          {formData.type !== 'number_guess' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">صورة الغلاف (URL)</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">العلامات (مفصولة بفواصل)</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">المحتوى (JSON أو نص)</label>
                <textarea
                  className="input-field font-mono text-sm"
                  rows="6"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder='{"key": "value"} أو نص عادي'
                />
              </div>
            </>
          )}

          {/* Steps Builder - Hidden for number_guess games */}
          {formData.type !== 'number_guess' && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <FaListOl />
                  خطوات اللعبة
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const newStep = {
                      order: (formData.steps?.length || 0) + 1,
                      title: '',
                      description: '',
                      image: '',
                      action: 'none',
                      actionData: {}
                    };
                    setFormData({
                      ...formData,
                      steps: [...(formData.steps || []), newStep]
                    });
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-1"
                >
                  <FaPlus />
                  إضافة خطوة
                </button>
              </div>

              {formData.steps && formData.steps.length > 0 ? (
                <div className="space-y-4">
                  {formData.steps
                    .sort((a, b) => a.order - b.order)
                    .map((step, index) => (
                      <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold">
                              {step.order}
                            </span>
                            <span className="text-sm font-medium text-gray-700">خطوة {step.order}</span>
                          </div>
                          <div className="flex gap-1">
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newSteps = [...formData.steps];
                                  [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
                                  newSteps[index - 1].order = index;
                                  newSteps[index].order = index + 1;
                                  setFormData({ ...formData, steps: newSteps });
                                }}
                                className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
                                title="نقل لأعلى"
                              >
                                <FaArrowUp />
                              </button>
                            )}
                            {index < formData.steps.length - 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newSteps = [...formData.steps];
                                  [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
                                  newSteps[index].order = index + 1;
                                  newSteps[index + 1].order = index + 2;
                                  setFormData({ ...formData, steps: newSteps });
                                }}
                                className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
                                title="نقل لأسفل"
                              >
                                <FaArrowDown />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const newSteps = formData.steps.filter((_, i) => i !== index);
                                // Reorder steps
                                newSteps.forEach((s, i) => {
                                  s.order = i + 1;
                                });
                                setFormData({ ...formData, steps: newSteps });
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                              title="حذف"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium mb-1 text-gray-700">عنوان الخطوة *</label>
                            <input
                              type="text"
                              required
                              className="input-field text-sm"
                              value={step.title}
                              onChange={(e) => {
                                const newSteps = [...formData.steps];
                                newSteps[index].title = e.target.value;
                                setFormData({ ...formData, steps: newSteps });
                              }}
                              placeholder="عنوان الخطوة"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1 text-gray-700">الوصف</label>
                            <textarea
                              className="input-field text-sm"
                              rows="2"
                              value={step.description}
                              onChange={(e) => {
                                const newSteps = [...formData.steps];
                                newSteps[index].description = e.target.value;
                                setFormData({ ...formData, steps: newSteps });
                              }}
                              placeholder="وصف الخطوة"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1 text-gray-700">صورة (URL)</label>
                            <input
                              type="text"
                              className="input-field text-sm"
                              value={step.image}
                              onChange={(e) => {
                                const newSteps = [...formData.steps];
                                newSteps[index].image = e.target.value;
                                setFormData({ ...formData, steps: newSteps });
                              }}
                              placeholder="رابط الصورة"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1 text-gray-700">نوع الإجراء</label>
                            <select
                              className="input-field text-sm"
                              value={step.action}
                              onChange={(e) => {
                                const newSteps = [...formData.steps];
                                newSteps[index].action = e.target.value;
                                setFormData({ ...formData, steps: newSteps });
                              }}
                            >
                              <option value="none">لا يوجد</option>
                              <option value="link">رابط</option>
                              <option value="form">نموذج</option>
                              <option value="quiz">اختبار</option>
                            </select>
                          </div>
                          {step.action === 'link' && (
                            <div>
                              <label className="block text-xs font-medium mb-1 text-gray-700">الرابط</label>
                              <input
                                type="url"
                                className="input-field text-sm"
                                value={step.actionData?.url || ''}
                                onChange={(e) => {
                                  const newSteps = [...formData.steps];
                                  newSteps[index].actionData = { ...newSteps[index].actionData, url: e.target.value };
                                  setFormData({ ...formData, steps: newSteps });
                                }}
                                placeholder="https://example.com"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  لا توجد خطوات. انقر على "إضافة خطوة" لبدء البناء
                </p>
              )}
            </div>
          )}

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
              {editingGame ? 'تحديث' : 'إنشاء'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingGame(null);
              }}
              className="btn-secondary"
            >
              إلغاء
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminGames;

