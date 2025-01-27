import React, { useState, useRef, useEffect } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import { LuCrop } from "react-icons/lu";
import { TbArrowBackUp, TbArrowForwardUp } from "react-icons/tb";
import { IoReload } from "react-icons/io5";
import { FiSave } from "react-icons/fi";
import { canvasPreview } from "./canvasPreview";
import { useDebounceEffect } from "./useDebounceEffect";
import "react-image-crop/dist/ReactCrop.css";
import { MdDeleteForever } from "react-icons/md";

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
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");

  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const hiddenAnchorRef = useRef(null);
  const blobUrlRef = useRef("");

  useEffect(() => {
    if (crop && naturalDimensions.width > 0) {
      const currentWidth = Math.round((crop.width / 100) * naturalDimensions.width);
      setWidthInput(currentWidth.toString());
    }
  }, [crop, naturalDimensions.width]);

  useEffect(() => {
    if (crop && naturalDimensions.height > 0) {
      const currentHeight = Math.round((crop.height / 100) * naturalDimensions.height);
      setHeightInput(currentHeight.toString());
    }
  }, [crop, naturalDimensions.height]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result);
        setImage(reader.result);
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
      setCrop(undefined);
      setCompletedCrop(undefined);
      setImage(originalImage);
      setScale(1);
      setRotate(0);
    }
  };

  const handleRedoClick = () => {
    if (redoStack.length > 0) {
      const newRedoStack = [...redoStack];
      const nextState = newRedoStack.shift();

      setCropHistory([...cropHistory, { crop, completedCrop, image, scale, rotate }]);
      setCrop(nextState.crop);
      setCompletedCrop(nextState.completedCrop);
      setImage(nextState.image);
      setScale(nextState.scale || 1);
      setRotate(nextState.rotate || 0);
      setRedoStack(newRedoStack);
    }
  };

  const handleResetClick = () => {
    setImage(originalImage);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setScale(1);
    setRotate(0);
    setCropHistory([]);
    setRedoStack([]);
  };

  const handleCropClick = async () => {
    if (!completedCrop || !imgRef.current) return;

    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

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

  const convertToPixelCrop = (percentageCrop, imgWidth, imgHeight) => ({
    x: (percentageCrop.x / 100) * imgWidth,
    y: (percentageCrop.y / 100) * imgHeight,
    width: (percentageCrop.width / 100) * imgWidth,
    height: (percentageCrop.height / 100) * imgHeight,
  });

  const onDownloadCropClick = async () => {
    if (!imgRef.current) {
      alert("Image is not loaded.");
      return;
    }

    const image = imgRef.current;
    const offscreen = new OffscreenCanvas(image.naturalWidth, image.naturalHeight);
    const ctx = offscreen.getContext("2d");
    
    ctx.drawImage(image, 0, 0);
    const blob = await offscreen.convertToBlob({ type: "image/png" });
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteClick = () => {
    setImage(null);
    setOriginalImage(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setCropHistory([]);
    setRedoStack([]);
    setScale(1);
    setRotate(0);
    setAspect(undefined);
    setNaturalDimensions({ width: 0, height: 0 });
    setOriginalDimensions({ width: 0, height: 0 });
    setWidthInput("");
    setHeightInput("");
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  useDebounceEffect(
    async () => {
      if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
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

  return (
    <div className="p-2">
      <div className="flex gap-1">
        <div className="flex flex-col pr-2 max-w-[300px]">
          <div className="bg-gray-100 w-full p-3 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Resizing Options</h2>

            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Width:</label>
                <input
                  type="number"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md outline-none"
                  placeholder="Enter width"
                  value={widthInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setWidthInput(value);
                    const newWidth = parseInt(value, 10);
                    if (!isNaN(newWidth) && imgRef.current) {
                      const currentX = ((crop?.x || 0) / 100) * naturalDimensions.width;
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
                  onBlur={() => {
                    if (widthInput === "" || isNaN(parseInt(widthInput, 10))) {
                      const currentWidth = Math.round((crop?.width / 100) * naturalDimensions.width) || 1;
                      setWidthInput(currentWidth.toString());
                    }
                  }}
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Height:</label>
                <input
                  type="number"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md outline-none"
                  placeholder="Enter height"
                  value={heightInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setHeightInput(value);
                    const newHeight = parseInt(value, 10);
                    if (!isNaN(newHeight) && imgRef.current) {
                      const currentY = ((crop?.y || 0) / 100) * naturalDimensions.height;
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
                  onBlur={() => {
                    if (heightInput === "" || isNaN(parseInt(heightInput, 10))) {
                      const currentHeight = Math.round((crop?.height / 100) * naturalDimensions.height) || 1;
                      setHeightInput(currentHeight.toString());
                    }
                  }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Crop Option:</label>
              <select
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md outline-none"
                onChange={(e) => {
                  const newAspect = parseFloat(e.target.value);
                  setAspect(newAspect || undefined);
                  if (imgRef.current) {
                    const { width, height } = imgRef.current;
                    let newCrop = isNaN(newAspect) 
                      ? { unit: "%", width: 100, height: 100, x: 0, y: 0 }
                      : centerAspectCrop(width, height, newAspect);
                    setCrop(newCrop);
                    setCompletedCrop(convertToPixelCrop(newCrop, width, height));
                  }
                }}
              >
                <option value="">Custom</option>
                <option value={16 / 9}>16:9</option>
                <option value={4 / 3}>4:3</option>
                <option value={1}>1:1</option>
              </select>
            </div>

            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-700">Crop Position</h3>
              <table className="mt-3 w-full ">
                <tbody>
                  <tr className="flex gap-4">
                    <td>
                      <input
                        type="number"
                        className="w-full p-2 border border-gray-300 rounded-md outline-none"
                        value={crop ? Math.round((crop.x / 100) * naturalDimensions.width) : ""}
                        onChange={(e) => {
                          const newX = parseInt(e.target.value, 10) || 0;
                          if (!isNaN(newX) && imgRef.current) {
                            const currentWidth = ((crop?.width || 0) / 100) * naturalDimensions.width;
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
                    <td>
                      <input
                        type="number"
                        className="w-full p-2 border border-gray-300 rounded-md outline-none"
                        value={crop ? Math.round((crop.y / 100) * naturalDimensions.height) : ""}
                        onChange={(e) => {
                          const newY = parseInt(e.target.value, 10) || 0;
                          if (!isNaN(newY) && imgRef.current) {
                            const currentHeight = ((crop?.height || 0) / 100) * naturalDimensions.height;
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
          </div>
          <div className="bg-blue-100 border border-black h-4/5">Ad-1</div>
        </div>

        <div className="flex-1">
          <div className="p-1 border-2 border-dashed border-gray-500 rounded-lg bg-gray-50">
            <div className="w-full h-[500px] flex justify-center items-center overflow-hidden">
              {image ? (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  minWidth={imgRef.current?.clientWidth * 0.05 || 50}
                  minHeight={imgRef.current?.clientHeight * 0.05 || 50}
                >
                  <img
                    ref={imgRef}
                    alt="Uploaded"
                    src={image}
                    style={{
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                      maxWidth: "100%",
                      maxHeight: "500px",
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
                    <div className="px-4 py-2 bg-blue-200 text-blue-700 rounded-lg hover:bg-blue-100">
                      Choose File
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center mt-0">
            <div className="flex justify-center gap-4 grow items-center">
              <div className="group flex flex-col items-center p-2 cursor-pointer hover:scale-125 transition-transform select-none active:scale-75" onClick={handleCropClick}>
                <span className="text-sm opacity-0 group-hover:opacity-100">Crop</span>
                <LuCrop size={25} />
              </div>
              <div className="group flex flex-col items-center p-2 cursor-pointer hover:scale-125 transition-transform select-none active:scale-75" onClick={handleUndoClick}>
                <span className="text-sm opacity-0 group-hover:opacity-100">Undo</span>
                <TbArrowBackUp size={25} />
              </div>
              <div className="group flex flex-col items-center p-2 cursor-pointer hover:scale-125 transition-transform select-none active:scale-75" onClick={handleRedoClick}>
                <span className="text-sm opacity-0 group-hover:opacity-100">Redo</span>
                <TbArrowForwardUp size={25} />
              </div>
              <div className="group flex flex-col items-center p-2 cursor-pointer hover:scale-125 transition-transform select-none active:scale-75" onClick={handleResetClick}>
                <span className="text-sm opacity-0 group-hover:opacity-100">Reset</span>
                <IoReload size={25} />
              </div>
              <div className="group flex flex-col items-center p-2 cursor-pointer hover:scale-125 transition-transform select-none active:scale-75" onClick={onDownloadCropClick}>
                <span className="text-sm opacity-0 group-hover:opacity-100">Save</span>
                <FiSave size={25} />
              </div>
              <div className="group flex flex-col items-center p-2 cursor-pointer hover:scale-125 transition-transform select-none active:scale-75" onClick={handleDeleteClick}>
                <span className="text-sm opacity-0 group-hover:opacity-100">Delete</span>
                <MdDeleteForever size={25} />
              </div>
            </div>
            <div className="px-10 flex flex-col justify-center items-center text-zinc-500">
  {crop && naturalDimensions && crop.width && crop.height ? (
    <p className="text-sm font-medium">
      Current:{" "}
      <span>
        {`${Math.round((crop.width / 100) * naturalDimensions.width)} x ${Math.round((crop.height / 100) * naturalDimensions.height)}`}
      </span>
    </p>
  ) : null}

  {originalDimensions && originalDimensions.width && originalDimensions.height ? (
    <p className="text-sm mt-1 font-medium">
      Original:{" "}
      <span className="font-medium">
        {originalDimensions.width} x {originalDimensions.height}
      </span>
    </p>
  ) : null}
</div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCompressor;