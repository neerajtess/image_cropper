import React, { useState, useRef, useEffect } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import { LuCrop } from "react-icons/lu";
import { TbArrowBackUp, TbArrowForwardUp } from "react-icons/tb";
import { IoReload } from "react-icons/io5";
import { FiSave } from "react-icons/fi";
import "react-image-crop/dist/ReactCrop.css";
import { MdDeleteForever } from "react-icons/md";
import { Link } from "react-router-dom";

const DPI = 96; // Dots per inch for conversion
const CM_PER_INCH = 2.54;

export default function Resizer() {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [unit, setUnit] = useState("px");
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
  const [sizePercent, setSizePercent] = useState(100);
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [aspect, setAspect] = useState();
  const [saveFormat, setSaveFormat] = useState("original");

  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Unit conversion functions
  const toPixels = (value, unit) => {
    if (unit === "in") return value * DPI;
    if (unit === "cm") return (value * DPI) / CM_PER_INCH;
    return value;
  };

  const fromPixels = (pixels, unit) => {
    if (unit === "in") return pixels / DPI;
    if (unit === "cm") return (pixels * CM_PER_INCH) / DPI;
    return pixels;
  };

  // Image load handler
  const onImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setNaturalDimensions({ width: naturalWidth, height: naturalHeight });

    const initialCrop = centerCrop(
      makeAspectCrop(
        { unit: "%", width: 100 },
        naturalWidth / naturalHeight,
        naturalWidth,
        naturalHeight
      ),
      naturalWidth,
      naturalHeight
    );

    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  };

  // Handle dimension inputs
  const handleDimensionChange = (dimension, value) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return;

    const naturalSize = naturalDimensions[dimension];
    const pixels = toPixels(numericValue, unit);
    const percentage = (pixels / naturalSize) * 100;

    setCrop(prev => ({
      ...prev,
      [dimension]: percentage,
      ...(aspect && {
        [dimension === "width" ? "height" : "width"]:
          (percentage / (aspect === "free" ? 1 : aspect)) * 100
      })
    }));
  };

  // Handle preset selection
  const handlePresetChange = (e) => {
    const [width, height] = e.target.value.split("x").map(Number);
    if (!width || !height) {
      setAspect(undefined);
      return;
    }

    const newAspect = width / height;
    setAspect(newAspect);

    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      const newCrop = centerCrop(
        makeAspectCrop(
          { unit: "%", width: 100 },
          newAspect,
          naturalWidth,
          naturalHeight
        ),
        naturalWidth,
        naturalHeight
      );

      setCrop(newCrop);
      setCompletedCrop(newCrop);
    }
  };

  // Save image handler
  const handleSaveImage = () => {
    if (!completedCrop || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const fileType = saveFormat === "original" ? "image/png" : `image/${saveFormat}`;

    canvas.toBlob(blob => {
      const link = document.createElement("a");
      link.download = `cropped-image.${saveFormat}`;
      link.href = URL.createObjectURL(blob);
      link.click();
    }, fileType);
  };

  // Update canvas preview
  useEffect(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const image = imgRef.current;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );
  }, [completedCrop]);

  return (
    <div className="p-2">
      <div className="flex gap-1">
        <div className="flex flex-col pr-2 w-1/5">
          <div className="bg-gray-100 w-full p-3 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Resizing Options</h2>

            {/* Unit Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Unit:</label>
              <select
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md outline-none"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="px">Pixels</option>
                <option value="in">Inches</option>
                <option value="cm">Centimeters</option>
                <option value="%">Percent</option>
              </select>
            </div>

            {/* Dimension Inputs */}
            <div className="flex gap-4 mb-4">
              {unit !== "%" ? (
                <>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Width:</label>
                    <input
                      type="number"
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md outline-none"
                      value={widthInput}
                      onChange={(e) => {
                        setWidthInput(e.target.value);
                        handleDimensionChange("width", e.target.value);
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Height:</label>
                    <input
                      type="number"
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md outline-none"
                      value={heightInput}
                      onChange={(e) => {
                        setHeightInput(e.target.value);
                        handleDimensionChange("height", e.target.value);
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Size:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={sizePercent}
                      onChange={(e) => {
                        const newSize = parseInt(e.target.value, 10);
                        setSizePercent(newSize);

                        if (imgRef.current && naturalDimensions) {
                          const scale = newSize / 100;
                          const newCrop = {
                            ...crop,
                            width: 100 * scale,
                            height: 100 * scale,
                          };

                          setCrop(newCrop);
                          setCompletedCrop(newCrop);
                        }
                      }}
                      className="flex-1"
                    />
                    <span className="text-sm">{sizePercent}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Crop Presets */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Crop Option:</label>
              <select
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md outline-none"
                onChange={handlePresetChange}
              >
                <option value="">Custom</option>
                <option value="1080x1080">Instagram Post (1080x1080)</option>
                <option value="1920x1080">YouTube Thumbnail (1920x1080)</option>
                <option value="1200x628">Facebook Post (1200x628)</option>
                {/* Add other presets as needed */}
              </select>
            </div>

            {/* Save Format */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Save Image As:</label>
              <select
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md outline-none"
                value={saveFormat}
                onChange={(e) => setSaveFormat(e.target.value)}
              >
                <option value="original">Original</option>
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WEBP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Image Area */}
        <div className="flex-1">
          <div className="p-1 border-2 border-dashed border-gray-500 rounded-lg bg-gray-50">
            <div className="w-full h-[500px] flex justify-center items-center overflow-hidden relative">
              {image ? (
                <>
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspect}
                  >
                    <img
                      ref={imgRef}
                      alt="Uploaded"
                      src={image}
                      onLoad={onImageLoad}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "500px",
                        objectFit: "contain",
                      }}
                    />
                  </ReactCrop>
                  <canvas
                    ref={previewCanvasRef}
                    style={{
                      display: "none",
                    }}
                  />
                </>
              ) : (
                <div className="text-center">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setImage(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="px-4 py-2 bg-blue-200 text-blue-700 rounded-lg hover:bg-blue-100">
                      Choose File
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center w-full mt-0">
            <div className="flex gap-4 grow items-start">
              {/* Add your tool buttons here */}
              <button
                className="group flex flex-col items-center p-2 cursor-pointer hover:scale-125 transition-transform select-none active:scale-75"
                onClick={handleSaveImage}
              >
                <FiSave size={25} />
                <span className="text-sm opacity-0 group-hover:opacity-100">Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}