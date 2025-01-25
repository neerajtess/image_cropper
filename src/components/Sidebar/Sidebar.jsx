import React from "react";
import { SiConvertio } from "react-icons/si";
import { IoInvertModeOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { MdOutlineInvertColors } from "react-icons/md";
import { IoMdResize } from "react-icons/io";
import { LuCrop, LuMenu } from "react-icons/lu";
import { PiFlipHorizontalFill } from "react-icons/pi";
import { MdRotate90DegreesCw } from "react-icons/md";
import { Link } from "react-router-dom";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const menuItems = [
    { icon: <SiConvertio />, label: "Image Convert", link: "/" },
    { icon: <IoInvertModeOutline />, label: "Black/White", link: "/black-n-white" },
    { icon: <IoMdResize />, label: "Image Resize", link: "/resize" },
    { icon: <LuCrop />, label: "Image Crop", link: "/crop" },
    { icon: <PiFlipHorizontalFill />, label: "Image Flip", link: "/flip" },
    { icon: <MdRotate90DegreesCw />, label: "Image Rotate", link: "/rotate" },
    { icon: <MdOutlineInvertColors />, label: "Image Invert", link: "/invert" },
  ];

  return (
    <aside
  className={`bg-gray-800 px-4 py-2 text-white fixed top-10 left-0 h-screen transition-all duration-300 ${
    isCollapsed ? "w-16" : "w-48"
  } `} // Debugging border
>
      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-end my-2 p-1 mb-6 w-full hidden sm:block"
        aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <LuMenu size={20} /> : <RxCross2 size={20} />}
      </button>

      {/* Menu Items */}
      <nav>
        {menuItems.map((item, index) => (
          <Link to={item.link} key={index}>
            <div className="flex items-center text-sm hover:bg-zinc-100 hover:text-black rounded p-2 my-3 cursor-pointer">
              <span className="mr-3">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </div>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;