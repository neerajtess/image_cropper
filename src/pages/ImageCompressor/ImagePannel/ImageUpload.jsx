import React, { useState, useRef } from "react";
import "react-image-crop/dist/ReactCrop.css";
import { ReactCrop, makeAspectCrop, centerCrop, convertToPixelCrop } from 'react-image-crop';
import { useDebounceEffect } from './useDebounceEffect';
import CropControls from '../ControlsPanel/CropControls'; // Import the CropControls component

// Function to center the crop based on aspect ratio
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

// Function to handle image load
function onImageLoad(e) {
  const { width, height } = e.currentTarget;
  if (aspect) {
    setCrop(centerAspectCrop(width, height, aspect));
  }
}

// Canvas preview function
function canvasPreview(image, canvas, crop, scale = 1, rotate = 0) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = crop.width * scaleX * pixelRatio;
  canvas.height = crop.height * scaleY * pixelRatio;

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();
  ctx.translate(-cropX, -cropY);
  ctx.translate(centerX, centerY);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  );
  ctx.restore();
}

const ImageUpload = ({ image, handleImageUpload, onCropComplete }) => {
  const [crops, setCrops] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const previewCanvasRef = useRef(null);
  const imgRef = useRef(null);
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [aspect, setAspect] = useState(16 / 9);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  console.log("ImageUpload - previewCanvasRef:", previewCanvasRef);
  console.log("ImageUpload - imgRef:", imgRef);

  // Handle image download
  async function onDownloadCropClick() {
    const image = imgRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!image || !previewCanvas || !completedCrop) {
      throw new Error('Crop canvas does not exist');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreen = new OffscreenCanvas(
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
    );
    const ctx = offscreen.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      previewCanvas,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height,
      0,
      0,
      offscreen.width,
      offscreen.height,
    );

    const blob = await offscreen.convertToBlob({
      type: 'image/png',
    });

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'cropped-image.png';
    link.click();
    URL.revokeObjectURL(blobUrl);
  }

  // Debounce effect for canvas preview
  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate,
        );
      }
    },
    100,
    [completedCrop, scale, rotate],
  );

  // Toggle aspect ratio
  function handleToggleAspectClick() {
    if (aspect) {
      setAspect(undefined);
    } else {
      setAspect(16 / 9);

      if (imgRef.current) {
        const { width, height } = imgRef.current;
        const newCrop = centerAspectCrop(width, height, 16 / 9);
        setCrop(newCrop);
        setCompletedCrop(convertToPixelCrop(newCrop, width, height));
      }
    }
  }

  return (
    <div className="w-[98%] h-[90%] flex justify-center items-center bg-red-500 border-2 border-black overflow-hidden">
      {image ? (
        <>
          <ReactCrop
            crop={crops}
            onChange={(newCrop) => setCrops(newCrop)}
            onComplete={(crop) => setCompletedCrop(crop)}
            minWidth={50}
            minHeight={50}
            aspect={aspect}
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={image}
              onLoad={onImageLoad}
              style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
            />
          </ReactCrop>
          {previewCanvasRef.current && imgRef.current && (
            <CropControls
              crop={crops}
              handleWidthChange={(e) => setCrops({ ...crops, width: e.target.value })}
              handleHeightChange={(e) => setCrops({ ...crops, height: e.target.value })}
              handlePositionXChange={(e) => setCrops({ ...crops, x: e.target.value })}
              handlePositionYChange={(e) => setCrops({ ...crops, y: e.target.value })}
              handleCropOptionChange={(value) => setAspect(eval(value))} // Update aspect ratio
              cropOption={`${aspect}`}
              imageProperties={{
                width: imgRef.current?.naturalWidth,
                height: imgRef.current?.naturalHeight,
                size: imgRef.current?.src.length,
                type: "JPEG",
              }}
              formatFileSize={(bytes) => `${(bytes / 1024).toFixed(2)} KB`}
              imageSrc={image}
              previewCanvasRef={previewCanvasRef}
              completedCrop={completedCrop}
              imgRef={imgRef}
            />
          )}
        </>
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
  );
};

export default ImageUpload;