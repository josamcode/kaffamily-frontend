import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import IconSelector, { renderIcon } from '../../components/IconSelector';
import { FaBolt, FaPlus, FaEdit, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const AdminQuickActions = () => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
    link: '',
    linkType: 'internal',
    order: 0,
    isActive: true
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionToDelete, setActionToDelete] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/quick-actions/all');
      setActions(response.data.actions || []);
    } catch (error) {
      showToast('خطأ في جلب الإجراءات السريعة', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAction(null);
    setFormData({
      title: '',
      description: '',
      icon: '',
      link: '',
      linkType: 'internal',
      order: 0,
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (action) => {
    setEditingAction(action);
    setFormData({
      title: action.title,
      description: action.description || '',
      icon: action.icon || '',
      link: action.link,
      linkType: action.linkType,
      order: action.order || 0,
      isActive: action.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAction) {
        await api.put(`/quick-actions/${editingAction._id}`, formData);
        showToast('تم تحديث الإجراء السريع بنجاح', 'success');
      } else {
        await api.post('/quick-actions', formData);
        showToast('تم إنشاء الإجراء السريع بنجاح', 'success');
      }
      setShowModal(false);
      fetchActions();
    } catch (error) {
      showToast('خطأ: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDelete = (id) => {
    setActionToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/quick-actions/${actionToDelete}`);
      showToast('تم حذف الإجراء بنجاح', 'success');
      fetchActions();
    } catch (error) {
      showToast('خطأ في الحذف', 'error');
    } finally {
      setActionToDelete(null);
    }
  };

  const handleReorder = async (actionId, direction) => {
    const action = actions.find(a => a._id === actionId);
    if (!action) return;

    const newOrder = direction === 'up' ? action.order - 1 : action.order + 1;
    try {
      await api.put(`/quick-actions/${actionId}`, { order: newOrder });
      showToast('تم تحديث الترتيب', 'success');
      fetchActions();
    } catch (error) {
      showToast('خطأ في التحديث', 'error');
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaBolt className="text-blue-600" />
          إدارة الإجراءات السريعة
        </h1>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <FaPlus />
          إجراء جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <FaBolt className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-xl">لا توجد إجراءات سريعة</p>
          </div>
        ) : (
          actions
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((action) => (
              <div
                key={action._id}
                className={`card ${!action.isActive ? 'opacity-60' : ''}`}
              >
                {action.icon && (
                  <div className="text-4xl mb-4 text-center text-blue-600">
                    {renderIcon(action.icon, 'text-4xl')}
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                {action.description && (
                  <p className="text-gray-600 mb-4">{action.description}</p>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">
                    {action.linkType === 'internal' ? 'داخلي' : 'خارجي'}
                  </span>
                  <span className="text-sm text-gray-500">ترتيب: {action.order}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReorder(action._id, 'up')}
                    className="btn-secondary text-sm flex-1 flex items-center justify-center gap-1"
                    title="نقل لأعلى"
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    onClick={() => handleReorder(action._id, 'down')}
                    className="btn-secondary text-sm flex-1 flex items-center justify-center gap-1"
                    title="نقل لأسفل"
                  >
                    <FaArrowDown />
                  </button>
                  <button
                    onClick={() => handleEdit(action)}
                    className="btn-secondary text-sm flex-1 flex items-center justify-center gap-1"
                  >
                    <FaEdit />
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(action._id)}
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
          setEditingAction(null);
        }}
        title={editingAction ? 'تعديل الإجراء السريع' : 'إجراء سريع جديد'}
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
          <IconSelector
            value={formData.icon}
            onChange={(iconName) => setFormData({ ...formData, icon: iconName })}
            label="الأيقونة"
          />
          <div>
            <label className="block text-sm font-medium mb-2">الرابط *</label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="/collections أو https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">نوع الرابط</label>
            <select
              className="input-field"
              value={formData.linkType}
              onChange={(e) => setFormData({ ...formData, linkType: e.target.value })}
            >
              <option value="internal">داخلي</option>
              <option value="external">خارجي</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">الترتيب</label>
            <input
              type="number"
              className="input-field"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
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
              {editingAction ? 'تحديث' : 'إنشاء'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingAction(null);
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

export default AdminQuickActions;

