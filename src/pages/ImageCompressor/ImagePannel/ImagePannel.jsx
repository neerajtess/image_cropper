import React, { useState, useRef, useCallback, useEffect } from "react";
import CropControls from "../ControlsPanel/CropControls";
import ImageUpload from "./ImageUpload";
import ImageActions from "./ImageActions";
import { formatFileSize } from "../../../utils/ImageUtils";

const ImagePannel = () => {
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [imageProperties, setImageProperties] = useState({ width: 0, height: 0, size: 0, type: "" });
  const [crop, setCrop] = useState({ aspect: 5 / 4, width: 0, height: 0, x: 0, y: 0 });
  const [croppedImage, setCroppedImage] = useState(null);
  const [cropOption, setCropOption] = useState("5:4");
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const imgRef = useRef(null);

  // Validate crop values
  const isValidCrop = (crop) => {
    return (
      typeof crop.x === 'number' &&
      typeof crop.y === 'number' &&
      typeof crop.width === 'number' &&
      typeof crop.height === 'number' &&
      !isNaN(crop.x) &&
      !isNaN(crop.y) &&
      !isNaN(crop.width) &&
      !isNaN(crop.height)
    );
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          setOriginalImage(img.src);
          setImage(img.src);
          setImageProperties({
            width: img.width,
            height: img.height,
            size: file.size,
            type: file.type.split("/")[1].toUpperCase(),
          });
          
          // Reset crop to full image dimensions
          setCrop({
            aspect: 5 / 4, 
            width: img.width, 
            height: img.height, 
            x: 0, 
            y: 0 
          });
          
          setHistory([]);
          setFuture([]);
          setCroppedImage(null);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Get cropped image
  const getCroppedImg = useCallback((image, crop) => {
    if (!crop.width || !crop.height) {
      return null;
    }
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
  }, []);

  // Handle crop completion
  const onCropComplete = useCallback((newCrop) => {
    if (imgRef.current && newCrop.width && newCrop.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, newCrop);
      setCroppedImage(croppedImageUrl);
    }
  }, [getCroppedImg]);

  // Handle crop option change
  const handleCropOptionChange = useCallback((option) => {
    setCropOption(option);
    const { width, height } = imageProperties;
    let newCrop = { ...crop };

    switch (option) {
      case "16:9":
        newCrop.aspect = 16 / 9;
        newCrop.width = Math.min(width, height * (16/9));
        newCrop.height = newCrop.width * (9/16);
        break;
      case "4:3":
        newCrop.aspect = 4 / 3;
        newCrop.width = Math.min(width, height * (4/3));
        newCrop.height = newCrop.width * (3/4);
        break;
      case "1:1":
        newCrop.aspect = 1;
        newCrop.width = Math.min(width, height);
        newCrop.height = newCrop.width;
        break;
      case "9:16":
        newCrop.aspect = 9 / 16;
        newCrop.width = Math.min(width, height * (9/16));
        newCrop.height = newCrop.width * (16/9);
        break;
      case "3:2":
        newCrop.aspect = 3 / 2;
        newCrop.width = Math.min(width, height * (3/2));
        newCrop.height = newCrop.width * (2/3);
        break;
      default:
        newCrop.aspect = 5 / 4;
        newCrop.width = Math.min(width, height * (5/4));
        newCrop.height = newCrop.width * (4/5);
    }

    // Constrain x and y
    newCrop.x = Math.max(0, Math.min(newCrop.x, width - newCrop.width));
    newCrop.y = Math.max(0, Math.min(newCrop.y, height - newCrop.height));

    setCrop(newCrop);
  }, [crop, imageProperties]);

  // Handle width change
  const handleWidthChange = useCallback((e) => {
    const newWidth = parseInt(e.target.value || 0, 10);
    const maxWidth = imageProperties.width - crop.x;
    
    if (!isNaN(newWidth)) {
      setCrop(prev => ({
        ...prev, 
        width: Math.min(Math.max(newWidth, 0), maxWidth),
        height: newWidth / prev.aspect
      }));
    }
  }, [crop.x, imageProperties, crop.aspect]);

  // Handle height change
  const handleHeightChange = useCallback((e) => {
    const newHeight = parseInt(e.target.value || 0, 10);
    const maxHeight = imageProperties.height - crop.y;
    
    if (!isNaN(newHeight)) {
      setCrop(prev => ({
        ...prev, 
        height: Math.min(Math.max(newHeight, 0), maxHeight),
        width: newHeight * prev.aspect
      }));
    }
  }, [crop.y, imageProperties, crop.aspect]);

  // Handle position X change
  const handlePositionXChange = useCallback((e) => {
    const newX = parseInt(e.target.value || 0, 10);
    const maxX = imageProperties.width - crop.width;
    
    setCrop(prev => ({
      ...prev, 
      x: Math.min(Math.max(newX, 0), maxX)
    }));
  }, [imageProperties, crop.width]);

  // Handle position Y change
  const handlePositionYChange = useCallback((e) => {
    const newY = parseInt(e.target.value || 0, 10);
    const maxY = imageProperties.height - crop.height;
    
    setCrop(prev => ({
      ...prev, 
      y: Math.min(Math.max(newY, 0), maxY)
    }));
  }, [imageProperties, crop.height]);

  // Handle crop action
  const handleCrop = useCallback(() => {
    if (imgRef.current && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, crop);
      setHistory(prev => [...prev, image]);
      setImage(croppedImageUrl);
      setCroppedImage(croppedImageUrl);
      setFuture([]);
      setCrop(prev => ({ ...prev, width: 0, height: 0, x: 0, y: 0 }));
    }
  }, [image, crop, getCroppedImg]);

  // Handle undo action
  const handleUndo = useCallback(() => {
    if (history.length > 0) {
      const previousImage = history[history.length - 1];
      setFuture(prev => [image, ...prev]);
      setImage(previousImage);
      setHistory(prev => prev.slice(0, -1));
    }
  }, [history, image]);

  // Handle redo action
  const handleRedo = useCallback(() => {
    if (future.length > 0) {
      const nextImage = future[0];
      setHistory(prev => [...prev, image]);
      setImage(nextImage);
      setFuture(prev => prev.slice(1));
    }
  }, [future, image]);

  // Handle reset action
  const handleReset = useCallback(() => {
    setImage(originalImage);
    setHistory([]);
    setFuture([]);
    setCroppedImage(null);
    setCrop({
      aspect: 5 / 4, 
      width: imageProperties.width, 
      height: (imageProperties.width * 4) / 5, 
      x: 0, 
      y: 0 
    });
  }, [originalImage, imageProperties]);

  // Handle save action
  const handleSave = useCallback(() => {
    if (croppedImage) {
      const link = document.createElement("a");
      link.href = croppedImage;
      link.download = "cropped-image.jpeg";
      link.click();
    }
  }, [croppedImage]);

  // Log crop state for debugging
  useEffect(() => {
    // console.log("Crop State:", crop);
  }, [crop]);

  return (
    <div className="w-full flex gap-3 mt-7 h-screen">
      <CropControls
        crop={crop}
        handleWidthChange={handleWidthChange}
        handleHeightChange={handleHeightChange}
        handlePositionXChange={handlePositionXChange}
        handlePositionYChange={handlePositionYChange}
        handleCropOptionChange={handleCropOptionChange}
        cropOption={cropOption}
        imageProperties={imageProperties}
        formatFileSize={formatFileSize}
        imageSrc={image}
      />

      <div className="flex-1">
        <div className="h-full">
          <ImageUpload 
            image={image}
            handleImageUpload={handleImageUpload}
            crop={crop}
            setCrop={setCrop}
            onCropComplete={onCropComplete}
            imgRef={imgRef}
          />
          <ImageActions
            handleCrop={handleCrop}
            handleUndo={handleUndo}
            handleRedo={handleRedo}
            handleReset={handleReset}
            handleSave={handleSave}
            croppedImage={croppedImage}
          />
        </div>
      </div>
    </div>
  );
};

export default ImagePannel;