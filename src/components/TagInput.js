import React, { useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

const TagInput = ({ tags = [], onChange, placeholder = "أضف علامة جديدة" }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = (e) => {
    e.preventDefault();
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onChange([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(e);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[42px] p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-gray-500 focus-within:border-transparent bg-white">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="text-gray-500 hover:text-red-600 transition-colors"
              title="حذف العلامة"
            >
              <FaTimes className="text-xs" />
            </button>
          </span>
        ))}
        <div className="flex-1 flex items-center gap-2 min-w-[150px]">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 outline-none bg-transparent text-sm"
          />
          <button
            type="button"
            onClick={handleAddTag}
            disabled={!inputValue.trim()}
            className="p-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="إضافة علامة"
          >
            <FaPlus className="text-xs" />
          </button>
        </div>
      </div>
      {tags.length === 0 && (
        <p className="text-xs text-gray-500">اكتب العلامة واضغط Enter أو انقر على زر الإضافة</p>
      )}
    </div>
  );
};

export default TagInput;

