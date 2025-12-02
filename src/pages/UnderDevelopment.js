import React from 'react';
import { Link } from 'react-router-dom';
import { FaTools, FaHome, FaArrowRight } from 'react-icons/fa';

const UnderDevelopment = ({ pageName = 'هذه الصفحة' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full text-center">
        <div className="p-8 md:p-12">
          {/* Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
              <FaTools className="text-white text-4xl animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            {pageName} قيد التطوير
          </h1>

          {/* Decorative Line */}
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-8 rounded-full"></div>

          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FaHome />
            <span>العودة للرئيسية</span>
            <FaArrowRight className="transform rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnderDevelopment;

