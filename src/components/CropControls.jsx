import React from 'react';

const CropControls = ({
  crop,
  naturalDimensions,
  setCrop,
  setCompletedCrop,
  convertToPixelCrop,
  imgRef,
  aspect,
  setAspect,
  centerAspectCrop,
  previewCanvasRef
}) => (
  <div className="w-1/5 bg-gray-100 p-3 rounded-lg shadow-md">
    <h2 className="text-lg font-semibold mb-4">Resizing Options</h2>

    <div className="flex gap-4 mb-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700">Width:</label>
        <input
          type="number"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter width"
          value={crop ? Math.round((crop.width / 100) * naturalDimensions.width) : 0}
          onChange={(e) => {
            const newWidth = parseInt(e.target.value, 10);
            if (!isNaN(newWidth) && imgRef.current && newWidth <= naturalDimensions.width) {
              const aspectRatio = naturalDimensions.width / naturalDimensions.height;
              const newHeight = newWidth / aspectRatio;
              const newCrop = {
                ...crop,
                width: (newWidth / naturalDimensions.width) * 100,
                height: (newHeight / naturalDimensions.height) * 100,
              };
              setCrop(newCrop);
              setCompletedCrop(convertToPixelCrop(newCrop, naturalDimensions.width, naturalDimensions.height));
            }
          }}
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700">Height:</label>
        <input
          type="number"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter height"
          value={crop ? Math.round((crop.height / 100) * naturalDimensions.height) : 0}
          onChange={(e) => {
            const newHeight = parseInt(e.target.value, 10);
            if (!isNaN(newHeight) && imgRef.current && newHeight <= naturalDimensions.height) {
              const aspectRatio = naturalDimensions.width / naturalDimensions.height;
              const newWidth = newHeight * aspectRatio;
              const newCrop = {
                ...crop,
                width: (newWidth / naturalDimensions.width) * 100,
                height: (newHeight / naturalDimensions.height) * 100,
              };
              setCrop(newCrop);
              setCompletedCrop(convertToPixelCrop(newCrop, naturalDimensions.width, naturalDimensions.height));
            }
          }}
        />
      </div>
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">Crop Option:</label>
      <select
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        onChange={(e) => {
          const newAspect = parseFloat(e.target.value);
          setAspect(newAspect || undefined);
          if (imgRef.current) {
            const { width, height } = imgRef.current;
            let newCrop;
            if (isNaN(newAspect)) {
              // Custom option selected, reset crop to cover the entire image
              newCrop = {
                unit: "%",
                width: 100,
                height: 100,
                x: 0,
                y: 0,
              };
            } else {
              newCrop = centerAspectCrop(width, height, newAspect);
            }
            setCrop(newCrop);
            setCompletedCrop(convertToPixelCrop(newCrop, width, height));
          }
        }}
      >
        <option value="">Custom</option>
        <option value={16 / 9}>16:9 (Widescreen)</option>
        <option value={4 / 3}>4:3 (Standard)</option>
        <option value={1}>1:1 (Square)</option>
      </select>
    </div>

    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700">Crop Position</h3>
      <table className="mt-1 w-full">
        <thead>
          <tr>
            <th className="text-left">Position (X)</th>
            <th className="text-left">Position (Y)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder=""
                value={crop ? Math.round((crop.x / 100) * naturalDimensions.width) : 0}
                onChange={(e) => {
                  const newX = parseInt(e.target.value, 10);
                  if (!isNaN(newX) && imgRef.current && newX <= naturalDimensions.width) {
                    const newCrop = {
                      ...crop,
                      x: (newX / naturalDimensions.width) * 100,
                    };
                    setCrop(newCrop);
                    setCompletedCrop(convertToPixelCrop(newCrop, naturalDimensions.width, naturalDimensions.height));
                  }
                }}
              />
            </td>
            <td>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder=""
                value={crop ? Math.round((crop.y / 100) * naturalDimensions.height) : 0}
                onChange={(e) => {
                  const newY = parseInt(e.target.value, 10);
                  if (!isNaN(newY) && imgRef.current && newY <= naturalDimensions.height) {
                    const newCrop = {
                      ...crop,
                      y: (newY / naturalDimensions.height) * 100,
                    };
                    setCrop(newCrop);
                    setCompletedCrop(convertToPixelCrop(newCrop, naturalDimensions.width, naturalDimensions.height));
                  }
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700">Preview</h3>
      <div className="w-full h-36 px-8 border border-gray-300 rounded-md overflow-hidden">
        <canvas
          ref={previewCanvasRef}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    </div>

    <div>
      <h3 className="text-sm font-medium text-gray-700">Current:</h3>
      <p className="mt-1 text-gray-600">
        {crop ? `${Math.round(crop.width)} x ${Math.round(crop.height)}` : "0 x 0"}, JPEG
      </p>
      <h3 className="text-sm font-medium text-gray-700 mt-2">Original:</h3>
      <p className="mt-1 text-gray-600">
        {naturalDimensions.width} x {naturalDimensions.height}, JPEG
      </p>
    </div>
  </div>
);

export default CropControls;
