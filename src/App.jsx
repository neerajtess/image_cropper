import { useState } from "react";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Ads from "./components/Ads/Ads";
import ImageCropper from "./pages/ImageCompressor/ImageCropper";
import Resizer from "./pages/imageReszer/Resizer"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Crop } from "lucide-react";
import Cropper from "react-easy-crop";

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false); // Only keep isCollapsed state

  return (
    <Router>
      <div className="min-h-screen bg-zinc-100">
        {/* Header */}
        <Header />

        <div className="flex pt-12">
          {/* Sidebar */}
          <Sidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />

          {/* Main Content */}
          <main
            className={`flex-1 ml-0   ${
              isCollapsed ? "ml-16" : "ml-48" // Adjust margin based on isCollapsed
            } transition-all duration-300 h-screen `}
          >
            <Routes>
              {/* Route for ImageCompressor */}
              <Route path="/" element={<ImageCropper />} />


              <Route path="/image-resizer" element={<Resizer />} />

              {/* Route for BlackNwhite */}
              {/* <Route path="/croper" element={<Cropper />} /> */}
            </Routes>

            {/* Advertisement */}
            {/* <Ads /> */}
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;