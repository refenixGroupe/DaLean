import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./components/ToastProvider";
import { KeyboardShortcutsProvider } from "./contexts/KeyboardShortcutsContext";
import Home from "./pages/mainPages/home";
import Upload from "./pages/mainPages/Upload";
import Preview from "./pages/mainPages/Preview";
import Clean from "./pages/DetailedPages/Clean";
import History from "./pages/DetailedPages/History";
import Settings from "./pages/mainPages/setting";
import Report from "./pages/DetailedPages/Report";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <KeyboardShortcutsProvider>
          <main className="App container mx-auto w-full min-h-screen relative">
            <Routes>
              <Route path="/DaLean" element={<Home />} />
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/preview" element={<Preview />} />
              <Route path="/clean" element={<Clean />} />
              <Route path="/report" element={<Report />} />
              <Route path="/history" element={<History />} />
              <Route path="/setting" element={<Settings />} />
            </Routes>
          </main>
        </KeyboardShortcutsProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}
