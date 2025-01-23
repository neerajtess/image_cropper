import React, { useState } from "react";
import { SiConvertio } from "react-icons/si";
import { IoInvertModeOutline } from "react-icons/io5";
import { MdOutlineInvertColors } from "react-icons/md";
import { IoMdResize } from "react-icons/io";
import { LuCrop } from "react-icons/lu";
import { PiFlipHorizontalFill } from "react-icons/pi";
import { MdRotate90DegreesCw } from "react-icons/md";
import Header from "./Header";
import Ads from "./Ads";
import ImagePreview from "./ImagePreview";
import ControlsPanel from "./ControlsPanel";
import Sidebar from "./Sidebar";
import ImagePannel from "./ImagePannel";

const ImageCompressor = () => {
  const [isOpen, setIsOpen] = useState(true); 
  const [isCollapsed, setIsCollapsed] = useState(false); 

  const menuItems = [
    { icon: <SiConvertio />, label: "Image Convert" },
    { icon: <IoInvertModeOutline />, label: "Black/White" },
    { icon: <IoMdResize />, label: "Image Resize" },
    { icon: <LuCrop />, label: "Image Crop" },
    { icon: <PiFlipHorizontalFill />, label: "Image Flip" },
    { icon: <MdRotate90DegreesCw />, label: "Image Rotate" },
    { icon: <MdOutlineInvertColors />, label: "Image Invert" },
  ];

  const imageInfo = {
    current: "1450 x 584, 104.04 KB, JPG",
    original: "1450 x 584, 104.04 KB, JPG",
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Header */}
      <Header />

      <div className="flex pt-12">
        {/* Sidebar */}
        <Sidebar isOpen={isOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        {/* Main Content */}
        <main className={`flex-1 ml-0 ${isOpen ? (isCollapsed ? 'ml-16' : 'ml-52') : 'ml-0'} transition-all duration-300 p-4 md:p-2`}>
          {/* Advertisement */}
         

          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Panel - Controls */}
           
          <ImagePannel></ImagePannel>
            {/* Right Panel - Image Preview */}
           
          </div>

          <Ads />
        </main>
      </div>
    </div>
  );
};

export default ImageCompressor;
