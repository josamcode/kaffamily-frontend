import React from 'react';

const Error = ({ message = 'حدث خطأ ما', onRetry, fullScreen = false }) => {
  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white z-50'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-gray-700 text-lg mb-4">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn-primary">
            إعادة المحاولة
          </button>
        )}
      </div>
    </div>
  );
};

export default Error;

