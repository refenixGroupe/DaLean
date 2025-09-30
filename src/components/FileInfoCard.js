import React from "react";

const FileInfoCard = ({ file }) => {
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get file type display name
  const getFileType = (file) => {
    const extension = file.name.split(".").pop().toLowerCase();
    switch (extension) {
      case "csv":
        return "CSV File";
      case "xlsx":
        return "Excel Spreadsheet (XLSX)";
      case "xls":
        return "Excel Spreadsheet (XLS)";
      case "ods":
        return "OpenDocument Spreadsheet";
      case "sql":
        return "SQL Database File";
      case "db":
      case "sqlite":
      case "sqlite3":
        return "SQLite Database";
      case "tsv":
        return "Tab-Separated Values";
      case "txt":
      case "dat":
      case "tab":
        return "Text Data File";
      case "json":
      case "jsonl":
      case "ndjson":
        return "JSON Data File";
      case "xml":
        return "XML Data File";
      case "parquet":
        return "Parquet Big Data File";
      case "avro":
        return "Avro Data File";
      case "acord":
        return "ACORD Insurance Format";
      case "edi":
        return "EDI Transaction File";
      case "x12":
        return "X12 EDI Format";
      default:
        return "Data File";
    }
  };

  // Get file icon based on type
  const getFileIcon = (file) => {
    const extension = file.name.split(".").pop().toLowerCase();

    // CSV files - green
    if (extension === "csv" || extension === "tsv") {
      return (
        <svg
          className="w-8 h-8 text-green-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      );
    }
    // Excel files - blue
    else if (
      extension === "xlsx" ||
      extension === "xls" ||
      extension === "ods"
    ) {
      return (
        <svg
          className="w-8 h-8 text-blue-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      );
    }
    // SQL/Database files - purple
    else if (
      extension === "sql" ||
      extension === "db" ||
      extension === "sqlite" ||
      extension === "sqlite3"
    ) {
      return (
        <svg
          className="w-8 h-8 text-purple-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z" />
        </svg>
      );
    }
    // JSON files - orange
    else if (
      extension === "json" ||
      extension === "jsonl" ||
      extension === "ndjson"
    ) {
      return (
        <svg
          className="w-8 h-8 text-orange-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M5,3H7V5H5V10A2,2 0 0,1 3,8H1V6H3V3A2,2 0 0,1 5,1H7V3H5M19,3V1H21A2,2 0 0,1 23,3V6H21V8A2,2 0 0,1 19,10V5H17V3H19M5,21H7V23H5A2,2 0 0,1 3,21V18H1V16H3A2,2 0 0,1 5,18V21M19,21V18A2,2 0 0,1 21,16H23V18H21V21A2,2 0 0,1 19,23H17V21H19Z" />
        </svg>
      );
    }
    // XML files - red
    else if (extension === "xml") {
      return (
        <svg
          className="w-8 h-8 text-red-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      );
    }
    // Insurance/EDI files - indigo
    else if (
      extension === "acord" ||
      extension === "edi" ||
      extension === "x12"
    ) {
      return (
        <svg
          className="w-8 h-8 text-indigo-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M8,12V14H16V12H8M8,16V18H13V16H8Z" />
        </svg>
      );
    }
    // Big data files - teal
    else if (extension === "parquet" || extension === "avro") {
      return (
        <svg
          className="w-8 h-8 text-teal-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      );
    }
    // Text files - gray
    else if (
      extension === "txt" ||
      extension === "dat" ||
      extension === "tab"
    ) {
      return (
        <svg
          className="w-8 h-8 text-gray-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      );
    }

    // Default file icon
    return (
      <svg
        className="w-8 h-8 text-gray-600"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      </svg>
    );
  };

  if (!file) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center mb-4">
        <div className="mr-4">{getFileIcon(file)}</div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            File Information
          </h3>
          <p className="text-sm text-gray-500">Ready for processing</p>
        </div>
      </div>

      {/* File Details */}
      <div className="space-y-4">
        {/* Filename */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-600">Filename:</span>
          <span
            className="text-sm text-gray-800 font-mono bg-gray-50 px-2 py-1 rounded max-w-xs truncate"
            title={file.name}
          >
            {file.name}
          </span>
        </div>

        {/* File Size */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-600">File Size:</span>
          <span className="text-sm text-gray-800 font-semibold">
            {formatFileSize(file.size)}
          </span>
        </div>

        {/* File Type */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-600">File Type:</span>
          <span className="text-sm text-gray-800 font-semibold">
            {getFileType(file)}
          </span>
        </div>

        {/* Last Modified */}
        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-medium text-gray-600">
            Last Modified:
          </span>
          <span className="text-sm text-gray-800">
            {new Date(file.lastModified).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 flex items-center">
        <div className="flex items-center text-green-600">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium">
            File validated and ready for processing
          </span>
        </div>
      </div>
    </div>
  );
};

export default FileInfoCard;
