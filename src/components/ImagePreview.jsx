import { React, useState } from "react";

const ImagePreview = () => {



  const [image, setImage] = useState(null);
  const [imageProperties, setImageProperties] = useState({ width: 0, height: 0 });


  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          setImage(img.src);
          setImageProperties({
            width: img.width,
            height: img.height,
          });
        };
      };
      reader.readAsDataURL(file);
    }
  };




  return (
    <div className="flex-1">
      <div className="border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center bg-gray-50">
        <button className="bg-blue-500 text-white px-6 py-2 rounded ">
          Upload Image
          <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
        </button>

      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-8 mt-4 ">
        <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-500">
          <span>Crop</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-500">
          <span>Undo</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-500">
          <span>Redo</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-500">
          <span>Reset</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-500">
          <span>Save</span>
        </button>
      </div>
    </div>
  );
};

export default ImagePreview;