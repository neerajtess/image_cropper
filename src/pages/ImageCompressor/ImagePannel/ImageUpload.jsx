import React from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ImageUpload = ({ image, handleImageUpload, crop, setCrop, onCropComplete, imgRef }) => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg h-[90%] flex items-center justify-center bg-gray-50 overflow-hidden">
      {image ? (
        <ReactCrop
          src={image}
          crop={crop}
          onChange={(newCrop) => setCrop(newCrop)}
          onComplete={onCropComplete}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        >
          <img
            ref={imgRef}
            src={image}
            alt="Preview"
            style={{ maxWidth: "300px", maxHeight: "100%", objectFit: "contain" }}
          />
        </ReactCrop>
      ) : (
        <button className="bg-blue-500 text-white px-6 py-2 rounded relative">
          Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </button>
      )}
    </div>
  );
};

export default ImageUpload;