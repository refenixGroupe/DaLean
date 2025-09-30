import React, { useState, useMemo } from "react";
import { DataQualityScorer } from "../utils/DataQualityScorer";
import DataQualityDashboard from "./DataQualityDashboard";

/**
 * 🎨 FORMAT AND EXPORT COMPONENT
 * Provides field formatting normalization and export functionality
 */
const FormatAndExport = ({ data, onDataChange, className = "" }) => {
  const [isFormatting, setIsFormatting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [formattedData, setFormattedData] = useState(null);

  // Calculate quality scores
  const originalQuality = useMemo(() => {
    if (!data || data.length === 0) return null;
    const scorer = new DataQualityScorer();
    return scorer.assessDataQuality(data);
  }, [data]);

  const formattedQuality = useMemo(() => {
    if (!formattedData || formattedData.length === 0) return null;
    const scorer = new DataQualityScorer();
    return scorer.assessDataQuality(formattedData);
  }, [formattedData]);

  // Apply field formatting
  const handleFormatData = async () => {
    if (!data || data.length === 0) return;

    setIsFormatting(true);
    try {
      // Simulate processing time for large datasets
      await new Promise((resolve) => setTimeout(resolve, 500));

      const scorer = new DataQualityScorer();
      const formatted = scorer.formatDataset(data);
      setFormattedData(formatted);

      if (onDataChange) {
        onDataChange(formatted);
      }
    } catch (error) {
      console.error("Error formatting data:", error);
    } finally {
      setIsFormatting(false);
    }
  };

  // Export functions
  const handleExportQualityReport = () => {
    setIsExporting(true);
    try {
      const filename = `quality_report_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      const scorer = new DataQualityScorer();
      scorer.exportQualityReportCSV(data, formattedData, filename);
    } catch (error) {
      console.error("Error exporting quality report:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportFormattedData = () => {
    if (!formattedData) return;

    setIsExporting(true);
    try {
      const filename = `formatted_data_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      const scorer = new DataQualityScorer();
      scorer.exportFormattedDataCSV(formattedData, filename);
    } catch (error) {
      console.error("Error exporting formatted data:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportOriginalData = () => {
    setIsExporting(true);
    try {
      const filename = `original_data_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      const scorer = new DataQualityScorer();
      scorer.exportFormattedDataCSV(data, filename);
    } catch (error) {
      console.error("Error exporting original data:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getFormattingPreview = () => {
    if (!data || data.length === 0) return [];

    const sample = data.slice(0, 3); // Show first 3 rows
    const scorer = new DataQualityScorer();
    const formatted = scorer.formatDataset(sample);

    return sample.map((original, index) => ({
      original,
      formatted: formatted[index],
    }));
  };

  if (!data || data.length === 0) {
    return (
      <div
        className={`p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center ${className}`}
      >
        <p className="text-gray-500">
          No data available for formatting and export
        </p>
      </div>
    );
  }

  const formattingPreview = getFormattingPreview();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Format & Export
        </h2>
        <p className="text-gray-600">
          Apply field formatting normalization and export your data quality
          reports
        </p>
      </div>

      {/* Quality Overview */}
      {originalQuality && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Original Data Quality
            </h3>
            <DataQualityDashboard qualityData={originalQuality} />
          </div>

          {formattedQuality && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Formatted Data Quality
              </h3>
              <DataQualityDashboard qualityData={formattedQuality} />
            </div>
          )}
        </div>
      )}

      {/* Formatting Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
           Field Formatting
          </h3>
          <button
            onClick={handleFormatData}
            disabled={isFormatting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isFormatting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Formatting...</span>
              </div>
            ) : (
              "Apply Formatting"
            )}
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Formatting Rules Applied:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • <strong>Names:</strong> Last names → ALL CAPS, First names →
                Capitalized, Full names → Title Case
              </li>
              <li>
                • <strong>Car Brands/Models:</strong> First letter capitalized
                only
              </li>
              <li>
                • <strong>Gender:</strong> Standardized to "Male"/"Female"
              </li>
              <li>
                • <strong>Cities:</strong> Title case for each word
              </li>
            </ul>
          </div>

          {/* Formatting Preview */}
          {formattingPreview.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">
                Preview (First 3 rows):
              </h4>
              {formattingPreview.map((row, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">
                        Before:
                      </h5>
                      <div className="text-sm space-y-1">
                        {Object.entries(row.original)
                          .slice(0, 5)
                          .map(([key, value]) => (
                            <div key={key} className="flex">
                              <span className="font-medium text-gray-600 w-24">
                                {key}:
                              </span>
                              <span className="text-gray-800">
                                {value || "N/A"}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-green-700 mb-2">
                        After:
                      </h5>
                      <div className="text-sm space-y-1">
                        {Object.entries(row.formatted)
                          .slice(0, 5)
                          .map(([key, value]) => (
                            <div key={key} className="flex">
                              <span className="font-medium text-gray-600 w-24">
                                {key}:
                              </span>
                              <span className="text-green-800">
                                {value || "N/A"}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Export Options
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quality Report Export */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              📊 Quality Report
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Export comprehensive quality metrics with before/after comparison
            </p>
            <button
              onClick={handleExportQualityReport}
              disabled={isExporting}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isExporting ? "Exporting..." : "Export Report CSV"}
            </button>
          </div>

          {/* Original Data Export */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Original Data</h4>
            <p className="text-sm text-gray-600 mb-3">
              Export the original unformatted dataset
            </p>
            <button
              onClick={handleExportOriginalData}
              disabled={isExporting}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {isExporting ? "Exporting..." : "Export Original CSV"}
            </button>
          </div>

          {/* Formatted Data Export */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
             Formatted Data
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Export the formatted and normalized dataset
            </p>
            <button
              onClick={handleExportFormattedData}
              disabled={isExporting || !formattedData}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {isExporting ? "Exporting..." : "Export Formatted CSV"}
            </button>
          </div>
        </div>

        {/* Export Summary */}
        {formattedData && formattedQuality && originalQuality && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">
              ✅ Export Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-green-700">Records:</span>
                <div className="font-medium">{formattedData.length}</div>
              </div>
              <div>
                <span className="text-green-700">Fields:</span>
                <div className="font-medium">
                  {Object.keys(formattedData[0] || {}).length}
                </div>
              </div>
              <div>
                <span className="text-green-700">Original Quality:</span>
                <div className="font-medium">
                  {(originalQuality.overall * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <span className="text-green-700">Formatted Quality:</span>
                <div className="font-medium">
                  {(formattedQuality.overall * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormatAndExport;
