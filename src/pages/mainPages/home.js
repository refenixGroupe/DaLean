import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

const Home = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleUploadClick = () => navigate("/upload");
  const handleHistoryClick = () => navigate("/history");
  const handleSettingsClick = () => navigate("/setting");

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-blue-50 to-indigo-100"
      }`}
    >
      {/* Hero Section */}
      <div className="w-full py-12 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-28 h-28 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl">
          <svg
            className="w-14 h-14 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h1
          className={`text-5xl font-extrabold mb-4 tracking-tight ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          DaLean
        </h1>
        <p
          className={`text-xl max-w-2xl mx-auto mb-6 leading-relaxed ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Transform your messy data into clean, reliable datasets ready for
          analysis
        </p>

        {/* Keyboard Shortcuts Showcase */}
        <div
          className={`mt-12 max-w-6xl mx-auto p-8 rounded-2xl border-2 border-dashed ${
            theme === "dark"
              ? "border-gray-600 bg-gray-800/50"
              : "border-blue-200 bg-blue-50/50"
          }`}
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg
                className={`w-8 h-8 ${
                  theme === "dark" ? "text-yellow-400" : "text-yellow-500"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h3
                className={`text-3xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                ⚡ Blazing Fast & Keyboard Friendly
              </h3>
            </div>
            <p
              className={`text-lg mb-2 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              This is for all the keyboard shortcut addicts:
            </p>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Power through your data cleaning workflow with lightning-fast
              keyboard navigation
            </p>
          </div>

          {/* Complete Shortcuts Guide */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Global Navigation & Search */}
            <div
              className={`p-6 rounded-xl ${
                theme === "dark" ? "bg-gray-700/50" : "bg-white/70"
              } border ${
                theme === "dark" ? "border-gray-600" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h4
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  🚀 Global Navigation & Search
                </h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2">
                  <span
                    className={`font-medium ${
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Search and jump to a collection
                  </span>
                  <div className="flex gap-1">
                    <kbd
                      className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                        theme === "dark"
                          ? "bg-gray-600 text-gray-100 border border-gray-500 shadow-md"
                          : "bg-gray-100 text-gray-800 border border-gray-300 shadow-md"
                      }`}
                    >
                      Cmd
                    </kbd>
                    <span
                      className={`${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      +
                    </span>
                    <kbd
                      className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                        theme === "dark"
                          ? "bg-gray-600 text-gray-100 border border-gray-500 shadow-md"
                          : "bg-gray-100 text-gray-800 border border-gray-300 shadow-md"
                      }`}
                    >
                      K
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span
                    className={`${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Press 'N' to create a new collection
                  </span>
                  <kbd
                    className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                      theme === "dark"
                        ? "bg-gray-600 text-gray-100 border border-gray-500 shadow-md"
                        : "bg-gray-100 text-gray-800 border border-gray-300 shadow-md"
                    }`}
                  >
                    N
                  </kbd>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span
                    className={`${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    In a collection, press 'C' to create a new item
                  </span>
                  <kbd
                    className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                      theme === "dark"
                        ? "bg-gray-600 text-gray-100 border border-gray-500 shadow-md"
                        : "bg-gray-100 text-gray-800 border border-gray-300 shadow-md"
                    }`}
                  >
                    C
                  </kbd>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span
                    className={`${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    In a collection, press 'P' to create a new property
                  </span>
                  <kbd
                    className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                      theme === "dark"
                        ? "bg-gray-600 text-gray-100 border border-gray-500 shadow-md"
                        : "bg-gray-100 text-gray-800 border border-gray-300 shadow-md"
                    }`}
                  >
                    P
                  </kbd>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span
                    className={`${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    On a cell, press 'Space' to open the item detail
                  </span>
                  <kbd
                    className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                      theme === "dark"
                        ? "bg-gray-600 text-gray-100 border border-gray-500 shadow-md"
                        : "bg-gray-100 text-gray-800 border border-gray-300 shadow-md"
                    }`}
                  >
                    Space
                  </kbd>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span
                    className={`${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    On an open drawer or modal, press escape to close it
                  </span>
                  <kbd
                    className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                      theme === "dark"
                        ? "bg-gray-600 text-gray-100 border border-gray-500 shadow-md"
                        : "bg-gray-100 text-gray-800 border border-gray-300 shadow-md"
                    }`}
                  >
                    Escape
                  </kbd>
                </div>
              </div>
            </div>

            {/* Data Table Manipulation */}
            <div
              className={`p-6 rounded-xl ${
                theme === "dark" ? "bg-gray-700/50" : "bg-white/70"
              } border ${
                theme === "dark" ? "border-gray-600" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z"
                  />
                </svg>
                <h4
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  📊 Data Table Manipulation
                </h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2">
                  <span
                    className={`font-medium ${
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Select multiple items
                  </span>
                  <div className="flex gap-1">
                    <kbd
                      className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                        theme === "dark"
                          ? "bg-gray-600 text-gray-100 border border-gray-500 shadow-md"
                          : "bg-gray-100 text-gray-800 border border-gray-300 shadow-md"
                      }`}
                    >
                      Shift
                    </kbd>
                    <span
                      className={`${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      +
                    </span>
                    <kbd
                      className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                        theme === "dark"
                          ? "bg-gray-600 text-gray-100 border border-gray-500 shadow-md"
                          : "bg-gray-100 text-gray-800 border border-gray-300 shadow-md"
                      }`}
                    >
                      ↓/↑
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span
                    className={`${
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    To move to end of table
                  </span>
                  <div className="flex gap-1">
                    <kbd
                      className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                        theme === "dark"
                          ? "bg-gray-600 text-gray-100 border border-gray-500 shadow-md"
                          : "bg-gray-100 text-gray-800 border border-gray-300 shadow-md"
                      }`}
                    >
                      Ctrl/Cmd
                    </kbd>
                    <span
                      className={`${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      +
                    </span>
                    <kbd
                      className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                        theme === "dark"
                          ? "bg-gray-600 text-gray-100 border border-gray-500 shadow-md"
                          : "bg-gray-100 text-gray-800 border border-gray-300 shadow-md"
                      }`}
                    >
                      ↓/↑/→/←
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Pro Tips */}
              <div
                className={`mt-6 p-4 rounded-lg ${
                  theme === "dark"
                    ? "bg-blue-900/30 border border-blue-700"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span
                    className={`text-sm font-semibold ${
                      theme === "dark" ? "text-blue-300" : "text-blue-700"
                    }`}
                  >
                    💡 Pro Tips
                  </span>
                </div>
                <ul
                  className={`text-xs space-y-1 ${
                    theme === "dark" ? "text-blue-200" : "text-blue-600"
                  }`}
                >
                  <li>• Shortcuts work globally - no need to click first</li>
                  <li>
                    • Try pressing{" "}
                    <kbd className="px-1 py-0.5 bg-blue-200 text-blue-800 rounded text-xs">
                      N
                    </kbd>{" "}
                    right now to test!
                  </li>
                  <li>• All shortcuts show visual feedback when used</li>
                  <li>• Customize or disable shortcuts in Settings</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => {
                // Simulate pressing N key
                const event = new KeyboardEvent("keydown", { key: "n" });
                document.dispatchEvent(event);
              }}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                theme === "dark"
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-lg"
              }`}
            >
              <kbd className="px-2 py-1 bg-green-700 text-green-100 rounded text-xs">
                N
              </kbd>
              Try it now - Create New Collection
            </button>

            <button
              onClick={handleSettingsClick}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700 text-white border border-blue-500"
                  : "bg-blue-600 hover:bg-blue-700 text-white border border-blue-500"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Customize All Shortcuts in Settings
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="w-full max-w-5xl mx-auto mt-8">
        <h2
          className={`text-2xl font-bold text-center mb-8 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Upload Data Card */}
          <div
            className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
            onClick={handleUploadClick}
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v16h16V4H4zm4 4h8v8H8V8z"
                  />
                </svg>
              </div>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}
              >
                Upload Data
              </h3>
              <p
                className={`text-sm leading-relaxed ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Upload your dataset and let our AI-powered tools clean and
                optimize your data automatically
              </p>
            </div>
          </div>
          {/* View History Card */}
          <div
            className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
            onClick={handleHistoryClick}
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}
              >
                View History
              </h3>
              <p
                className={`text-sm leading-relaxed ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Review your data processing history and track improvements made
                to your datasets
              </p>
            </div>
          </div>
          {/* Settings Card */}
          <div
            className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
            onClick={handleSettingsClick}
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6l4 2"
                  />
                </svg>
              </div>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}
              >
                Settings
              </h3>
              <p
                className={`text-sm leading-relaxed ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Customize your experience and configure data processing
                preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-20 text-center">
        <div className="flex flex-wrap justify-center gap-8 text-base text-gray-500">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Data Validation
          </div>
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Outlier Detection
          </div>
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Multiple Export Formats
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
