import React, { useState, useRef } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import { LuCrop } from "react-icons/lu"; // Crop icon
import { TbArrowBackUp, TbArrowForwardUp } from "react-icons/tb"; // Undo and Redo icons
import { IoReload } from "react-icons/io5"; // Reset icon
import { FiSave } from "react-icons/fi"; // Save icon
import { canvasPreview } from "./canvasPreview"; // Ensure this utility is available
import { useDebounceEffect } from "./useDebounceEffect"; // Ensure this utility is available
import "react-image-crop/dist/ReactCrop.css";

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const ImageCompressor = () => {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [cropHistory, setCropHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [originalImage, setOriginalImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState(undefined);
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });

  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const hiddenAnchorRef = useRef(null);
  const blobUrlRef = useRef("");

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result); // Store original
        setImage(reader.result); // Set current image
      };
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setNaturalDimensions({ width: naturalWidth, height: naturalHeight });
    if (!originalDimensions.width && !originalDimensions.height) {
      setOriginalDimensions({ width: naturalWidth, height: naturalHeight });
    }
  
    // Set default crop regardless of aspect
    const { width, height } = e.currentTarget;
    const defaultCrop = {
      unit: "%",
      width: 30,
      height: 30,
      x: (100 - 30) / 2,
      y: (100 - 30) / 2,
    };
    
    if (aspect) {
      setCrop(centerAspectCrop(width, height, aspect));
    } else {
      setCrop(defaultCrop);
    }
    setCompletedCrop(convertToPixelCrop(defaultCrop, width, height));
  };


  const handleUndoClick = () => {
    if (cropHistory.length > 0) {
      const newCropHistory = [...cropHistory];
      const lastState = newCropHistory.pop();

      setRedoStack([{ crop, completedCrop, image, scale, rotate }, ...redoStack]);
      setCrop(lastState.crop);
      setCompletedCrop(lastState.completedCrop);
      setImage(lastState.image);
      setScale(lastState.scale || 1);
      setRotate(lastState.rotate || 0);
      setCropHistory(newCropHistory);
    } else {
      // Reset to original image instead of null
      setCrop(undefined);
      setCompletedCrop(undefined);
      setImage(originalImage); // Key change: Use originalImage
      setScale(1);
      setRotate(0);
    }
  };


  function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 30, // Changed from 90% to 30%
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  }



  const handleRedoClick = () => {
    if (redoStack.length > 0) {
      const newRedoStack = [...redoStack];
      const nextState = newRedoStack.shift(); // Get the next state from redo stack

      setCropHistory([...cropHistory, { crop, completedCrop, image, scale, rotate }]); // Add current state to history
      setCrop(nextState.crop); // Restore the next crop
      setCompletedCrop(nextState.completedCrop); // Restore the next completed crop
      setImage(nextState.image); // Restore the next image
      setScale(nextState.scale || 1); // Restore the next scale
      setRotate(nextState.rotate || 0); // Restore the next rotation
      setRedoStack(newRedoStack); // Update the redo stack
    }
  };

  const handleResetClick = () => {
    setImage(originalImage); // Reset to original image
    setCrop(undefined);
    setCompletedCrop(undefined);
    setScale(1);
    setRotate(0);
    setCropHistory([]);
    setRedoStack([]);
  };

  const handleCropClick = async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }

    const img = imgRef.current;
    // Get actual rendered dimensions accounting for CSS transforms
    const rect = img.getBoundingClientRect();
    const displayedWidth = rect.width;
    const displayedHeight = rect.height;

    // Calculate scaling factors based on rendered dimensions
    const scaleX = img.naturalWidth / displayedWidth;
    const scaleY = img.naturalHeight / displayedHeight;

    const canvas = document.createElement('canvas');
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const croppedImageUrl = canvas.toDataURL('image/png');
    setImage(croppedImageUrl);
    setCropHistory([...cropHistory, { crop, completedCrop, image }]);
    setRedoStack([]);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const handleCustomRatioClick = () => {
    setAspect(undefined); // Set aspect ratio to undefined

    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const newCrop = {
        unit: "%",
        width: 100, // Cover the entire width
        height: 100, // Cover the entire height
        x: 0, // Start from the top-left corner
        y: 0, // Start from the top-left corner
      };
      setCrop(newCrop);
      setCompletedCrop(convertToPixelCrop(newCrop, width, height));
    }
  };

  const convertToPixelCrop = (percentageCrop, imgWidth, imgHeight) => {
    return {
      x: (percentageCrop.x / 100) * imgWidth,
      y: (percentageCrop.y / 100) * imgHeight,
      width: (percentageCrop.width / 100) * imgWidth,
      height: (percentageCrop.height / 100) * imgHeight,
    };
  };

  const onDownloadCropClick = async () => {
    if (!imgRef.current) {
      alert("Image is not loaded.");
      return;
    }

    const image = imgRef.current;
    const previewCanvas = previewCanvasRef.current;

    let scaleX = 1;
    let scaleY = 1;
    let cropWidth = image.naturalWidth;
    let cropHeight = image.naturalHeight;
    let cropX = 0;
    let cropY = 0;

    // If a valid crop area exists, use it. Otherwise, download the full image.
    if (completedCrop && completedCrop.width && completedCrop.height) {
      scaleX = image.naturalWidth / image.width;
      scaleY = image.naturalHeight / image.height;
      cropWidth = completedCrop.width * scaleX;
      cropHeight = completedCrop.height * scaleY;
      cropX = completedCrop.x * scaleX;
      cropY = completedCrop.y * scaleY;
    }

    const offscreen = new OffscreenCanvas(cropWidth, cropHeight);
    const ctx = offscreen.getContext("2d");
    if (!ctx) {
      throw new Error("No 2d context");
    }

    ctx.drawImage(
      image,
      cropX, // Source X
      cropY, // Source Y
      cropWidth, // Source width
      cropHeight, // Source height
      0, // Target X
      0, // Target Y
      cropWidth, // Target width
      cropHeight // Target height
    );

    const blob = await offscreen.convertToBlob({ type: "image/png" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        const img = imgRef.current;
        const rect = img.getBoundingClientRect();
        const scaleX = img.naturalWidth / rect.width;
        const scaleY = img.naturalHeight / rect.height;

        canvasPreview(
          img,
          previewCanvasRef.current,
          {
            ...completedCrop,
            width: completedCrop.width * scaleX,
            height: completedCrop.height * scaleY,
            x: completedCrop.x * scaleX,
            y: completedCrop.y * scaleY,
          },
          scale,
          rotate
        );
      }
    },
    100,
    [completedCrop, scale, rotate]
  );

  // Helper function to clamp values within bounds
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  return (
    <div className="p-4">
      <div className="flex gap-1 border">
        <div className="w-1/5 bg-gray-100 p-3 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Resizing Options</h2>

          <div className="flex gap-4 mb-4">
  {/* Width Input */}
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700">Width:</label>
    <input
      type="number"
      className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
      placeholder="Enter width"
      value={crop ? Math.round((crop.width / 100) * naturalDimensions.width) : ""}
      onChange={(e) => {
        const newWidth = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
        if (!isNaN(newWidth) && imgRef.current) {
          const currentX = ((crop?.x || 0) / 100) * naturalDimensions.width; // Convert % to px
          const maxWidth = naturalDimensions.width - currentX;
          const clampedWidth = clamp(newWidth, 1, maxWidth);
          const newCrop = {
            ...crop,
            width: (clampedWidth / naturalDimensions.width) * 100,
          };
          setCrop(newCrop);
          setCompletedCrop(convertToPixelCrop(newCrop, naturalDimensions.width, naturalDimensions.height));
        }
      }}
    />
  </div>

  {/* Height Input */}
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700">Height:</label>
    <input
      type="number"
      className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
      placeholder="Enter height"
      value={crop ? Math.round((crop.height / 100) * naturalDimensions.height) : ""}
      onChange={(e) => {
        const newHeight = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
        if (!isNaN(newHeight) && imgRef.current) {
          const currentY = ((crop?.y || 0) / 100) * naturalDimensions.height; // Convert % to px
          const maxHeight = naturalDimensions.height - currentY;
          const clampedHeight = clamp(newHeight, 1, maxHeight);
          const newCrop = {
            ...crop,
            height: (clampedHeight / naturalDimensions.height) * 100,
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
  <table className="mt-3 w-full">
    <thead>
      <tr>
        <th className="text-left text-sm font-normal">Position (X)</th>
        <th className="text-left text-sm font-normal">Position (Y)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        {/* X Input */}
        <td>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder=""
            value={crop ? Math.round((crop.x / 100) * naturalDimensions.width) : ""}
            onChange={(e) => {
              const newX = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
              if (!isNaN(newX) && imgRef.current) {
                const currentWidth = ((crop?.width || 0) / 100) * naturalDimensions.width; // Convert % to px
                const maxX = naturalDimensions.width - currentWidth;
                const clampedX = clamp(newX, 0, maxX);
                const newCrop = {
                  ...crop,
                  x: (clampedX / naturalDimensions.width) * 100,
                };
                setCrop(newCrop);
                setCompletedCrop(convertToPixelCrop(newCrop, naturalDimensions.width, naturalDimensions.height));
              }
            }}
          />
        </td>

        {/* Y Input */}
        <td>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder=""
            value={crop ? Math.round((crop.y / 100) * naturalDimensions.height) : ""}
            onChange={(e) => {
              const newY = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
              if (!isNaN(newY) && imgRef.current) {
                const currentHeight = ((crop?.height || 0) / 100) * naturalDimensions.height; // Convert % to px
                const maxY = naturalDimensions.height - currentHeight;
                const clampedY = clamp(newY, 0, maxY);
                const newCrop = {
                  ...crop,
                  y: (clampedY / naturalDimensions.height) * 100,
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
              {crop ? `${Math.round((crop.width / 100) * naturalDimensions.width)} x ${Math.round((crop.height / 100) * naturalDimensions.height)}` : "0 x 0"}, JPEG
            </p>
            <h3 className="text-sm font-medium text-gray-700 mt-2">Original:</h3>
            <p className="mt-1 text-gray-600">
              {originalDimensions.width} x {originalDimensions.height}, JPEG
            </p>
          </div>
        </div>

        <div className="flex-1 border">
          <div className="p-1 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center bg-gray-50">
            <div className="w-full h-[400px] flex justify-center items-center overflow-hidden">
              {image ? (
<ReactCrop
  crop={crop}
  onChange={(_, percentCrop) => setCrop(percentCrop)}
  onComplete={(c) => setCompletedCrop(c)}
  aspect={aspect}
  minWidth={imgRef.current ? imgRef.current.clientWidth * 0.05 : 50}
  minHeight={imgRef.current ? imgRef.current.clientHeight * 0.05 : 50}
>
  <img
    ref={imgRef}
    alt="Uploaded"
    src={image}
    style={{
      transform: `scale(${scale}) rotate(${rotate}deg)`,
      maxWidth: "100%",
      maxHeight: "400px",
      objectFit: "contain",
    }}
    onLoad={onImageLoad}
  />
</ReactCrop>
              ) : (
                <div className="text-center">
                  <label className="cursor-pointer">
                    <span className="block text-sm font-medium text-gray-700 mb-2">
                      Choose an image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                      Choose File
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            {/* Crop Button */}
            <div
              className="group flex flex-col items-center p-2 cursor-pointer rounded-lg transition-colors duration-200"
              onClick={handleCropClick}
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm">
                Crop
              </span>
              <LuCrop size={20} />
            </div>

            {/* Undo Button */}
            <div
              className="group flex flex-col items-center p-2 cursor-pointer rounded-lg transition-colors duration-200"
              onClick={handleUndoClick}
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm">
                Undo
              </span>
              <TbArrowBackUp size={20} />
            </div>

            {/* Redo Button */}
            <div
              className="group flex flex-col items-center p-2 cursor-pointer rounded-lg transition-colors duration-200"
              onClick={handleRedoClick}
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm">
                Redo
              </span>
              <TbArrowForwardUp size={20} />
            </div>

            {/* Reset Button */}
            <div
              className="group flex flex-col items-center p-2 cursor-pointer rounded-lg transition-colors duration-200"
              onClick={handleResetClick}
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm">
                Reset
              </span>
              <IoReload size={20} />
            </div>

            {/* Save Button */}
            <div
              className="group flex flex-col items-center p-2 cursor-pointer rounded-lg transition-colors duration-200"
              onClick={() => {
                if (!image) {
                  alert("Please upload an image first."); // Notify the user
                  return;
                }
                onDownloadCropClick();
              }}
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm">
                Save
              </span>
              <FiSave size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCompressor;