import React, { useState, useEffect } from "react";
import MLDataCleaningService from "../services/MLDataCleaningService";

const AdvancedCleaningConfig = ({
  data,
  columns,
  onCleaningConfigChange,
  onPreviewData,
  className = "",
}) => {
  const [columnTypes, setColumnTypes] = useState({});
  const [typeConfidence, setTypeConfidence] = useState({});
  const [cleaningConfig, setCleaningConfig] = useState({});
  const [previewData, setPreviewData] = useState(null);
  const [previewSummary, setPreviewSummary] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showPresetOptions, setShowPresetOptions] = useState(false);
  const [mlService] = useState(new MLDataCleaningService());

  useEffect(() => {
    if (data && columns) {
      const { columnTypes, confidence } = mlService.detectColumnTypesAdvanced(
        data,
        columns
      );
      setColumnTypes(columnTypes);
      setTypeConfidence(confidence);

      // Initialize cleaning config based on detected types
      const config = {};
      columns.forEach((col) => {
        const columnType = columnTypes[col];
        config[col] = {
          missingValues: getDefaultMissingValueMethod(columnType),
          duplicates: "remove_all",
          outliers: columnType === "numeric" ? "cap" : "none",
          formatStandardization: "auto",
          customRegex: "",
          enabled: true,
        };
      });
      setCleaningConfig(config);
    }
  }, [data, columns, mlService]);

  // Helper functions
  const getDefaultMissingValueMethod = (columnType) => {
    switch (columnType) {
      case "numeric":
        return "mean";
      case "categorical":
        return "mode";
      case "date":
        return "forward_fill";
      default:
        return "mode";
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return "bg-green-100 text-green-800";
    if (confidence >= 0.7) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.9) return "High";
    if (confidence >= 0.7) return "Medium";
    return "Low";
  };

  const handleConfigChange = (column, field, value) => {
    const newConfig = {
      ...cleaningConfig,
      [column]: {
        ...cleaningConfig[column],
        [field]: value,
      },
    };
    setCleaningConfig(newConfig);
    onCleaningConfigChange(newConfig);
  };

  const handleColumnToggle = (column) => {
    const newConfig = {
      ...cleaningConfig,
      [column]: {
        ...cleaningConfig[column],
        enabled: !cleaningConfig[column]?.enabled,
      },
    };
    setCleaningConfig(newConfig);
    onCleaningConfigChange(newConfig);
  };

  const applyPreset = (presetName) => {
    const config = { ...cleaningConfig };

    columns.forEach((col) => {
      const columnType = columnTypes[col];

      switch (presetName) {
        case "conservative":
          config[col] = {
            ...config[col],
            missingValues: columnType === "numeric" ? "median" : "mode",
            duplicates: "keep_first",
            outliers: columnType === "numeric" ? "cap" : "none",
            formatStandardization: "auto",
          };
          break;
        case "aggressive":
          config[col] = {
            ...config[col],
            missingValues: "ml",
            duplicates: "remove_all",
            outliers: columnType === "numeric" ? "remove" : "none",
            formatStandardization: "auto",
          };
          break;
        case "minimal":
          config[col] = {
            ...config[col],
            missingValues: "none",
            duplicates: "none",
            outliers: "none",
            formatStandardization: "none",
          };
          break;
        default:
          break;
      }
    });

    setCleaningConfig(config);
    onCleaningConfigChange(config);
    setShowPresetOptions(false);
  };

  const handlePreview = async () => {
    if (!data || !columns) return;

    setIsPreviewing(true);
    try {
      let cleanedData = [...data];
      const cleaningSummary = {
        totalRowsProcessed: data.length,
        missingValuesFixed: 0,
        duplicatesRemoved: 0,
        outliersHandled: 0,
        textStandardized: 0,
        typosCorrected: 0,
        phonesFormatted: 0,
        datesStandardized: 0,
        outliersDetected: 0,
        columnsProcessed: 0,
      };

      // Apply column-specific cleaning
      for (const column of columns) {
        const config = cleaningConfig[column];
        if (!config?.enabled) continue;

        cleaningSummary.columnsProcessed++;

        // Apply missing value imputation for this column specifically
        const imputationResult = await mlService.imputeMissingValues(
          cleanedData,
          [column],
          { [column]: columnTypes[column] },
          config.missingValues || "mean"
        );

        if (imputationResult.imputationResults[column]) {
          cleaningSummary.missingValuesFixed +=
            imputationResult.imputationResults[column].count;
        }
      }

      // Apply duplicate handling (global operation)
      const duplicateConfig =
        cleaningConfig[columns[0]]?.duplicates || "remove_all";
      if (duplicateConfig !== "none") {
        const duplicateResult = mlService.handleDuplicates(
          cleanedData,
          duplicateConfig
        );
        cleanedData = duplicateResult.cleanedData;
        cleaningSummary.duplicatesRemoved = duplicateResult.removedCount;
      }

      // Apply outlier handling for numeric columns
      const numericColumns = columns.filter(
        (col) => columnTypes[col] === "numeric"
      );
      if (numericColumns.length > 0) {
        const outlierResult = mlService.handleOutliers(
          cleanedData,
          columns,
          columnTypes,
          cleaningConfig[numericColumns[0]]?.outliers || "cap"
        );
        cleanedData = outlierResult.cleanedData;
        cleaningSummary.outliersDetected = Object.values(
          outlierResult.outlierResults
        ).reduce((sum, result) => sum + result.count, 0);
      }

      // Apply format standardization
      const formatResult = mlService.standardizeFormats(
        cleanedData,
        columns,
        columnTypes
      );
      cleanedData = formatResult.cleanedData;
      cleaningSummary.textStandardized = Object.values(
        formatResult.standardizationResults
      ).reduce((sum, result) => sum + result.standardized, 0);

      setPreviewData(cleanedData);
      setPreviewSummary(cleaningSummary);
      onPreviewData(cleanedData, cleaningSummary);
    } catch (error) {
      console.error("Preview error:", error);
    } finally {
      setIsPreviewing(false);
    }
  };

  const getMissingValueOptions = (columnType) => {
    const baseOptions = [
      { value: "remove_rows", label: "Remove Rows" },
      { value: "fill_unknown", label: 'Fill with "Unknown"' },
    ];

    if (columnType === "numeric" || columnType === "numeric_mixed") {
      return [
        ...baseOptions,
        { value: "mean", label: "Fill with Mean" },
        { value: "median", label: "Fill with Median" },
        { value: "mode", label: "Fill with Mode" },
        { value: "forward_fill", label: "Forward Fill" },
        { value: "backward_fill", label: "Backward Fill" },
        { value: "interpolate", label: "Linear Interpolation" },
        { value: "xgboost", label: "XGBoost ML Imputation" },
        { value: "knn", label: "K-Nearest Neighbors" },
        { value: "zero", label: "Fill with Zero" },
        { value: "min", label: "Fill with Minimum" },
        { value: "max", label: "Fill with Maximum" },
        { value: "mode", label: "Fill with Mode" },
        { value: "ml", label: "ML Imputation (XGBoost)" },
        { value: "ml_lightgbm", label: "ML Imputation (LightGBM)" },
      ];
    }

    return baseOptions;
  };

  const getOutlierOptions = (columnType) => {
    if (columnType !== "numeric") {
      return [{ value: "none", label: "Not Applicable" }];
    }

    return [
      { value: "remove", label: "Remove Outliers" },
      { value: "cap", label: "Cap (Winsorize)" },
      { value: "replace_median", label: "Replace with Median" },
      { value: "none", label: "Keep Outliers" },
    ];
  };

  if (!data || !columns) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500 text-center">
          No data available for cleaning configuration
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Presets */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold">
            Advanced Data Cleaning Configuration
          </h3>
          <button
            onClick={() => setShowPresetOptions(!showPresetOptions)}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors flex items-center space-x-2"
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
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
              />
            </svg>
            <span>Presets</span>
          </button>
        </div>
        <p className="text-blue-100">
          Configure ML-based cleaning options for each column. Preview changes
          before applying.
        </p>

        {showPresetOptions && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => applyPreset("conservative")}
              className="px-3 py-1 bg-green-500/80 rounded text-sm hover:bg-green-500 transition-colors"
            >
              Conservative
            </button>
            <button
              onClick={() => applyPreset("aggressive")}
              className="px-3 py-1 bg-red-500/80 rounded text-sm hover:bg-red-500 transition-colors"
            >
              Aggressive
            </button>
            <button
              onClick={() => applyPreset("minimal")}
              className="px-3 py-1 bg-gray-500/80 rounded text-sm hover:bg-gray-500 transition-colors"
            >
              Minimal
            </button>
          </div>
        )}
      </div>

      {/* Column Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Column-Specific Settings
        </h4>

        <div className="space-y-6">
          {columns.map((column, idx) => (
            <div key={column} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {columnTypes[column]?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium text-gray-900">{column}</h5>
                      {typeConfidence[column] && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(
                            typeConfidence[column]
                          )}`}
                        >
                          {getConfidenceLabel(typeConfidence[column])} (
                          {(typeConfidence[column] * 100).toFixed(0)}%)
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 capitalize">
                      {columnTypes[column] || "Unknown"} Column
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cleaningConfig[column]?.enabled !== false}
                      onChange={() => handleColumnToggle(column)}
                      className="sr-only"
                    />
                    <div
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        cleaningConfig[column]?.enabled !== false
                          ? "bg-blue-600"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          cleaningConfig[column]?.enabled !== false
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </div>
                    <span className="ml-2 text-sm text-gray-600">Enable</span>
                  </label>
                </div>
              </div>

              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                role="group"
                aria-labelledby={`column-config-${column}`}
              >
                {/* Missing Values */}
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor={`missing-values-${column}`}
                  >
                    Missing Values
                  </label>
                  <select
                    id={`missing-values-${column}`}
                    value={cleaningConfig[column]?.missingValues || "mean"}
                    onChange={(e) =>
                      handleConfigChange(
                        column,
                        "missingValues",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-describedby={`missing-values-help-${column}`}
                  >
                    {getMissingValueOptions(columnTypes[column]).map(
                      (option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      )
                    )}
                  </select>
                  <div id={`missing-values-help-${column}`} className="sr-only">
                    Choose how to handle missing values in the {column} column
                  </div>
                </div>

                {/* Duplicates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duplicates
                  </label>
                  <select
                    value={cleaningConfig[column]?.duplicates || "remove_all"}
                    onChange={(e) =>
                      handleConfigChange(column, "duplicates", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="remove_all">Remove All</option>
                    <option value="keep_first">Keep First</option>
                    <option value="keep_last">Keep Last</option>
                    <option value="none">Keep All</option>
                  </select>
                </div>

                {/* Outliers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Outliers
                  </label>
                  <select
                    value={cleaningConfig[column]?.outliers || "remove"}
                    onChange={(e) =>
                      handleConfigChange(column, "outliers", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {getOutlierOptions(columnTypes[column]).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Format Standardization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format
                  </label>
                  <select
                    value={
                      cleaningConfig[column]?.formatStandardization || "auto"
                    }
                    onChange={(e) =>
                      handleConfigChange(
                        column,
                        "formatStandardization",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="auto">Auto-standardize</option>
                    <option value="drop_invalid">Drop Invalid</option>
                    <option value="regex_fix">Regex Fix</option>
                    <option value="none">No Change</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800">
            Preview Results
          </h4>
          <button
            onClick={handlePreview}
            disabled={isPreviewing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isPreviewing ? (
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
                <span>Previewing...</span>
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span>Preview Changes</span>
              </>
            )}
          </button>
        </div>

        {previewData && (
          <div className="mt-4">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4">
              <h5 className="font-medium text-gray-800 mb-3">
                Cleaning Preview Summary
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div className="bg-white rounded p-3 shadow-sm">
                  <div className="text-gray-600">Original Rows</div>
                  <div className="text-xl font-bold text-gray-900">
                    {data.length}
                  </div>
                </div>
                <div className="bg-white rounded p-3 shadow-sm">
                  <div className="text-gray-600">Cleaned Rows</div>
                  <div className="text-xl font-bold text-green-600">
                    {previewData.length}
                  </div>
                </div>
                <div className="bg-white rounded p-3 shadow-sm">
                  <div className="text-gray-600">Rows Removed</div>
                  <div className="text-xl font-bold text-red-600">
                    {data.length - previewData.length}
                  </div>
                </div>
                <div className="bg-white rounded p-3 shadow-sm">
                  <div className="text-gray-600">Retention Rate</div>
                  <div className="text-xl font-bold text-blue-600">
                    {((previewData.length / data.length) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {previewSummary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-gray-600">Missing Values Fixed</div>
                    <div className="text-lg font-semibold text-green-600">
                      {previewSummary.missingValuesFixed || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Duplicates Removed</div>
                    <div className="text-lg font-semibold text-orange-600">
                      {previewSummary.duplicatesRemoved || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Outliers Handled</div>
                    <div className="text-lg font-semibold text-purple-600">
                      {previewSummary.outliersDetected || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Columns Processed</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {previewSummary.columnsProcessed || 0}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((col, idx) => (
                      <th
                        key={idx}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.slice(0, 5).map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-gray-50">
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="px-3 py-2 whitespace-nowrap text-sm text-gray-900"
                        >
                          {cell !== null && cell !== undefined
                            ? String(cell)
                            : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 5 && (
                <div className="text-center py-2 text-sm text-gray-500">
                  Showing first 5 rows of {previewData.length} total rows
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedCleaningConfig;
