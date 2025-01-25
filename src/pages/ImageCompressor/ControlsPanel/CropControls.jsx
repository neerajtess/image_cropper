import React from "react";

const CropControls = ({
  crop,
  handleWidthChange,
  handleHeightChange,
  handlePositionXChange,
  handlePositionYChange,
  handleCropOptionChange,
  cropOption,
  imageProperties,
  formatFileSize,
  imageSrc, // This will be the uploaded image URL
  onReset, // Reset function passed from the parent component
}) => {
  return (
    <div className="h-[100%] w-[100%] md:w-72 rounded-sm p-4 shadow-sm text-[14px]">
      <h2 className="text-xl font-semibold mb-4">Resizing Options</h2>

      {/* Width/Height Controls */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <label className="block text-gray-600 mb-1">Width:</label>
          <input
            type="number"
            value={Math.floor(crop.width) || ""}

            className="w-full p-1 border rounded outline-none"
            onChange={handleWidthChange}
          />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Height:</label>
          <input
            type="number"
            value={Math.floor(crop.height) || ""}

            className="w-full p-1 border rounded outline-none"
            onChange={handleHeightChange}
          />
        </div>
      </div>

      {/* Crop Options */}
      <div className="mb-4">
        <label className="block text-gray-600 mb-1">Crop Option:</label>
        <select
          className="w-full p-1 border rounded outline-none"
          value={cropOption}
          onChange={(e) => handleCropOptionChange(e.target.value)}
        >
          <option value="16:9">16:9 (Widescreen)</option>
          <option value="4:3">4:3 (Standard)</option>
          <option value="1:1">1:1 (Square)</option>
          <option value="9:16">9:16 (Portrait)</option>
          <option value="3:2">3:2 (Photography)</option>
        </select>
      </div>

      {/* Crop Position */}
      <div className="mb-4">
        <h3 className="font-semibold mb-1">Crop Position</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-600 mb-1">Position (X)</label>
            <input
              type="number"
              value={ Math.floor(crop.x || 0)}
              className="w-full p-1 border rounded outline-none"
              onChange={handlePositionXChange}
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Position (Y)</label>
            <input
              type="number"
              value={ Math.floor(crop.y || "")}
              className="w-full p-1 border rounded outline-none"
              onChange={handlePositionYChange}
            />
          </div>
        </div>
      </div>

      {/* Preview Box */}
      <div className="mb-5">
        <h3 className="font-semibold mb-2">Preview</h3>
        <div
          className="w-full h-32 border border-gray-300 rounded overflow-hidden relative"
          style={{
            backgroundColor: "#f0f0f0", // Background color for the preview box
          }}
        >
          {imageSrc && (
            <div
              style={{
                width: `${crop.width * (200 / imageProperties.width)}px`,
                height: `${crop.height * (200 / imageProperties.height)}px`,
                overflow: "hidden",
                position: "absolute",
                top: `${crop.y * (200 / imageProperties.height)}px`,
                left: `${crop.x * (200 / imageProperties.width)}px`,
              }}
            >
              <img
                src={imageSrc}
                alt="Cropped Preview"
                style={{
                  width: `${imageProperties.width}px`,
                  height: `${imageProperties.height}px`,
                  objectFit: "cover",
                  transform: `translate(-${crop.x}px, -${crop.y}px)`,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Image Info */}
      <div className="bg-gray-50 p-1 rounded text-[12px]">
        <div className="text-[13px]">
          Current: {Math.round(crop.width || 0)} x {Math.round(crop.height || 0)},{" "}
          {formatFileSize((crop.width || 0) * (crop.height || 0) * 3 / 1024) || "0 Bytes"},{" "}
          {imageProperties.type || "JPEG"}
        </div>
        <div className="text-[13px]">
          Original: {imageProperties.width || 0} x {imageProperties.height || 0},{" "}
          {formatFileSize(imageProperties.size) || "0 Bytes"}, {imageProperties.type || "JPEG"}
        </div>
      </div>

     
    </div>
  );
};

export default CropControls;