import React from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ImageUpload = ({ image, handleImageUpload, crop, setCrop, onCropComplete, imgRef }) => {
  return (
    <div className="w-[100%] h-[90%] flex justify-center items-center">
      <div className="w-[98%] h-[95%] border-4 border-zinc-400 border-dashed flex justify-center items-center">
        {image ? (
          <ReactCrop
            crop={crop} // Pass the crop object
            onChange={(newCrop) => setCrop(newCrop)} // Update crop when the user interacts with it
            onComplete={onCropComplete} // Handle crop completion
          >
            <img
              ref={imgRef}
              src={image}
              alt="Preview"
              style={{
                height: "420px", // Keeping your original image CSS
                maxHeight: "100%",
                objectFit: "contain", // Ensures aspect ratio is preserved
              }}
            />
          </ReactCrop>
        ) : (
          <button className="bg-blue-500 text-white px-6 py-2 rounded relative cursor-pointer">
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0"
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
