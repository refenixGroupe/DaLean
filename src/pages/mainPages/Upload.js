import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FileInfoCard from "../../components/FileInfoCard";
import { useTheme } from "../../contexts/ThemeContext";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Allowed file types
  const allowedTypes = [
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  const allowedExtensions = [".csv", ".xlsx", ".xls"];

  // Validate file type
  const validateFile = (file) => {
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();

    if (
      !allowedExtensions.includes(fileExtension) &&
      !allowedTypes.includes(file.type)
    ) {
      return false;
    }
    return true;
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    setError("");

    if (!validateFile(file)) {
      setError("Please select a valid CSV or XLSX file only.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle click on drop zone
  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  // Handle navigation to preview
  const handleNext = () => {
    if (selectedFile) {
      // You can pass file data through state or context
      navigate("/preview", { state: { file: selectedFile } });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Upload Your Data
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Upload your CSV or XLSX files to begin the data cleaning process
          </p>
        </div>

        {/* Upload Area */}
        <div className="w-full max-w-2xl">
          {/* Drag & Drop Zone */}
          <div
            className={`relative border-3 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
              isDragOver
                ? "border-blue-500 bg-blue-50"
                : selectedFile
                ? "border-green-500 bg-green-50"
                : error
                ? "border-red-500 bg-red-50"
                : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleDropZoneClick}
          >
            {/* Upload Icon */}
            <div className="mb-6">
              {selectedFile ? (
                <svg
                  className="w-16 h-16 mx-auto text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : error ? (
                <svg
                  className="w-16 h-16 mx-auto text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-16 h-16 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              )}
            </div>

            {/* Upload Text */}
            <div className="space-y-2">
              {selectedFile ? (
                <>
                  <p className="text-xl font-semibold text-green-700">
                    File Selected Successfully!
                  </p>
                  <p className="text-gray-600">
                    Click to select a different file
                  </p>
                </>
              ) : error ? (
                <>
                  <p className="text-xl font-semibold text-red-700">
                    Invalid File Type
                  </p>
                  <p className="text-red-600">{error}</p>
                </>
              ) : isDragOver ? (
                <p className="text-xl font-semibold text-blue-700">
                  Drop your file here
                </p>
              ) : (
                <>
                  <p className="text-xl font-semibold text-gray-700">
                    Drag & drop your file here
                  </p>
                  <p className="text-gray-500">or click to browse files</p>
                </>
              )}
            </div>

            {/* Supported file types */}
            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Supported formats: CSV, XLSX, XLS
              </p>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* File Info Card */}
          {selectedFile && (
            <div className="mt-8">
              <FileInfoCard file={selectedFile} />
            </div>
          )}

          {/* Next Button */}
          {selectedFile && (
            <div className="mt-8 text-center">
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Next: Preview Data
                <svg
                  className="w-5 h-5 ml-2 inline"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div className="flex flex-col items-center">
              <svg
                className="w-8 h-8 mb-2 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <p className="font-medium">Secure Upload</p>
              <p>Your data is processed securely</p>
            </div>
            <div className="flex flex-col items-center">
              <svg
                className="w-8 h-8 mb-2 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <p className="font-medium">Fast Processing</p>
              <p>Quick analysis and cleaning</p>
            </div>
            <div className="flex flex-col items-center">
              <svg
                className="w-8 h-8 mb-2 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="font-medium">Quality Results</p>
              <p>Professional data cleaning</p>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Upload;
