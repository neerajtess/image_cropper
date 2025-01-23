import React from "react";

const ControlsPanel = ({ imageInfo }) => {
  return (
      <> <div className="w-full md:w-72 bg-white rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-semibold mb-6">Resizing Options</h2>
  
      {/* Width/Height Controls */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-gray-600 mb-1">Width:</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Height:</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
  
      {/* Crop Options */}
      <div className="mb-7">
        <label className="block text-gray-600 mb-1">Crop Option:</label>
        <select className="w-full p-2 border rounded">
          <option>5:4</option>
        </select>
      </div>
  
      {/* Position Controls */}
      <div className="mb-5">
        <h3 className="font-semibold mb13">Crop Position</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-600 mb-1">Position (Y)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Position (X)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>
  
      {/* Image Info */}
      <div className="bg-gray-50 p-1 rounded">
        <div className="text-sm">Current: </div>
        <div className="text-sm">Original: </div>
      </div>
    </div></>
  );
};

export default ControlsPanel;