import React from "react";

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-2 px-4 md:px-12 lg:px-48 flex justify-between items-center fixed top-0 left-0 w-full z-50 shadow-lg">
      <div className="text-xl font-bold">JPEG Compressor.com</div>
      <nav className="space-x-6">
        <button className="hover:text-blue-200 transition-colors duration-200">Image Converter</button>
        <button className="hover:text-blue-200 transition-colors duration-200">Home</button>
      </nav>
    </header>
  );
};

export default Header;