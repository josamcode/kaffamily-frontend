import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full w-full h-full mx-0'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`${size === 'full' ? 'bg-transparent w-full h-full' : 'bg-white rounded-lg shadow-xl'} w-full ${sizeClasses[size]} ${size === 'full' ? '' : 'max-h-[90vh] overflow-y-auto'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && size !== 'full' && (
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
            >
              ×
            </button>
          </div>
        )}
        <div className={size === 'full' ? '' : 'p-6'}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;

