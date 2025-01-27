import React from 'react';

const ImageUploader = ({ onImageUpload }) => (
  <div className="text-center">
    <label className="cursor-pointer">
      <span className="block text-sm font-medium text-gray-700 mb-2">
        Choose an image
      </span>
      <input
        type="file"
        accept="image/*"
        onChange={onImageUpload}
        className="hidden"
      />
      <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
        Choose File
      </div>
    </label>
  </div>
);
