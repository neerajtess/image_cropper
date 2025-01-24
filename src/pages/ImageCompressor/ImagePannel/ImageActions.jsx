import React from "react";
import { CiCrop, CiUndo, CiRedo } from "react-icons/ci";
import { BiReset } from "react-icons/bi"; 
import { FaRegSave } from "react-icons/fa";

const ImageActions = ({ handleCrop, handleUndo, handleRedo, handleReset, handleSave, croppedImage }) => {
  return (
    <div className="flex justify-center gap-8 mt-4">
      <button
        className="flex  items-center gap-1 text-gray-700 hover:text-white bg-blue-100 hover:bg-blue-500 px-5 py-1 rounded-md border border-gray-300 shadow-sm transition-all duration-200 ease-in-out"
        onClick={handleCrop}
      >
        <CiCrop />
        <span>Crop</span>
      </button>
      <button
        className="flex items-center gap-1 text-gray-700 hover:text-white bg-blue-100 hover:bg-blue-500 px-5 py-1 rounded-md border border-gray-300 shadow-sm transition-all duration-200 ease-in-out"
        onClick={handleUndo}
      >
        <CiUndo />
        <span>Undo</span>
      </button>
      <button
        className="flex  items-center gap-1 text-gray-700 hover:text-white bg-blue-100 hover:bg-blue-500 px-5 py-1 rounded-md border border-gray-300 shadow-sm transition-all duration-200 ease-in-out"
        onClick={handleRedo}
      >
        <CiRedo />
        <span>Redo</span>
      </button>
      <button
        className="flex  items-center gap-1 text-gray-700 hover:text-white bg-blue-100 hover:bg-blue-500 px-5 py-1 rounded-md border border-gray-300 shadow-sm transition-all duration-200 ease-in-out"
        onClick={handleReset}
      >
        <BiReset />
        <span>Reset</span>
      </button>
      <button
        className="flex  items-center gap-1 text-gray-700 hover:text-white bg-blue-100 hover:bg-blue-500 px-5 py-1 rounded-md border border-gray-300 shadow-sm transition-all duration-200 ease-in-out"
        onClick={handleSave}
        disabled={!croppedImage}
      >
        <FaRegSave />
        <span>Save</span>
      </button>
    </div>
  );
};

export default ImageActions;