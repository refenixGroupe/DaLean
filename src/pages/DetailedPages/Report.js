import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend as RLegend,
} from "recharts";
import * as XLSX from "xlsx";
import MLDataCleaningService from "../../services/MLDataCleaningService";
import AdvancedCleaningConfig from "../../components/AdvancedCleaningConfig";
import DataQualityReport from "../../components/DataQualityReport";
import Logo from "../../components/Logo";

// Research-backed metrics for data quality
function calculateQualityMetrics(data, columns) {
  // Completeness: % of non-null, non-empty cells
  const totalCells = data.length * columns.length;
  const nonEmptyCells = data
    .flat()
    .filter(
      (cell) =>
        cell !== null && cell !== undefined && String(cell).trim() !== ""
    ).length;
  const completeness = (nonEmptyCells / totalCells) * 100;

  // Accuracy: Example - % of valid emails (for columns named 'email')
  const emailColIdx = columns.findIndex((col) =>
    col.toLowerCase().includes("email")
  );
  let validEmails = 0,
    totalEmails = 0;
  if (emailColIdx !== -1) {
    data.forEach((row) => {
      totalEmails++;
      if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row[emailColIdx])) validEmails++;
    });
  }
  const accuracy = totalEmails ? (validEmails / totalEmails) * 100 : null;

  // Uniqueness: % of unique rows
  const uniqueRows = new Set(data.map((row) => JSON.stringify(row))).size;
  const uniqueness = (uniqueRows / data.length) * 100;

  // Consistency: Example - % of consistent casing in categorical columns
  let consistent = 0,
    totalCat = 0;
  columns.forEach((col, idx) => {
    if (["gender", "city", "country"].includes(col.toLowerCase())) {
      totalCat++;
      const values = data.map((row) => row[idx]);
      const allLower = values.every(
        (val) => typeof val === "string" && val === val.toLowerCase()
      );
      const allUpper = values.every(
        (val) => typeof val === "string" && val === val.toUpperCase()
      );
      if (allLower || allUpper) consistent++;
    }
  });
  const consistency = totalCat ? (consistent / totalCat) * 100 : null;

  // Overall score (weighted average)
  const metrics = [completeness, accuracy, uniqueness, consistency].filter(
    (x) => x !== null
  );
  const overallScore = metrics.length
    ? metrics.reduce((a, b) => a + b, 0) / metrics.length
    : 0;

  return { completeness, accuracy, uniqueness, consistency, overallScore };
}

