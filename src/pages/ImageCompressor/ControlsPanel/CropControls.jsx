import React, { useEffect } from "react";

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
  imageSrc,
  onReset,
  previewCanvasRef = { current: null }, // Default value for previewCanvasRef
  completedCrop,
  imgRef = { current: null }, // Default value for imgRef
}) => {
  console.log("CropControls - previewCanvasRef:", previewCanvasRef);
  console.log("CropControls - imgRef:", imgRef);

  useEffect(() => {
    console.log("useEffect - previewCanvasRef:", previewCanvasRef);
    console.log("useEffect - imgRef:", imgRef);

    if (previewCanvasRef.current && imgRef.current && completedCrop) {
      const canvas = previewCanvasRef.current;
      const image = imgRef.current;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("No 2d context");
      }

      // Set canvas dimensions
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

      // Draw the cropped image on the canvas
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY
      );
    }
  }, [completedCrop, previewCanvasRef, imgRef]);

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
              value={Math.floor(crop.x || 0)}
              className="w-full p-1 border rounded outline-none"
              onChange={handlePositionXChange}
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Position (Y)</label>
            <input
              type="number"
              value={Math.floor(crop.y || "")}
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
            backgroundColor: "#f0f0f0",
          }}
        >
          {previewCanvasRef.current && (
            <canvas
              ref={previewCanvasRef}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            ></canvas>
          )}
        </div>
      </div>

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