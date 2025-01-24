import { useState } from "react";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Ads from "./components/Ads/Ads";
import ImageCompressor from "./pages/ImageCompressor/ImageCompressor";
import BlackNwhite from "./pages/BlackNwhite/BlackNwhite";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-zinc-100">
        {/* Header */}
        <Header />

        <div className="flex pt-12">
          {/* Sidebar */}
          <Sidebar
            isOpen={isOpen}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          {/* Main Content */}
          <main
            className={`flex-1 ml-0 ${
              isOpen ? (isCollapsed ? "ml-16" : "ml-52") : "ml-0"
            } transition-all duration-300 p-4 md:p-2`}
          >
            <Routes>
              {/* Route for ImageCompressor */}
              <Route path="/" element={<ImageCompressor />} />

              {/* Route for BlackNwhite */}
              <Route path="/black-n-white" element={<BlackNwhite />} />
            </Routes>

            {/* Advertisement */}
            <Ads />
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
