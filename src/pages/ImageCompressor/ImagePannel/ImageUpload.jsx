import React from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ImageUpload = ({ image, handleImageUpload, crop, setCrop, onCropComplete, imgRef }) => {
  // console.log(image)
  console.log(crop)
  // console.log(setCrop)
  // console.log(onCropComplete)
  // console.log(imgRef)
  return (


    <>
      <h1 className=" w-[1100px] h-[500px] flex justify-center rounded-lg items-center border-4 border-dashed border-gray-400  ">
      {image ? 
      
        <ReactCrop className="object-contain" style={{
          height: "100%", // Take full height of the container
           maxHeight: "100%",
           width:"100%",
           
        }}>
      {/* <div className="h-full w-full"> */}
      <img src={image} style={{
           height: "100%", // Take full height of the container
           maxHeight: "100%",
           width:"100%",
           objectFit:"contain"
         }} />
        {/* </div> */}
          </ReactCrop>
        
        
         : <button className="bg-blue-500 text-white px-6 py-2 rounded relative">
       Upload Image
         <input
           type="file"
           accept="image/*"
           onChange={handleImageUpload}
           className="absolute inset-0 opacity-0 cursor-pointer"
         />
       </button> }
       </h1>


      </>

























  //   <div className="border-2 border-dashed border-gray-300 rounded-lg w-[500px] h-[500px] flex items-center justify-center bg-gray-50 overflow-hidden">
  //   {image ? (
  //     <ReactCrop
  //       src={image}
  //       crop={crop}
  //       onChange={(newCrop) => setCrop(newCrop)}
  //       onComplete={onCropComplete}
  //       style={{
  //         width: "100%", // Take full width of the container
  //         height: "100%", // Take full height of the container
  //         display: "flex",
  //         alignItems: "center",
  //         justifyContent: "center",
  //       }}
  //     >
  //       <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
  //         <img
  //           ref={imgRef}
  //           src={image}
  //           alt="Preview"
  //           style={{
  //             maxWidth: "100%", // Ensure image does not exceed container width
  //             maxHeight: "100%", // Ensure image does not exceed container height
  //             width: "auto", // Allow image to scale naturally
  //             height: "auto", // Allow image to scale naturally
  //             objectFit: "contain", // Maintain aspect ratio
  //           }}
  //         />
  //       </div>
  //     </ReactCrop>
  //   ) : (
  //     <button className="bg-blue-500 text-white px-6 py-2 rounded relative">
  //       Upload Image
  //       <input
  //         type="file"
  //         accept="image/*"
  //         onChange={handleImageUpload}
  //         className="absolute inset-0 opacity-0 cursor-pointer"
  //       />
  //     </button>
  //   )}
  // </div>
  );
};

export default ImageUpload;