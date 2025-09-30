import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { DataGrid } from "react-data-grid";
import _ from "lodash";
import * as XLSX from "xlsx";
import { DataQualityScorer } from "../../utils/DataQualityScorer";
import "react-data-grid/lib/styles.css";

const Clean = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Get data from previous page
  const {
    file,
    data: initialData,
    columns: initialColumns,
  } = location.state || {};

  const [data, setData] = useState(initialData || []);
  const [columns] = useState(initialColumns || []);
  const [cleanedData, setCleanedData] = useState(null);
  const [statistics, setStatistics] = useState({});
  // Removed unused cleaningSummary state
  const [selectedOperations, setSelectedOperations] = useState({
    removeMissingValues: true,
    removeDuplicates: true,
    textStandardization: true,
    fixTypos: true,
    formatPhoneNumbers: true,
    standardizeDates: true,
    handleOutliers: false,
  });
  const [outlierThreshold, setOutlierThreshold] = useState(99);
  const [showCleaned, setShowCleaned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const goToHome = () => {
    navigate("/");
  };

  const goToPreviousStep = () => {
    navigate("/upload");
  };

  const goToCleaningPerformance = () => {
    navigate("/data-quality-demo");
  };

  // Initialize DataQualityScorer
  const dataQualityScorer = useMemo(() => new DataQualityScorer(), []);

  // Convert data to proper format for DataQualityScorer
  const convertToObjectFormat = (arrayData, columnNames) => {
    return arrayData.map((row) => {
      const obj = {};
      columnNames.forEach((colName, index) => {
        obj[colName || `Column_${index + 1}`] = row[index];
      });
      return obj;
    });
  };

  // Convert object format back to array format
  const convertToArrayFormat = (objectData, columnNames) => {
    return objectData.map((obj) => {
      return columnNames.map((colName) => obj[colName] || "");
    });
  };

  // Calculate comprehensive statistics
  const calculateStatistics = React.useCallback(() => {
    if (data.length > 0 && columns.length > 0) {
      try {
        const objectData = convertToObjectFormat(data, columns);
        const qualityScore = dataQualityScorer.assessDataQuality(objectData);

        const stats = {
          totalRows: data.length,
          totalColumns: columns.length,
          qualityScore: qualityScore?.overallScore || 0,
          missingValuesByColumn: {},
          duplicateRows: 0,
          typoCount: 0,
          formatIssues: 0,
          outlierCount: 0,
        };

        // Calculate missing values per column
        columns.forEach((column, colIndex) => {
          const missingCount = data.filter(
            (row) =>
              row[colIndex] === null ||
              row[colIndex] === undefined ||
              row[colIndex] === "" ||
              String(row[colIndex]).trim() === ""
          ).length;
          stats.missingValuesByColumn[column || `Column ${colIndex + 1}`] =
            missingCount;
        });

        // Calculate duplicate rows
        const uniqueRows = _.uniqBy(data, (row) => JSON.stringify(row));
        stats.duplicateRows = data.length - uniqueRows.length;

        // Estimate other issues
        stats.typoCount = Math.floor(data.length * 0.05); // Rough estimate
        stats.formatIssues = Math.floor(data.length * 0.08);

        // Find numeric columns for outlier detection
        const numericColumns = columns.filter((col, index) => {
          const sample = data.slice(0, 10).map((row) => row[index]);
          return sample.some((val) => !isNaN(parseFloat(val)) && isFinite(val));
        });

        if (numericColumns.length > 0) {
          const numericColIndex = columns.indexOf(numericColumns[0]);
          const numericValues = data
            .map((row) => parseFloat(row[numericColIndex]))
            .filter((val) => !isNaN(val));

          if (numericValues.length > 0) {
            const sorted = numericValues.sort((a, b) => a - b);
            const percentileIndex = Math.floor(
              (outlierThreshold / 100) * sorted.length
            );
            const threshold = sorted[percentileIndex];
            stats.outlierCount = numericValues.filter(
              (val) => val > threshold
            ).length;
          }
        }

        setStatistics(stats);
      } catch (error) {
        console.error("Error calculating statistics:", error);
        setStatistics({
          totalRows: data.length,
          totalColumns: columns.length,
          qualityScore: 0,
          missingValuesByColumn: {},
          duplicateRows: 0,
          typoCount: 0,
          formatIssues: 0,
          outlierCount: 0,
        });
      }
    }
  }, [data, columns, dataQualityScorer, outlierThreshold]);

  useEffect(() => {
    calculateStatistics();
  }, [calculateStatistics]);

  // Helper function to save to processing history
  const saveToHistory = (processingData) => {
    try {
      const existingHistory = JSON.parse(
        localStorage.getItem("dalean_processing_history") || "[]"
      );
      const newHistoryEntry = {
        id: Date.now(),
        filename: processingData.filename,
        originalSize: processingData.originalSize,
        cleanedSize: processingData.cleanedSize,
        rowsProcessed: processingData.rowsProcessed,
        duplicatesRemoved: processingData.duplicatesRemoved || 0,
        missingValuesHandled: processingData.missingValuesHandled || 0,
        status: processingData.status,
        timestamp: new Date(),
        processingTime: processingData.processingTime,
        qualityScore: processingData.qualityScore,
        operations: processingData.operations,
        exportFormat: processingData.exportFormat || "CSV",
        error: processingData.error,
      };

      existingHistory.unshift(newHistoryEntry); // Add to beginning
      localStorage.setItem(
        "dalean_processing_history",
        JSON.stringify(existingHistory)
      );
    } catch (error) {
      console.error("Error saving to history:", error);
    }
  };

  // Handle comprehensive cleaning
  const performComprehensiveCleaning = async () => {
    setIsProcessing(true);
    const startTime = Date.now();

    try {
      const objectData = convertToObjectFormat(data, columns);

      // Perform comprehensive cleaning
      const cleaningResult =
        await dataQualityScorer.performComprehensiveCleaning(objectData, {
          removeMissingValues: selectedOperations.removeMissingValues,
          removeDuplicates: selectedOperations.removeDuplicates,
          textStandardization: selectedOperations.textStandardization,
          fixTypos: selectedOperations.fixTypos,
          formatPhoneNumbers: selectedOperations.formatPhoneNumbers,
          standardizeDates: selectedOperations.standardizeDates,
          handleOutliers: selectedOperations.handleOutliers,
          outlierThreshold: outlierThreshold,
        });

      const cleanedArrayData = convertToArrayFormat(
        cleaningResult.cleanedData,
        columns
      );

      // Calculate processing metrics
      const endTime = Date.now();
      const processingTimeMs = endTime - startTime;
      const processingTimeFormatted =
        processingTimeMs < 60000
          ? `${Math.round(processingTimeMs / 1000)}s`
          : `${Math.round(processingTimeMs / 60000)}m ${Math.round(
              (processingTimeMs % 60000) / 1000
            )}s`;

      // Get file size estimates
      const originalSize = file?.size
        ? (file.size / (1024 * 1024)).toFixed(1) + " MB"
        : `${(JSON.stringify(data).length / (1024 * 1024)).toFixed(1)} MB`;

      const cleanedSize = `${(
        JSON.stringify(cleanedArrayData).length /
        (1024 * 1024)
      ).toFixed(1)} MB`;

      // Get selected operations as array
      const appliedOperations = Object.entries(selectedOperations)
        .filter(([key, value]) => value)
        .map(([key]) => {
          const operationNames = {
            removeMissingValues: "Remove missing values",
            removeDuplicates: "Remove duplicates",
            textStandardization: "Text standardization",
            fixTypos: "Fix typos",
            formatPhoneNumbers: "Format phone numbers",
            standardizeDates: "Standardize dates",
            handleOutliers: "Handle outliers",
          };
          return operationNames[key] || key;
        });

      // Calculate quality score (basic implementation)
      const qualityScore =
        cleaningResult.summary?.overallScore ||
        Math.max(
          0,
          Math.min(
            100,
            85 +
              (cleaningResult.summary?.duplicatesRemoved ? 5 : 0) +
              (cleaningResult.summary?.missingValuesHandled ? 5 : 0) +
              appliedOperations.length * 1
          )
        );

      // Save to processing history
      saveToHistory({
        filename: file?.name || "Unknown File",
        originalSize: originalSize,
        cleanedSize: cleanedSize,
        rowsProcessed: data.length,
        duplicatesRemoved: cleaningResult.summary?.duplicatesRemoved || 0,
        missingValuesHandled: cleaningResult.summary?.missingValuesHandled || 0,
        status: "completed",
        processingTime: processingTimeFormatted,
        qualityScore: Math.round(qualityScore),
        operations: appliedOperations,
        exportFormat: "CSV",
      });

      // Save cleaned data to sessionStorage for report fallback
      window.sessionStorage.setItem(
        "reportState",
        JSON.stringify({
          file,
          data: cleanedArrayData,
          columns,
          cleaningSummary: cleaningResult.summary,
        })
      );

      // Navigate to Report page with cleaned data and summary
      navigate("/report", {
        state: {
          file,
          data: cleanedArrayData,
          columns,
          cleaningSummary: cleaningResult.summary,
        },
      });
    } catch (error) {
      // Save failed processing to history
      const endTime = Date.now();
      const processingTimeMs = endTime - startTime;
      const processingTimeFormatted = `Failed after ${Math.round(
        processingTimeMs / 1000
      )}s`;

      saveToHistory({
        filename: file?.name || "Unknown File",
        originalSize: file?.size
          ? (file.size / (1024 * 1024)).toFixed(1) + " MB"
          : "Unknown",
        cleanedSize: null,
        rowsProcessed: data.length,
        duplicatesRemoved: null,
        missingValuesHandled: null,
        status: "failed",
        processingTime: processingTimeFormatted,
        qualityScore: null,
        operations: ["Processing failed"],
        exportFormat: "CSV",
        error: error.message || "Unknown error occurred",
      });
      console.error("Error during cleaning:", error);
      alert("An error occurred during data cleaning. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOperationChange = (operation, checked) => {
    setSelectedOperations((prev) => ({
      ...prev,
      [operation]: checked,
    }));
  };

  // Enhanced Export functionality with multiple formats
  const exportData = (format) => {
    const dataToExport = showCleaned ? cleanedData : data;
    const filename = `${file?.name?.split(".")[0] || "data"}_cleaned`;

    switch (format) {
      case "csv":
        exportToCSV(dataToExport, filename);
        break;
      case "excel":
        exportToExcel(dataToExport, filename);
        break;
      case "json":
        exportToJSON(dataToExport, filename);
        break;
      case "sql":
        exportToSQL(dataToExport, filename);
        break;
      case "xml":
        exportToXML(dataToExport, filename);
        break;
      case "tsv":
        exportToTSV(dataToExport, filename);
        break;
      default:
        exportToCSV(dataToExport, filename);
    }
    setShowExportModal(false);
  };

  const exportToCSV = (dataToExport, filename) => {
    const csvContent = [
      columns.join(","),
      ...dataToExport.map((row) =>
        row
          .map((cell) => {
            const value = cell || "";
            return typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = (dataToExport, filename) => {
    const objectData = convertToObjectFormat(dataToExport, columns);
    const worksheet = XLSX.utils.json_to_sheet(objectData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportToJSON = (dataToExport, filename) => {
    const jsonData = convertToObjectFormat(dataToExport, columns);
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToSQL = (dataToExport, filename, tableName = "cleaned_data") => {
    const objectData = convertToObjectFormat(dataToExport, columns);
    const headers = Object.keys(objectData[0] || {});

    const createTable = `CREATE TABLE ${tableName} (\n${headers
      .map(
        (header) => `  ${header.replace(/[^a-zA-Z0-9_]/g, "_")} VARCHAR(255)`
      )
      .join(",\n")}\n);\n\n`;

    const insertStatements = objectData
      .map((row) => {
        const values = headers
          .map((header) => {
            const value = row[header];
            return value === null || value === undefined
              ? "NULL"
              : `'${String(value).replace(/'/g, "''")}'`;
          })
          .join(", ");
        return `INSERT INTO ${tableName} (${headers
          .map((h) => h.replace(/[^a-zA-Z0-9_]/g, "_"))
          .join(", ")}) VALUES (${values});`;
      })
      .join("\n");

    const sqlContent = createTable + insertStatements;
    const blob = new Blob([sqlContent], { type: "text/sql" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.sql`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToXML = (dataToExport, filename) => {
    const objectData = convertToObjectFormat(dataToExport, columns);
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<data>\n${objectData
      .map((row) => {
        const rowXml = Object.entries(row)
          .map(
            ([key, value]) =>
              `    <${key.replace(/[^a-zA-Z0-9_]/g, "_")}>${(value || "")
                .toString()
                .replace(/[<>&]/g, (match) => {
                  switch (match) {
                    case "<":
                      return "&lt;";
                    case ">":
                      return "&gt;";
                    case "&":
                      return "&amp;";
                    default:
                      return match;
                  }
                })}</${key.replace(/[^a-zA-Z0-9_]/g, "_")}>`
          )
          .join("\n");
        return `  <record>\n${rowXml}\n  </record>`;
      })
      .join("\n")}\n</data>`;

    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.xml`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToTSV = (dataToExport, filename) => {
    const tsvContent = [
      columns.join("\t"),
      ...dataToExport.map((row) =>
        row
          .map((cell) => (cell || "").toString().replace(/\t/g, " "))
          .join("\t")
      ),
    ].join("\n");

    const blob = new Blob([tsvContent], { type: "text/tab-separated-values" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.tsv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Convert data to react-data-grid format
  const gridColumns = useMemo(() => {
    return columns.map((column, index) => ({
      key: `col_${index}`,
      name: column || `Column ${index + 1}`,
      resizable: true,
      sortable: true,
      editable: true,
      width: 150,
      headerRenderer: ({ column }) => (
        <div className="flex flex-col">
          <div className="font-semibold text-xs">{column.name}</div>
          <div className="text-xs text-gray-500">
            Missing: {statistics.missingValuesByColumn?.[column.name] || 0}
          </div>
        </div>
      ),
    }));
  }, [columns, statistics]);

  const gridRows = useMemo(() => {
    const dataToShow = showCleaned ? cleanedData : data;
    return (
      dataToShow?.map((row, rowIndex) => {
        const rowObj = { id: rowIndex };
        row.forEach((cell, colIndex) => {
          rowObj[`col_${colIndex}`] = cell;
        });
        return rowObj;
      }) || []
    );
  }, [data, cleanedData, showCleaned]);

  const handleRowsChange = (newRows) => {
    const newData = newRows.map((row) => {
      return columns.map((_, colIndex) => row[`col_${colIndex}`]);
    });

    if (showCleaned) {
      setCleanedData(newData);
    } else {
      setData(newData);
    }
  };

  // Redirect if no data
  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("No Data Found")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("Please upload a file first.")}
          </p>
          <button
            onClick={() => navigate("/upload")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {t("Go to Upload")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            🧹 {t("Data Cleaning Center")}
          </h1>
          <p className="text-gray-600 mt-2">
            {t("Comprehensive data cleaning and standardization tools")}
          </p>
        </div>

        {/* Cleaning Methods Card */}
        <div className="bg-white rounded-xl shadow-lg border p-8 mb-8 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Select Cleaning Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Remove Duplicates */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedOperations.removeDuplicates}
                onChange={(e) =>
                  handleOperationChange("removeDuplicates", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Remove Duplicates
                </label>
                <p className="text-xs text-gray-500">Remove duplicate rows</p>
              </div>
            </div>
            {/* Text Standardization */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedOperations.textStandardization}
                onChange={(e) =>
                  handleOperationChange("textStandardization", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Text Standardization
                </label>
                <p className="text-xs text-gray-500">
                  Capitalize names, gender, cities
                </p>
              </div>
            </div>
            {/* Fix Typos */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedOperations.fixTypos}
                onChange={(e) =>
                  handleOperationChange("fixTypos", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Fix Typos
                </label>
                <p className="text-xs text-gray-500">
                  Correct common spelling errors
                </p>
              </div>
            </div>
            {/* Format Phone Numbers */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedOperations.formatPhoneNumbers}
                onChange={(e) =>
                  handleOperationChange("formatPhoneNumbers", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Format Phone Numbers
                </label>
                <p className="text-xs text-gray-500">
                  Standardize phone formats
                </p>
              </div>
            </div>
            {/* Standardize Dates */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedOperations.standardizeDates}
                onChange={(e) =>
                  handleOperationChange("standardizeDates", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Standardize Dates
                </label>
                <p className="text-xs text-gray-500">
                  Convert to YYYY-MM-DD format
                </p>
              </div>
            </div>
            {/* Remove Missing Values */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedOperations.removeMissingValues}
                onChange={(e) =>
                  handleOperationChange("removeMissingValues", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Remove Missing Values
                </label>
                <p className="text-xs text-gray-500">Remove empty/null cells</p>
              </div>
            </div>
            {/* Handle Outliers */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedOperations.handleOutliers}
                  onChange={(e) =>
                    handleOperationChange("handleOutliers", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Handle Outliers
                  </label>
                  <p className="text-xs text-gray-500">Flag unusual values</p>
                </div>
              </div>
              {selectedOperations.handleOutliers && (
                <div className="mt-2">
                  <label className="text-xs text-gray-600">
                    Outlier Threshold: {outlierThreshold}th percentile
                  </label>
                  <input
                    type="range"
                    min="90"
                    max="99"
                    value={outlierThreshold}
                    onChange={(e) =>
                      setOutlierThreshold(parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
          <button
            onClick={async () => {
              await performComprehensiveCleaning();
              navigate("/report");
            }}
            disabled={isProcessing}
            className="w-full mt-8 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-semibold"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Apply Cleaning Operations & View Report
              </>
            )}
          </button>
        </div>

        {/* Data Preview Section */}
        <div className="bg-white rounded-xl shadow-lg border p-8 mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setShowCleaned(false)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  !showCleaned
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Original Data
              </button>
              <button
                onClick={() => setShowCleaned(true)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  showCleaned
                    ? "bg-green-600 text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Cleaned Data
              </button>
            </div>
          </div>
          <div className="h-96 overflow-auto">
            <DataGrid
              columns={gridColumns}
              rows={gridRows}
              onRowsChange={handleRowsChange}
              className="fill-grid"
              style={{ height: "384px" }}
            />
          </div>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Export Cleaned Data
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Choose your preferred export format:
              </p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => exportData("csv")}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex flex-col items-center justify-center text-sm gap-1"
                >
                  <span className="text-lg">📊</span>CSV
                </button>
                <button
                  onClick={() => exportData("excel")}
                  className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex flex-col items-center justify-center text-sm gap-1"
                >
                  <span className="text-lg">📗</span>Excel
                </button>
                <button
                  onClick={() => exportData("json")}
                  className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex flex-col items-center justify-center text-sm gap-1"
                >
                  <span className="text-lg">📄</span>JSON
                </button>
                <button
                  onClick={() => exportData("sql")}
                  className="p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex flex-col items-center justify-center text-sm gap-1"
                >
                  <span className="text-lg">🗃️</span>SQL
                </button>
                <button
                  onClick={() => exportData("xml")}
                  className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex flex-col items-center justify-center text-sm gap-1"
                >
                  <span className="text-lg">📝</span>XML
                </button>
                <button
                  onClick={() => exportData("tsv")}
                  className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex flex-col items-center justify-center text-sm gap-1"
                >
                  <span className="text-lg">📋</span>TSV
                </button>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clean;
