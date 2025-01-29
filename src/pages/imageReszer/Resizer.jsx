import React, { useState, useRef, useEffect } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import { LuCrop } from "react-icons/lu";
import { TbArrowBackUp, TbArrowForwardUp } from "react-icons/tb";
import { IoReload } from "react-icons/io5";
import { FiSave } from "react-icons/fi";
import { canvasPreview } from "./canvasPreview";
import { useDebounceEffect } from "./useDebounceEffect";
import "react-image-crop/dist/ReactCrop.css";
import { Link } from "react-router-dom";
import { MdDeleteForever } from "react-icons/md";
import { IoMdResize } from "react-icons/io";

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

const Resizer = () => {
    const [image, setImage] = useState(null);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const [cropHistory, setCropHistory] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [originalImage, setOriginalImage] = useState(null);
    const [scale, setScale] = useState(1);
    const [unit, setUnit] = useState("px");
    const [rotate, setRotate] = useState(0);
    const [aspect, setAspect] = useState(undefined);
    const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
    const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
    const [widthInput, setWidthInput] = useState("");
    const [heightInput, setHeightInput] = useState("");


    //   const [image, setImage] = useState(null);
    //   const [crop, setCrop] = useState();
    //   const [completedCrop, setCompletedCrop] = useState();
    //   const [unit, setUnit] = useState("px");
    //   const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
    const [sizePercent, setSizePercent] = useState(100);
    //   const [widthInput, setWidthInput] = useState("");
    //   const [heightInput, setHeightInput] = useState("");
    //   const [aspect, setAspect] = useState();
    const [saveFormat, setSaveFormat] = useState("original");
    const [originalFileType, setOriginalFileType] = useState("");



    const imgRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const hiddenAnchorRef = useRef(null);
    const blobUrlRef = useRef("");


    const toPixels = (value, unit) => {
        if (unit === "in") return value * DPI;
        if (unit === "cm") return (value * DPI) / CM_PER_INCH;
        return value;
    };

    const fromPixels = (value, unit) => {
        if (unit === "in") return value / DPI;
        if (unit === "cm") return (value * CM_PER_INCH) / DPI;
        return value;
    };


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
        
        console.log(e.currentTarget.src.split('/')[1].split(";")[0])
        setSaveFormat(e.currentTarget.src.split('/')[1].split(";")[0])  
        const { naturalWidth, naturalHeight } = e.currentTarget;
        setNaturalDimensions({ width: naturalWidth, height: naturalHeight });

        // Set original dimensions if not already set
        if (!originalDimensions.width && !originalDimensions.height) {
            setOriginalDimensions({ width: naturalWidth, height: naturalHeight });
        }

        // Calculate default crop size (30% of image)
        const defaultCrop = {
            unit: "%",
            width: 60,
            height: 60,
            x: (100 - 60) / 2,  // Center horizontally
            y: (100 - 60) / 2   // Center vertically
        };

        // If aspect ratio is set, create centered crop with that aspect
        if (aspect) {
            const aspectCrop = centerCrop(
                makeAspectCrop(
                    {
                        unit: "%",
                        width: 30  // Start with 30% width
                    },
                    aspect,
                    naturalWidth,
                    naturalHeight
                ),
                naturalWidth,
                naturalHeight
            );
            setCrop(aspectCrop);
            setCompletedCrop(aspectCrop);
        } else {
            // Use default crop if no aspect ratio
            setCrop(defaultCrop);
            setCompletedCrop(defaultCrop);
        }
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

    const handleSave = async () => {
        if (!completedCrop || !previewCanvasRef.current) {
            return;
        }

        const canvas = previewCanvasRef.current;
        const imageBlob = await new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, setSaveFormat || 'image/png'); // Default to 'image/png' if setSaveFormat is not provided
        });

        if (imageBlob) {
            const file = new File([imageBlob], 'cropped-image', {
                type: setSaveFormat || 'image/png', // Default to 'image/png' if setSaveFormat is not provided
            });

            // Now you can save or upload the file
            console.log(file);
        }
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









    const handlePresetChange = (e) => {
        const [width, height] = e.target.value.split("x").map(Number);
        if (!width || !height) return;

        const newAspect = width / height;
        setAspect(newAspect);

        if (imgRef.current) {
            const { naturalWidth, naturalHeight } = imgRef.current;

            let cropWidth = 100;
            let cropHeight = (height / width) * cropWidth;

            if (cropHeight > 100) {
                cropHeight = 100;
                cropWidth = (width / height) * cropHeight;
            }

            const newCrop = centerCrop(
                {
                    unit: "%",
                    width: cropWidth,
                    height: cropHeight,
                },
                naturalWidth,
                naturalHeight
            );

            setCrop(newCrop);
            setCompletedCrop(newCrop);
        }
    };




    const DPI = 96; // Dots per inch
    const CM_PER_INCH = 2.54; // Centimeters per inch



    const handleDimensionChange = (dimension, value) => {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) return;

        const naturalSize = naturalDimensions[dimension];
        const pixels = toPixels(numericValue, unit);
        const percentage = (pixels / naturalSize) * 100;

        // Calculate new width and height
        const newSize = {
            width: dimension === "width" ? percentage : crop?.width || 0,
            height: dimension === "height" ? percentage : crop?.height || 0
        };

        // If aspect ratio is set, adjust the other dimension
        if (aspect) {
            if (dimension === "width") {
                newSize.height = percentage / aspect;
            } else {
                newSize.width = percentage * aspect;
            }
        }

        // Calculate new x and y positions to keep crop within bounds
        let newX = crop?.x || 0;
        let newY = crop?.y || 0;

        // Adjust x position if crop would extend beyond right edge
        if (newX + newSize.width > 100) {
            newX = Math.max(0, 100 - newSize.width);
        }

        // Adjust y position if crop would extend beyond bottom edge
        if (newY + newSize.height > 100) {
            newY = Math.max(0, 100 - newSize.height);
        }

        setCrop(prev => ({
            ...prev,
            x: newX,
            y: newY,
            width: newSize.width,
            height: newSize.height
        }));
    };

    const handleSaveImage = () => {
        if (!completedCrop || !previewCanvasRef.current) return;

        const canvas = previewCanvasRef.current;
        let fileType;
        let extension;

        if (saveFormat === "original") {
            fileType = originalFileType || "image/png";
            extension = originalFileType ? originalFileType.split("/")[1] : "png";
        } else {
            fileType = `image/${saveFormat.toLowerCase()}`;
            extension = saveFormat.toLowerCase();
        }

        canvas.toBlob(blob => {
            const link = document.createElement("a");
            link.download = `cropped-image.${extension}`;
            link.href = URL.createObjectURL(blob);
            link.click();
        }, fileType);
    };

    const handleResizeImage = () => {
        if (!completedCrop || !imgRef.current) return;

        const { naturalWidth, naturalHeight } = imgRef.current;
        const pixelWidth = (completedCrop.width * naturalWidth) / 100;
        const pixelHeight = (completedCrop.height * naturalHeight) / 100;

        const canvas = document.createElement("canvas");
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(
            imgRef.current,
            (completedCrop.x * naturalWidth) / 100,
            (completedCrop.y * naturalHeight) / 100,
            pixelWidth,
            pixelHeight,
            0,
            0,
            pixelWidth,
            pixelHeight
        );

        const resizedImage = canvas.toDataURL();
        setImage(resizedImage);
        setNaturalDimensions({ width: pixelWidth, height: pixelHeight });
        setCrop({ unit: "%", width: 100, height: 100, x: 0, y: 0 });
        setCompletedCrop({ unit: "%", width: 100, height: 100, x: 0, y: 0 });
    };



    useEffect(() => {
        if (imgRef.current && naturalDimensions.width && naturalDimensions.height) {
            const scale = sizePercent / 100;
            const newCrop = {
                unit: "%",
                width: 100 * scale,
                height: 100 * scale,
            };

            setCrop(newCrop);
            console.log("new crop",newCrop)
            console.log("crop",crop)
            setCompletedCrop(newCrop);
            console.log("completed crop",completedCrop)
        }
    }, [sizePercent]);

    useEffect(() => {
        if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return;

        const canvas = previewCanvasRef.current;
        const ctx = canvas.getContext("2d");
        const image = imgRef.current;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const pixelWidth = (completedCrop.width * image.naturalWidth) / 100;
        const pixelHeight = (completedCrop.height * image.naturalHeight) / 100;

        canvas.width = pixelWidth;
        canvas.height = pixelHeight;

        ctx.drawImage(
            image,
            (completedCrop.x * image.naturalWidth) / 100,
            (completedCrop.y * image.naturalHeight) / 100,
            pixelWidth,
            pixelHeight,
            0,
            0,
            pixelWidth,
            pixelHeight
        );
    }, [completedCrop]);




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
        link.download = `image.${saveFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };










    return (
        <div className="p-2">
            <div className="flex gap-1">
                <div className="flex flex-col pr-2  w-1/5">
                    <div className="bg-gray-100 w-full p-3 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold mb-4">Resizing Options</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Unit:</label>
                            <select
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md outline-none"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                            >
                                <option value="px">Pixels</option>
                                <option value="%">Percent</option>
                                <option value="in">Inches</option>
                                <option value="cm">Centimeters</option>
                            </select>
                        </div>



                        <div className="flex gap-4 mb-4">
                            {unit === '%' ? (
                                <div className="flex-1 ">
                                    <label className="block text-sm font-medium text-gray-700">Size:</label>
                                    <div className="flex  items-center gap-2 mt-1">
                                        <input
                                            type="range"
                                            min="1"
                                            max="100"
                                            value={sizePercent}
                                            onChange={(e) => {
                                                const newSize = Math.max(0, parseInt(e.target.value, 10) || 0); // Ensure newSize is >= 0
                                                setSizePercent(newSize);

                                                if (imgRef.current && naturalDimensions) {
                                                    const scale = newSize / 100;
                                                    const newCrop = {
                                                        ...crop,
                                                        x: 0,
                                                        y: 0,
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
                            ) : (
                                <>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700">Width:</label>
                                        <input
                                            type="number"
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md outline-none"
                                            placeholder="Enter width"
                                            value={widthInput}
                                            onChange={(e) => {
                                                const value = e.target.value;

                                                handleDimensionChange("width", e.target.value);

                                                if (value === "") {
                                                    setWidthInput("");
                                                    handleDimensionChange("width", 0);
                                                    return;
                                                }
                                                const numericValue = parseFloat(value);
                                                if (!isNaN(numericValue)) {
                                                    console.log("i am herer")
                                                    console.log(value)
                                                    const maxwidth = fromPixels(naturalDimensions.width, unit);
                                                    const clampedValue = Math.max(0, Math.min(numericValue, maxwidth));
                                                    console.log("max width value", maxwidth, "clamp",clampedValue)
                                                    setWidthInput(clampedValue.toString());
                                                    handleDimensionChange("width", clampedValue);
                                                    const onePercent = maxwidth/100;
                                                    const widthValue = clampedValue/onePercent;
                                                    console.log(widthValue)
                                                    setCrop(previousCrop => ({ ...previousCrop, width: widthValue }))
                                                    setCompletedCrop(previousCrop => ({ ...previousCrop, width: widthValue }))
                                                    
                                            
                                            
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

                                                if (value === "") {
                                                    setHeightInput("");
                                                    handleDimensionChange("height", 0);
                                                    return;
                                                }

                                                const numericValue = parseFloat(value);

                                                if (!isNaN(numericValue)) {
                                                    console.log("i am herer")
                                                    const maxHeight = fromPixels(naturalDimensions.height, unit);
                                                    const clampedValue = Math.max(0, Math.min(numericValue, maxHeight));
                                                    console.log(clampedValue)
                                                    setHeightInput(clampedValue.toString());
                                                    handleDimensionChange("height", clampedValue);
                                                    const onePercent = maxHeight/100;
                                                    const hieghtValue = clampedValue/onePercent;
                                                    console.log(hieghtValue)
                                                    setCrop(previousCrop => ({ ...previousCrop, height: hieghtValue }))
                                                    setCompletedCrop(previousCrop => ({ ...previousCrop, height: hieghtValue }))
                                                }
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>






                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Crop Option:</label>
                            <select
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md outline-none"
                                onChange={handlePresetChange}
                            >
                                <option value={"6000 x 4000"}>Custom</option>
                                <option value={"336 x 280"}>AD - GDN Size 1</option>
                                <option value={"300 x 250"}>AD - GDN Size 2</option>
                                <option value={"300 x 600"}>AD - GDN Size 3</option>
                                <option value={"250 x 250"}>AD - GDN Size 4</option>
                                <option value={"970 x 90"}>AD - Large Leaderboard</option>
                                <option value={"728 x 90"}>AD - Leaderboard Banner</option>
                                <option value={"120 x 600"}>AD - Skyscraper 120</option>
                                <option value={"970 x 250"}>Billboard Banner</option>
                                <option value={"1200 x 160"}>Etsy Banner</option>
                                <option value={"1200 x 628"}>Facebook Ad / Link</option>
                                <option value={"820 x 312"}>Facebook Cover</option>
                                <option value={"940 x 788"}>Facebook Post</option>
                                <option value={"1080 x 1350"}>Instagram Portrait</option>
                                <option value={"1080 x 1080"}>Instagram Post</option>
                                <option value={"1080 x 1920"}>Instagram Story</option>
                                <option value={"1280 x 720"}>OBS Stream Overlay</option>
                                <option value={"600 x 900"}>Pinterest Pin</option>
                                <option value={"4000 x 4000"}>T-Shirt Design</option>
                                <option value={"1080 x 1920"}>TikTok</option>
                                <option value={"1200 x 380"}>Twitch Banner</option>
                                <option value={"1920 x 1080"}>Twitch Offline Banner</option>
                                <option value={"1280 x 720"}>Twitch Overlay</option>
                                <option value={"320 x 100"}>Twitch Panel</option>
                                <option value={"1500 x 500"}>X (formerly Twitter) Header</option>
                                <option value={"4000 x 4000"}>X (formerly Twitter) Post</option>
                                <option value={"1280 x 720"}>Webcam Frame</option>
                                <option value={"2560 x 1440"}>YouTube Banner</option>
                                <option value={"4000 x 4000"}>YouTube Profile Picture</option>
                                <option value={"1280 x 720"}>YouTube Thumbnail</option>
                            </select>
                        </div>



                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Save Image As:</label>
                            <select
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md outline-none"
                                value={saveFormat}
                                onChange={(e) => {
                                    if (e.target.value !== saveFormat) {
                                        setSaveFormat(e.target.value);
                                    }
                                }}
                            >

                                <option value="">Original</option>
                                <option value="jpeg">JPEG</option>
                                <option value="png">PNG</option>
                                <option value="svg">SVG</option>
                                <option value="gif">GIF</option>
                               <option value="webp">WEBP</option>


                            </select>
                        </div>



                    </div>
                    <div className="bg-blue-100 border border-black h-4/5">Ad-1</div>
                </div>

                <div className="flex-1">
                    <div className="p-1 border-2 border-dashed border-gray-500 rounded-lg bg-gray-50">
                        <div className="w-full h-[500px] flex justify-center items-center overflow-hidden relative">
                            {image ? (
                                <>
                                    
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(_, percentCrop) => {
                                            setCrop(percentCrop);
                                            console.log(crop)
                                        }
                                        }
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
                                    {/* Preview Canvas */}
                                    <div className="absolute top-4 right-4 w-32 h-32 border border-gray-300 rounded-md overflow-hidden bg-white z-10">
                                        <canvas
                                            ref={previewCanvasRef}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "contain",
                                            }}
                                        />
                                    </div>
                                </>
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

                    <div className="flex items-center w-full mt-0">

                        <div className="px-10 flex flex-col justify-center  items-start text-zinc-500 w-2/6">
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



                        <div className="flex  gap-4  grow items-start ">

                            <div className="group flex flex-col items-center p-2 cursor-pointer hover:scale-125 transition-transform select-none active:scale-75" onClick={handleCropClick} >
                                <span className="text-sm opacity-0 group-hover:opacity-100">Resize</span>
                                <IoMdResize size={25} />
                            </div>


                            <Link to="/">
                                <div className="group flex flex-col items-center p-2 cursor-pointer hover:scale-125 transition-transform select-none active:scale-75" >
                                    <span className="text-sm opacity-0 group-hover:opacity-100">Crop</span>
                                    <LuCrop size={25} />
                                </div>
                            </Link>
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
                            <div className="group flex flex-col items-center p-2 cursor-pointer hover:scale-125 transition-transform select-none active:scale-75" onClick={onDownloadCropClick}
                            >
                                <span className="text-sm opacity-0 group-hover:opacity-100">Save</span>
                                <FiSave size={25} />
                            </div>
                            <div className="group flex flex-col items-center p-2 cursor-pointer hover:scale-125 transition-transform select-none active:scale-75" onClick={handleDeleteClick}>
                                <span className="text-sm opacity-0 group-hover:opacity-100">Delete</span>
                                <MdDeleteForever size={25} />
                            </div>
                        </div>






                    </div>
                </div>
            </div>
        </div>
    );
};

export default Resizer;




