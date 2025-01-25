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

  // Constrain crop to image boundaries
  const constrainCrop = useCallback((newCrop) => {
    const { width, height } = imageProperties;
    
    // Ensure crop doesn't exceed image boundaries
    const constrainedCrop = {
      ...newCrop,
      // Constrain x position
      x: Math.max(0, Math.min(newCrop.x, width - newCrop.width)),
      // Constrain y position
      y: Math.max(0, Math.min(newCrop.y, height - newCrop.height)),
      // Ensure width and height don't exceed image dimensions
      width: Math.min(newCrop.width, width - newCrop.x),
      height: Math.min(newCrop.height, height - newCrop.y)
    };

    return constrainedCrop;
  }, [imageProperties]);

  // Safe set crop that always constrains crop
  const safeSetCrop = useCallback((cropUpdate) => {
    const updatedCrop = typeof cropUpdate === 'function' 
      ? constrainCrop(cropUpdate(crop)) 
      : constrainCrop(cropUpdate);
    setCrop(updatedCrop);
  }, [crop, constrainCrop]);

  // Reset to initial state
// Reset to initial state
const resetToInitialState = useCallback(() => {
  if (originalImage) {
    const img = new Image();
    img.src = originalImage;
    img.onload = () => {
      // Reset image
      setImage(originalImage);

      // Reset image properties
      setImageProperties({
        width: img.width,
        height: img.height,
        size: imageProperties.size,
        type: imageProperties.type
      });

      // Reset crop to full image dimensions
      safeSetCrop({
        aspect: 5 / 4, 
        width: img.width, 
        height: (img.width * 4) / 5, 
        x: 0, 
        y: 0 
      });


      setCrop({ aspect: 5 / 4, width: 0, height: 0, x: 0, y: 0 })

      // Clear history and future
      setHistory([]);
      setFuture([]);
      setCroppedImage(null);
      setCropOption("5:4");
    };
  }
}, [originalImage, imageProperties, safeSetCrop]);
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

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          // Set original and current image
          setOriginalImage(img.src);
          setImage(img.src);

          // Set image properties
          setImageProperties({
            width: img.width,
            height: img.height,
            size: file.size,
            type: file.type.split("/")[1].toUpperCase(),
          });
          
          // Reset crop to full image dimensions
          safeSetCrop({
            aspect: 5 / 4, 
            width: img.width, 
            height: (img.width * 4) / 5, 
            x: 0, 
            y: 0 
          });
          
          // Clear history and other states
          setHistory([]);
          setFuture([]);
          setCroppedImage(null);
          setCropOption("5:4");
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle crop completion
  const onCropComplete = useCallback((newCrop) => {
    if (imgRef.current && newCrop.width && newCrop.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, newCrop);
      setCroppedImage(croppedImageUrl);
    }
  }, [getCroppedImg]);

  // Handle crop option change
  const handleCropOptionChange = useCallback((option) => {
    console.log("Before : ",option )
    setCropOption(option);
    const { width, height } = imageProperties;
    console.log("after : ",width, height )
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
newCrop.width = 50;
newCrop.height = 50;
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

    // Use constrainCrop to ensure crop stays within image boundaries
safeSetCrop(newCrop);
setCrop({ aspect: 5 / 4, width: 0, height: 0, x: 0, y: 0 })
  }, [crop,  safeSetCrop]);

  // Handle width change
  const handleWidthChange = useCallback((e) => {
    const newWidth = parseInt(e.target.value || 0, 10);
    const maxWidth = imageProperties.width - crop.x;
    
    if (!isNaN(newWidth)) {
      safeSetCrop(prev => ({
        ...prev, 
        width: Math.min(Math.max(newWidth, 0), maxWidth),
        height: newWidth / prev.aspect
      }));
    }
  }, [crop.x, imageProperties, crop.aspect, safeSetCrop]);

  // Handle height change
  const handleHeightChange = useCallback((e) => {
    const newHeight = parseInt(e.target.value || 0, 10);
    const maxHeight = imageProperties.height - crop.y;
    
    if (!isNaN(newHeight)) {
      safeSetCrop(prev => ({
        ...prev, 
        height: Math.min(Math.max(newHeight, 0), maxHeight),
        width: newHeight * prev.aspect
      }));
    }
  }, [crop.y, imageProperties, crop.aspect, safeSetCrop]);

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
    console.log("value of e:",e)
    const newY = parseInt(e.target.value || 0, 10);
    console.log("value of new y:",newY)
    const maxY = imageProperties.height - crop.height;
    console.log("value of max y:",maxY)
    
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
      safeSetCrop(prev => ({ ...prev, width: 0, height: 0, x: 0, y: 0 }));
    }
  }, [image, crop, getCroppedImg, safeSetCrop]);

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
    resetToInitialState();
  }, [resetToInitialState]);

  // Handle save action
  const handleSave = useCallback(() => {
    if (croppedImage) {
      const link = document.createElement("a");
      link.href = croppedImage;
      link.download = "cropped-image.jpeg";
      link.click();
    }
  }, [croppedImage]);

  return (
    <div className="h-screen w-full">
      <div className="w-full h-screen flex gap-3">
        <div className="bg-white rounded-sm ml-1 shadow-sm h-screen w-[300px]">
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
        </div>
        <div className="h-[80%] w-[80%] max-h-full flex flex-col justify-center items-center">
          <ImageUpload 
            image={image}
            handleImageUpload={handleImageUpload}
            crop={crop}
            setCrop={safeSetCrop}
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