const Report = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Try to recover state from sessionStorage if missing
  const initialState =
    location.state ||
    JSON.parse(window.sessionStorage.getItem("reportState") || "{}");
  const [file] = useState(initialState.file);
  const [data] = useState(initialState.data);
  const [columns] = useState(initialState.columns);
  const [cleaningSummary] = useState(initialState.cleaningSummary);
  const [metrics, setMetrics] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Advanced cleaning states
  const [mlService] = useState(new MLDataCleaningService());
  const [beforeMetrics, setBeforeMetrics] = useState(null);
  const [afterMetrics, setAfterMetrics] = useState(null);
  const [cleanedData, setCleanedData] = useState(null);
  const [cleaningConfig, setCleaningConfig] = useState({});
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle keyboard events for accessibility
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape" && showExportModal) {
        setShowExportModal(false);
      }
    };

    if (showExportModal) {
      document.addEventListener("keydown", handleKeyPress);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.body.style.overflow = "unset";
    };
  }, [showExportModal]);

  // Save state for reloads and calculate metrics
  useEffect(() => {
    if (data && columns) {
      window.sessionStorage.setItem(
        "reportState",
        JSON.stringify({ file, data, columns, cleaningSummary })
      );

      // Calculate basic metrics
      const basicMetrics = calculateQualityMetrics(data, columns);
      setMetrics(basicMetrics);

      // Calculate comprehensive before metrics using advanced detection
      const { columnTypes } = mlService.detectColumnTypesAdvanced(
        data,
        columns
      );
      const beforeQualityMetrics = mlService.calculateDataQualityMetrics(
        data,
        columns,
        columnTypes
      );
      setBeforeMetrics(beforeQualityMetrics);
    }
  }, [file, data, columns, cleaningSummary, mlService]);

  // Convert data to object format for export
  const convertToObjectFormat = (dataToExport, columns) => {
    return dataToExport.map((row) => {
      const obj = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
  };

  // Export functions
  const exportData = (format) => {
    setIsExporting(true);
    const filename = `${file?.name?.split(".")[0] || "cleaned_data"}_report`;
    const dataToExport = cleanedData || data; // Use cleaned data if available

    try {
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
        case "xml":
          exportToXML(dataToExport, filename);
          break;
        case "tsv":
          exportToTSV(dataToExport, filename);
          break;
        default:
          exportToCSV(dataToExport, filename);
      }
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cleaned Data");
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

  const exportToXML = (dataToExport, filename) => {
    const objectData = convertToObjectFormat(dataToExport, columns);
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n';

    objectData.forEach((row) => {
      xmlContent += "  <record>\n";
      Object.entries(row).forEach(([key, value]) => {
        const cleanKey = key.replace(/[^a-zA-Z0-9]/g, "_");
        xmlContent += `    <${cleanKey}>${value || ""}</${cleanKey}>\n`;
      });
      xmlContent += "  </record>\n";
    });

    xmlContent += "</data>";

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
          .map((cell) => {
            const value = cell || "";
            return typeof value === "string" && value.includes("\t")
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
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

  // Advanced cleaning functions with improved safety
  const handleAdvancedCleaning = async () => {
    if (!data || !columns) {
      console.warn("No data or columns available for advanced cleaning");
      return;
    }

    setIsProcessing(true);
    const processStartTime = Date.now();
    try {
      // Use the improved safe cleaning method
      const cleaningResult = mlService.performSafeCleaning(data, columns, {
        maxDataLoss: 25, // Allow maximum 25% data loss
        preserveOriginal: true,
        validationMode: true,
      });

      let processedData = cleaningResult.cleanedData;
      const validation = cleaningResult.validation;

      // Show validation warnings if any
      if (validation && validation.warnings.length > 0) {
        console.warn("Cleaning validation warnings:", validation.warnings);
        // You could show these to user via toast notifications
      }

      // If safe cleaning didn't provide enough improvement, try more targeted cleaning
      if (validation && validation.metrics.dataLoss < 5) {
        const { columnTypes } = mlService.detectColumnTypesAdvanced(
          data,
          columns
        );

        // Apply specific cleaning operations based on user configuration
        const cleaningSummary = {
          totalRowsProcessed: data.length,
          missingValuesFixed: 0,
          duplicatesRemoved: parseInt(validation.metrics.dataLoss) || 0,
          outliersHandled: 0,
          textStandardized: 0,
          typosCorrected: 0,
          phonesFormatted: 0,
          datesStandardized: 0,
          outliersDetected: 0,
        };

        // Only apply more aggressive cleaning if user specifically configured it
        if (cleaningConfig && Object.keys(cleaningConfig).length > 0) {
          // Apply missing value imputation only if configured
          const firstColConfig = cleaningConfig[columns[0]];
          if (
            firstColConfig?.missingValues &&
            firstColConfig.missingValues !== "none"
          ) {
            const imputationResult = await mlService.imputeMissingValues(
              processedData,
              columns,
              columnTypes,
              firstColConfig.missingValues
            );
            processedData = imputationResult.cleanedData;
            cleaningSummary.missingValuesFixed = Object.values(
              imputationResult.imputationResults
            ).reduce((sum, result) => sum + result.count, 0);
          }

          // Apply outlier handling only if configured
          if (firstColConfig?.outliers && firstColConfig.outliers !== "none") {
            const outlierResult = mlService.handleOutliers(
              processedData,
              columns,
              columnTypes,
              firstColConfig.outliers
            );
            processedData = outlierResult.cleanedData;
            cleaningSummary.outliersDetected = Object.values(
              outlierResult.outlierResults
            ).reduce((sum, result) => sum + result.count, 0);
          }
        }

        // Apply gentle format standardization
        const formatResult = mlService.standardizeFormats(
          processedData,
          columns,
          columnTypes
        );
        processedData = formatResult.cleanedData;
        cleaningSummary.textStandardized = Object.values(
          formatResult.standardizationResults
        ).reduce((sum, result) => sum + result.standardized, 0);
      }

      // Calculate after metrics
      const { columnTypes } = mlService.detectColumnTypesAdvanced(
        processedData,
        columns
      );
      const afterQualityMetrics = mlService.calculateDataQualityMetrics(
        processedData,
        columns,
        columnTypes
      );

      setCleanedData(processedData);
      setAfterMetrics(afterQualityMetrics);
      setShowAdvancedConfig(false);

      // Update the main metrics for display
      setMetrics(calculateQualityMetrics(processedData, columns));

      // Learn from this dataset to improve future predictions
      mlService.learnFromDataset(data, columns, {
        cleaningSuccessful: true,
        userSatisfied: true,
        processingTime: Date.now() - processStartTime,
      });

      // Show success message
      console.log("Advanced cleaning completed successfully");
    } catch (error) {
      console.error("Advanced cleaning error:", error);
      // You could add a toast notification here or set an error state
      alert(
        `Error during advanced cleaning: ${
          error.message || "Unknown error occurred"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCleaningConfigChange = (config) => {
    setCleaningConfig(config);
  };

  const handlePreviewData = (previewData, previewSummary) => {
    setCleanedData(previewData);
    // You can also update after metrics here if needed
  };

  if (!data || !columns) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Data Found for Report
          </h2>
          <p className="text-gray-600 mb-6">
            Please perform data cleaning first. If you just cleaned, do not
            refresh or access this page directly.
          </p>
          <button
            onClick={() => navigate("/clean")}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <svg
              className="w-5 h-5 mr-2"
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
            Go to Clean Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
            <Logo size="xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Data Quality Assessment Report
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Comprehensive analysis of your cleaned dataset
          </p>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
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
              {showAdvancedConfig
                ? "Hide Advanced Options"
                : "Advanced ML Cleaning"}
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              disabled={isExporting}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5 mr-2"
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
                  Exporting...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Download Cleaned Data
                </>
              )}
            </button>
          </div>
        </div>

        {/* Advanced Cleaning Configuration */}
        {showAdvancedConfig && (
          <div className="mb-8">
            <AdvancedCleaningConfig
              data={data}
              columns={columns}
              onCleaningConfigChange={handleCleaningConfigChange}
              onPreviewData={handlePreviewData}
            />

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleAdvancedCleaning}
                disabled={isProcessing}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
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
                    <span>Processing with ML...</span>
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>Apply Advanced Cleaning</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Data Quality Report */}
        {beforeMetrics && afterMetrics && (
          <div className="mb-8">
            <DataQualityReport
              beforeMetrics={beforeMetrics}
              afterMetrics={afterMetrics}
              cleaningSummary={cleaningSummary}
              insights={mlService.generateAutomatedInsights(
                beforeMetrics,
                afterMetrics
              )}
            />
          </div>
        )}

        {/* Quality Metrics Graphs */}
        {metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-6 h-6 text-blue-600"
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
                <h2 className="text-xl font-bold text-gray-800">
                  Quality Metrics
                </h2>
              </div>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={[
                      { name: "Completeness", value: metrics.completeness },
                      { name: "Accuracy", value: metrics.accuracy },
                      { name: "Uniqueness", value: metrics.uniqueness },
                      { name: "Consistency", value: metrics.consistency },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis
                      domain={[0, 100]}
                      tickCount={6}
                      tick={{ fontSize: 12 }}
                    />
                    <RTooltip
                      formatter={(v) => [`${v.toFixed?.(1) ?? v}%`, "Score"]}
                      labelStyle={{ color: "#374151" }}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 flex flex-col items-center justify-center">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-6 h-6 text-green-600"
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
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Overall Quality Score
                </h2>
              </div>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Quality", value: metrics.overallScore },
                        {
                          name: "Remaining",
                          value: 100 - metrics.overallScore,
                        },
                      ]}
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f3f4f6" />
                    </Pie>
                    <RLegend />
                    <RTooltip
                      formatter={(v) => [`${v.toFixed?.(1) ?? v}%`, "Score"]}
                      labelStyle={{ color: "#374151" }}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {metrics.overallScore.toFixed(1)}%
                </div>
                <div className="text-gray-500 font-medium">
                  Overall Data Quality
                </div>
                <div className="mt-2 text-sm text-gray-400">
                  {metrics.overallScore >= 90
                    ? "Excellent"
                    : metrics.overallScore >= 80
                    ? "Good"
                    : metrics.overallScore >= 70
                    ? "Fair"
                    : "Needs Improvement"}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Cleaning Operations Summary */}
        {cleaningSummary && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Cleaning Operations Summary
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Rows Processed
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {cleaningSummary.totalRowsProcessed}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-600"
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
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      Missing Values Fixed
                    </p>
                    <p className="text-2xl font-bold text-green-700">
                      {cleaningSummary.missingValuesFixed}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">
                      Duplicates Removed
                    </p>
                    <p className="text-2xl font-bold text-blue-700">
                      {cleaningSummary.duplicatesRemoved}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">
                      Text Standardized
                    </p>
                    <p className="text-2xl font-bold text-purple-700">
                      {cleaningSummary.textStandardized}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-purple-600"
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
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">
                      Typos Corrected
                    </p>
                    <p className="text-2xl font-bold text-orange-700">
                      {cleaningSummary.typosCorrected}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-orange-200 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-orange-600"
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
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-600">
                      Phones Formatted
                    </p>
                    <p className="text-2xl font-bold text-indigo-700">
                      {cleaningSummary.phonesFormatted}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-indigo-200 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-teal-600">
                      Dates Standardized
                    </p>
                    <p className="text-2xl font-bold text-teal-700">
                      {cleaningSummary.datesStandardized}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-teal-200 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-teal-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Outliers Detected
                    </p>
                    <p className="text-2xl font-bold text-red-700">
                      {cleaningSummary.outliersDetected}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Navigation */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => navigate("/clean")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-lg hover:shadow-xl"
          >
            ← Back to Cleaning
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors shadow-lg hover:shadow-xl"
          >
            🏠 Home
          </button>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-modal-title"
            onClick={(e) =>
              e.target === e.currentTarget && setShowExportModal(false)
            }
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3
                  id="export-modal-title"
                  className="text-xl font-bold text-gray-900"
                >
                  Download Cleaned Data
                </h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                Choose your preferred format to download the cleaned dataset:
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => exportData("csv")}
                  disabled={isExporting}
                  className="flex items-center justify-center px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  CSV
                </button>

                <button
                  onClick={() => exportData("excel")}
                  disabled={isExporting}
                  className="flex items-center justify-center px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Excel
                </button>

                <button
                  onClick={() => exportData("json")}
                  disabled={isExporting}
                  className="flex items-center justify-center px-4 py-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  JSON
                </button>

                <button
                  onClick={() => exportData("xml")}
                  disabled={isExporting}
                  className="flex items-center justify-center px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  XML
                </button>

                <button
                  onClick={() => exportData("tsv")}
                  disabled={isExporting}
                  className="flex items-center justify-center px-4 py-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  TSV
                </button>

                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;
