import React from "react";
import { CiCrop, CiUndo, CiRedo } from "react-icons/ci";
import { BiReset } from "react-icons/bi"; 
import { FaRegSave } from "react-icons/fa";

const ImageActions = ({ handleCrop, handleUndo, handleRedo, handleReset, handleSave, croppedImage }) => {
  return (
    <div className="flex justify-center gap-8 mt-4">
      <button
        className="flex flex-col items-center gap-1 px-3 py-1 text-gray-700 transition duration-200 group cursor-pointer"
        onClick={handleCrop}
      >
        <CiCrop className="text-2xl group-hover:text-gray-900 " />
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Crop</span>
      </button>
      <button
        className="flex flex-col items-center gap-1 px-3 py-1 text-gray-700 transition duration-200 group cursor-pointer"
        onClick={handleUndo}
      >
        <CiUndo className="text-2xl group-hover:text-gray-900 "  />
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Undo</span>
      </button>
      <button
        className="flex flex-col items-center gap-1 px-3 py-1 text-gray-700 transition duration-200 group cursor-pointer"
        onClick={handleRedo}
      >
        <CiRedo className="text-2xl group-hover:text-gray-900 " />
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Redo</span>
      </button>
      <button
       className="flex flex-col items-center gap-1 px-3 py-1 text-gray-700 transition duration-200 group cursor-pointer"
        onClick={handleReset}
      >
        <BiReset className="text-2xl group-hover:text-gray-900 " />
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Reset</span>
      </button>
      <button
  className="flex flex-col items-center gap-1 px-3 py-1 text-gray-700 transition duration-200 group cursor-pointer"
  onClick={handleSave}
  disabled={!croppedImage}
>
  <FaRegSave className="text-2xl group-hover:text-gray-900 " />
  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
    Save
  </span>
</button>

    </div>
  );
};

export default ImageActions;