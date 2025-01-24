import React, { useState, useRef } from "react";
import CropControls from "../ControlsPanel/CropControls";
import ImageUpload from "./ImageUpload";
import ImageActions from "./ImageActions";
import { formatFileSize } from "../../../utils/ImageUtils";

const ImagePannel = () => {
  const [image, setImage] = useState(null);
  const [imageProperties, setImageProperties] = useState({ width: 0, height: 0, size: 0, type: "" });
  const [crop, setCrop] = useState({ aspect: 5 / 4, width: 0, height: 0, x: 0, y: 0 });
  const [croppedImage, setCroppedImage] = useState(null);
  const [cropOption, setCropOption] = useState("5:4");
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const imgRef = useRef(null);

const handleImageUpload = (event) => {
  console.log("Image upload initiated");
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("File read successfully");
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          setImage(img.src);
          console.log("Image loaded:", img.src);
          setImageProperties({
            width: img.width,
            height: img.height,
            size: file.size,
            type: file.type.split("/")[1].toUpperCase(),
          });
          setCrop({ aspect: 5 / 4, width: img.width, height: img.height, x: 0, y: 0 });
          setHistory([]);
          setFuture([]);
          setCroppedImage(null);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (crop) => {
    if (image && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, crop);
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

  const handleCrop = () => {
    if (imgRef.current && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, crop);
      setHistory([...history, image]);
      setImage(croppedImageUrl);
      setCroppedImage(croppedImageUrl);
      setFuture([]);
      setCrop({ ...crop, width: 0, height: 0, x: 0, y: 0 });
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previousImage = history[history.length - 1];
      setFuture([image, ...future]);
      setImage(previousImage);
      setHistory(history.slice(0, -1));
    }
  };

  const handleRedo = () => {
    if (future.length > 0) {
      const nextImage = future[0];
      setHistory([...history, image]);
      setImage(nextImage);
      setFuture(future.slice(1));
    }
  };

  const handleReset = () => {
    setHistory([]);
    setFuture([]);
    setImage(history[0] || image);
    setCroppedImage(null);
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
    <div className="w-full flex gap-3 mt-7">
      {/* Left Sidebar */}
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

      {/* Right Side (Image Preview and Actions) */}
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
