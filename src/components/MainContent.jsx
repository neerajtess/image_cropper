import React from "react";
import ControlsPanel from "./ControlsPanel";
import ImagePreview from "./ImagePreview";

const MainContent = ({ imageInfo }) => {
  return (
    <main className="flex-1 ml-0  transition-all duration-300 p-4 md:p-0">
      {/* Advertisement */}
      <div className="w-full h-24 bg-red-200 mb-2 flex items-center justify-center">
        Advertisement
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <ControlsPanel imageInfo={imageInfo} />
        <ImagePreview />
      </div>
    </main>
  );
};

export default MainContent;