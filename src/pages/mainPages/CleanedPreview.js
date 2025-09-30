import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import DataQualityDashboard from "../../components/DataQualityDashboard";

const CleanedPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get the cleaned data from the previous page
  const cleanedData = useMemo(
    () => location.state?.cleanedData || [],
    [location.state?.cleanedData]
  );
  const originalData = useMemo(
    () => location.state?.originalData || [],
    [location.state?.originalData]
  );
  const fileName = location.state?.fileName || "cleaned_data";

  // State for export options
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!cleanedData || cleanedData.length === 0) {
      return { rows: 0, columns: 0 };
    }

    const rows = cleanedData.length;
    const columns = Object.keys(cleanedData[0] || {}).length;

    return { rows, columns };
  }, [cleanedData]);

  // Handle navigation back to cleaning page
  const handleBackToCleaning = () => {
    navigate("/clean", {
      state: {
        parsedData: cleanedData,
        fileName: fileName,
      },
    });
  };

  // Handle export to CSV
  const exportToCSV = () => {
    if (!cleanedData || cleanedData.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = Object.keys(cleanedData[0]);
    const csvContent = [
      headers.join(","),
      ...cleanedData.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma or quote
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName.replace(/\.[^/.]+$/, "")}_cleaned.csv`;
    link.click();
  };

  // Handle export to Excel
  const exportToExcel = () => {
    if (!cleanedData || cleanedData.length === 0) {
      alert("No data to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(cleanedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cleaned Data");

    // Auto-adjust column widths
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    const colWidths = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxWidth = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell && cell.v) {
          const cellText = cell.v.toString();
          maxWidth = Math.max(maxWidth, cellText.length);
        }
      }
      colWidths.push({ width: Math.min(maxWidth + 2, 50) });
    }
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(
      workbook,
      `${fileName.replace(/\.[^/.]+$/, "")}_cleaned.xlsx`
    );
  };

  // Handle export based on selected format
  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (exportFormat === "csv") {
        exportToCSV();
      } else if (exportFormat === "excel") {
        exportToExcel();
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Train Model navigation
  const handleTrainModel = () => {
    navigate("/train", {
      state: {
        cleanedData: cleanedData,
        fileName: fileName,
      },
    });
  };

  // If no data, redirect back to upload
  useEffect(() => {
    if (!cleanedData || cleanedData.length === 0) {
      navigate("/upload");
    }
  }, [cleanedData, navigate]);

  if (!cleanedData || cleanedData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            No Data Available
          </h2>
          <p className="text-gray-600 mb-6">
            Please upload and clean your data first.
          </p>
          <button
            onClick={() => navigate("/upload")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Upload
          </button>
        </div>
      </div>
    );
  }

  // Get the headers for the table
  const headers = Object.keys(cleanedData[0] || {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Cleaned Data Preview
              </h1>
              <p className="text-gray-600 mt-1">
                Review your cleaned dataset and export options
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleBackToCleaning}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Back to Cleaning</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Section */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Dataset Summary
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {summary.rows.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">Rows</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {summary.columns}
                </div>
                <div className="text-sm text-gray-600 mt-1">Columns</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {fileName}
                </div>
                <div className="text-sm text-gray-600 mt-1">Source File</div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Quality Assessment */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Data Quality Analysis
            </h2>
          </div>
          <div className="px-6 py-4">
            <DataQualityDashboard
              data={originalData.length > 0 ? originalData : cleanedData}
              cleanedData={originalData.length > 0 ? cleanedData : null}
              title={
                originalData.length > 0
                  ? "Data Quality: Before vs After Cleaning"
                  : "Data Quality Assessment"
              }
            />
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Export Options
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Format:
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isExporting}
                >
                  <option value="csv">CSV (.csv)</option>
                  <option value="excel">Excel (.xlsx)</option>
                </select>
              </div>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
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
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>Download {exportFormat.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Cleaned Dataset
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {Math.min(100, cleanedData.length)} of{" "}
              {cleanedData.length.toLocaleString()} rows
            </p>
          </div>
          <div className="overflow-x-auto">
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                      >
                        <div className="truncate" title={header}>
                          {header}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cleanedData.slice(0, 100).map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {headers.map((header, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200 last:border-r-0"
                        >
                          <div
                            className="max-w-xs truncate"
                            title={String(row[header] || "")}
                          >
                            {String(row[header] || "")}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {cleanedData.length > 100 && (
            <div className="px-6 py-3 bg-gray-50 border-t text-center">
              <p className="text-sm text-gray-600">
                Showing first 100 rows. Download the file to see all{" "}
                {cleanedData.length.toLocaleString()} rows.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Next Steps</h2>
          </div>
          <div className="px-6 py-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleTrainModel}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <span>Train Model</span>
              </button>
              <button
                onClick={handleBackToCleaning}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span>Edit Data</span>
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Ready to train a model with your cleaned data, or go back to make
              additional edits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanedPreview;
