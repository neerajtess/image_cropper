import React, { useState, useRef } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ImagePannel = () => {
  const [image, setImage] = useState(null);
  const [imageProperties, setImageProperties] = useState({ width: 0, height: 0, size: 0, type: "" });
  const [crop, setCrop] = useState({ aspect: 5 / 4, width: 0, height: 0, x: 0, y: 0 });
  const [croppedImage, setCroppedImage] = useState(null);
  const [cropOption, setCropOption] = useState("5:4"); // Default crop option
  const [history, setHistory] = useState([]); // For undo functionality
  const [future, setFuture] = useState([]); // For redo functionality
  const imgRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          setImage(img.src);
          setImageProperties({
            width: img.width,
            height: img.height,
            size: file.size,
            type: file.type.split("/")[1].toUpperCase(),
          });
          // Reset crop to default when a new image is uploaded
          setCrop({ aspect: 5 / 4, width: img.width, height: img.height, x: 0, y: 0 });
          setHistory([]); // Clear history
          setFuture([]); // Clear future
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (crop) => {
    if (image && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(image, crop);
      setCroppedImage(croppedImageUrl);
    }
  };

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return canvas.toDataURL("image/jpeg");
  };

  const handleCropOptionChange = (option) => {
    setCropOption(option);
    let newCrop = { ...crop };
    switch (option) {
      case "Full":
        newCrop.aspect = imageProperties.width / imageProperties.height;
        newCrop.width = imageProperties.width;
        newCrop.height = imageProperties.height;
        break;
      case "Half":
        newCrop.aspect = 1 / 2;
        newCrop.width = imageProperties.width / 2;
        newCrop.height = imageProperties.height / 2;
        break;
      case "Square":
        newCrop.aspect = 1 / 1;
        newCrop.width = Math.min(imageProperties.width, imageProperties.height);
        newCrop.height = Math.min(imageProperties.width, imageProperties.height);
        break;
      case "4:4":
        newCrop.aspect = 4 / 4;
        newCrop.width = imageProperties.width;
        newCrop.height = imageProperties.width;
        break;
      case "5:4":
        newCrop.aspect = 5 / 4;
        newCrop.width = imageProperties.width;
        newCrop.height = (imageProperties.width * 4) / 5;
        break;
      default:
        newCrop.aspect = 5 / 4;
    }
    setCrop(newCrop);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleCrop = () => {
    if (imgRef.current && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, crop);
      setHistory([...history, image]); // Save current image to history
      setImage(croppedImageUrl); // Set cropped image as the new image
      setFuture([]); // Clear future
      setCrop({ ...crop, width: 0, height: 0, x: 0, y: 0 }); // Reset crop area
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previousImage = history[history.length - 1];
      setFuture([image, ...future]); // Save current image to future
      setImage(previousImage); // Revert to previous image
      setHistory(history.slice(0, -1)); // Remove last history entry
    }
  };

  const handleRedo = () => {
    if (future.length > 0) {
      const nextImage = future[0];
      setHistory([...history, image]); // Save current image to history
      setImage(nextImage); // Reapply next image
      setFuture(future.slice(1)); // Remove first future entry
    }
  };

  const handleReset = () => {
    setHistory([]); // Clear history
    setFuture([]); // Clear future
    setImage(history[0] || image); // Reset to the initial image
  };

  const handleSave = () => {
    if (croppedImage) {
      const link = document.createElement("a");
      link.href = croppedImage;
      link.download = "cropped-image.jpeg";
      link.click();
    }
  };

  const handleWidthChange = (e) => {
    const newWidth = parseInt(e.target.value, 10);
    if (!isNaN(newWidth)) {
      setCrop({ ...crop, width: newWidth });
    }
  };

  const handleHeightChange = (e) => {
    const newHeight = parseInt(e.target.value, 10);
    if (!isNaN(newHeight)) {
      setCrop({ ...crop, height: newHeight });
    }
  };

  const handlePositionXChange = (e) => {
    const newX = parseInt(e.target.value, 10);
    if (!isNaN(newX)) {
      setCrop({ ...crop, x: newX });
    }
  };

  const handlePositionYChange = (e) => {
    const newY = parseInt(e.target.value, 10);
    if (!isNaN(newY)) {
      setCrop({ ...crop, y: newY });
    }
  };

  return (
    <div className="w-full flex gap-3">
      {/* Left Sidebar */}
      <div>
        <div className="w-full md:w-72 bg-white rounded-lg p-4 shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Resizing Options</h2>

          {/* Width/Height Controls */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-gray-600 mb-1">Width:</label>
              <input
                type="number"
                value={Math.round(crop.width) || 0}
                className="w-full p-2 border rounded"
                onChange={handleWidthChange}
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Height:</label>
              <input
                type="number"
                value={Math.round(crop.height) || 0}
                className="w-full p-2 border rounded"
                onChange={handleHeightChange}
              />
            </div>
          </div>

          {/* Crop Options */}
          <div className="mb-7">
            <label className="block text-gray-600 mb-1">Crop Option:</label>
            <select
              className="w-full p-2 border rounded"
              value={cropOption}
              onChange={(e) => handleCropOptionChange(e.target.value)}
            >
              <option value="Full">Full</option>
              <option value="Half">Half</option>
              <option value="Square">Square</option>
              <option value="4:4">4:4</option>
              <option value="5:4">5:4</option>
            </select>
          </div>

          {/* Crop Position */}
          <div className="mb-5">
            <h3 className="font-semibold mb13">Crop Position</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 mb-1">Position (X)</label>
                <input
                  type="number"
                  value={Math.round(crop.x) || 0}
                  className="w-full p-2 border rounded"
                  onChange={handlePositionXChange}
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Position (Y)</label>
                <input
                  type="number"
                  value={Math.round(crop.y) || 0}
                  className="w-full p-2 border rounded"
                  onChange={handlePositionYChange}
                />
              </div>
            </div>
          </div>

          {/* Image Info */}
          <div className="bg-gray-50 p-1 rounded">
            <div className="text-sm">
              Current: {Math.round(crop.width) || 0} x {Math.round(crop.height) || 0},{" "}
              {formatFileSize((crop.width * crop.height * 3) / 1024) || "0 Bytes"},{" "}
              {imageProperties.type || "JPEG"}
            </div>
            <div className="text-sm">
              Original: {imageProperties.width || 0} x {imageProperties.height || 0},{" "}
              {formatFileSize(imageProperties.size) || "0 Bytes"}, {imageProperties.type || "JPEG"}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side (Image Preview and Actions) */}
      <div className="flex-1">
        <div className="h-full">
          {/* Image Upload or Preview */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center bg-gray-50 overflow-hidden">
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
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
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

          {/* Action Buttons */}
          <div className="flex justify-center gap-8 mt-4">
            <button
              className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-500"
              onClick={handleCrop}
            >
              <span>Crop</span>
            </button>
            <button
              className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-500"
              onClick={handleUndo}
            >
              <span>Undo</span>
            </button>
            <button
              className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-500"
              onClick={handleRedo}
            >
              <span>Redo</span>
            </button>
            <button
              className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-500"
              onClick={handleReset}
            >
              <span>Reset</span>
            </button>
            <button
              className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-500"
              onClick={handleSave}
            >
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePannel;