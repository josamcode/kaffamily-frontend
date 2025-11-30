import React from 'react';
import Modal from './Modal';
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'تأكيد الحذف', 
  message, 
  confirmText = 'حذف', 
  cancelText = 'إلغاء',
  type = 'danger' // 'danger' or 'warning'
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 p-3 rounded-full ${
            type === 'danger' 
              ? 'bg-red-100 text-red-600' 
              : 'bg-yellow-100 text-yellow-600'
          }`}>
            {type === 'danger' ? (
              <FaExclamationTriangle className="text-2xl" />
            ) : (
              <FaCheckCircle className="text-2xl" />
            )}
          </div>
          <div className="flex-1 pt-1">
            <p className="text-gray-700 text-lg leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 justify-end pt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-6 py-2.5 text-white rounded-lg font-medium transition-colors ${
              type === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

