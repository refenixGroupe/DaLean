import React from "react";
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
  ComposedChart,
} from "recharts";

const DataQualityReport = ({
  beforeMetrics,
  afterMetrics,
  cleaningSummary,
  insights = [],
  className = "",
}) => {
  if (!beforeMetrics || !afterMetrics) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No metrics available
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Run data cleaning to see quality improvements
          </p>
        </div>
      </div>
    );
  }

  // Calculate improvement metrics
  const calculateImprovement = (before, after) => {
    const improvement = after - before;
    const improvementPercentage = before > 0 ? (improvement / before) * 100 : 0;
    return { improvement, improvementPercentage };
  };

  const overallImprovement = calculateImprovement(
    beforeMetrics.overall,
    afterMetrics.overall
  );

  // Prepare data for visualizations
  const missingData = Object.keys(beforeMetrics.missing).map((column) => ({
    column,
    before: beforeMetrics.missing[column]?.percentage || 0,
    after: afterMetrics.missing[column]?.percentage || 0,
    improvement:
      (beforeMetrics.missing[column]?.percentage || 0) -
      (afterMetrics.missing[column]?.percentage || 0),
  }));

  const invalidData = Object.keys(beforeMetrics.invalid).map((column) => ({
    column,
    before: beforeMetrics.invalid[column]?.percentage || 0,
    after: afterMetrics.invalid[column]?.percentage || 0,
    improvement:
      (beforeMetrics.invalid[column]?.percentage || 0) -
      (afterMetrics.invalid[column]?.percentage || 0),
  }));

  const qualityScoreData = [
    { metric: "Before", score: beforeMetrics.overall, fill: "#ef4444" },
    { metric: "After", score: afterMetrics.overall, fill: "#10b981" },
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">Data Quality Report</h3>
        <p className="text-green-100">
          Comprehensive before/after analysis of your data cleaning process
        </p>
      </div>

      {/* Overall Score Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Overall Quality Score
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Before Score */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 relative">
              <svg
                className="w-24 h-24 transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#ef4444"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${beforeMetrics.overall * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`text-2xl font-bold ${getScoreColor(
                    beforeMetrics.overall
                  )}`}
                >
                  {beforeMetrics.overall.toFixed(1)}%
                </span>
              </div>
            </div>
            <h5 className="font-medium text-gray-900">Before Cleaning</h5>
            <p className="text-sm text-gray-500">
              {getScoreLabel(beforeMetrics.overall)}
            </p>
          </div>

          {/* Improvement Arrow */}
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-green-500 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div className="text-lg font-bold text-green-600">
                +{overallImprovement.improvement.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Improvement</div>
            </div>
          </div>

          {/* After Score */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 relative">
              <svg
                className="w-24 h-24 transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${afterMetrics.overall * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`text-2xl font-bold ${getScoreColor(
                    afterMetrics.overall
                  )}`}
                >
                  {afterMetrics.overall.toFixed(1)}%
                </span>
              </div>
            </div>
            <h5 className="font-medium text-gray-900">After Cleaning</h5>
            <p className="text-sm text-gray-500">
              {getScoreLabel(afterMetrics.overall)}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missing Values Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Missing Values by Column
          </h4>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <ComposedChart data={missingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="column" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <RTooltip
                  formatter={(value, name) => [
                    `${value.toFixed(1)}%`,
                    name === "before" ? "Before" : "After",
                  ]}
                  labelStyle={{ color: "#374151" }}
                />
                <Bar
                  dataKey="before"
                  fill="#ef4444"
                  name="before"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="after"
                  fill="#10b981"
                  name="after"
                  radius={[2, 2, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invalid Values Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Invalid Values by Column
          </h4>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <ComposedChart data={invalidData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="column" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <RTooltip
                  formatter={(value, name) => [
                    `${value.toFixed(1)}%`,
                    name === "before" ? "Before" : "After",
                  ]}
                  labelStyle={{ color: "#374151" }}
                />
                <Bar
                  dataKey="before"
                  fill="#f59e0b"
                  name="before"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="after"
                  fill="#10b981"
                  name="after"
                  radius={[2, 2, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quality Score Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Quality Score Comparison
        </h4>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={qualityScoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="metric" />
              <YAxis domain={[0, 100]} />
              <RTooltip
                formatter={(value) => [`${value.toFixed(1)}%`, "Score"]}
                labelStyle={{ color: "#374151" }}
              />
              <Bar dataKey="score" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cleaning Operations Summary */}
      {cleaningSummary && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Cleaning Operations Summary
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
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

            <div className="bg-green-50 rounded-lg p-4">
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

            <div className="bg-blue-50 rounded-lg p-4">
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

            <div className="bg-purple-50 rounded-lg p-4">
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
          </div>
        </div>
      )}

      {/* Automated Insights */}
      {insights && insights.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <svg
              className="w-6 h-6 text-indigo-600 mr-2"
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
            <h4 className="text-lg font-semibold text-gray-800">
              AI-Generated Insights
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => {
              const iconColors = {
                success: "text-green-600 bg-green-100",
                info: "text-blue-600 bg-blue-100",
                warning: "text-yellow-600 bg-yellow-100",
                error: "text-red-600 bg-red-100",
              };

              const borderColors = {
                success: "border-green-200",
                info: "border-blue-200",
                warning: "border-yellow-200",
                error: "border-red-200",
              };

              return (
                <div
                  key={index}
                  className={`bg-white rounded-lg p-4 border-l-4 ${
                    borderColors[insight.type]
                  } shadow-sm`}
                >
                  <div className="flex items-start">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        iconColors[insight.type]
                      }`}
                    >
                      {insight.type === "success" && (
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {insight.type === "info" && (
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {insight.type === "warning" && (
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {insight.type === "error" && (
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-gray-900 text-sm">
                          {insight.category}
                        </h5>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            insight.impact === "high"
                              ? "bg-red-100 text-red-800"
                              : insight.impact === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {insight.impact} impact
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{insight.message}</p>
                      {insight.recommendations && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Recommendations:
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {insight.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="mr-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quality Score Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Quality Distribution
          </h4>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[
                    {
                      name: "Quality Score",
                      value: afterMetrics.overall,
                      fill: "#10b981",
                    },
                    {
                      name: "Issues Remaining",
                      value: 100 - afterMetrics.overall,
                      fill: "#ef4444",
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <RTooltip
                  formatter={(value) => [`${value.toFixed(1)}%`, "Percentage"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Quality Improvement Summary
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">
                Overall Quality
              </span>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {overallImprovement.improvement > 0 ? "+" : ""}
                  {overallImprovement.improvement.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  {beforeMetrics.overall.toFixed(1)}% →{" "}
                  {afterMetrics.overall.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">
                Duplicate Reduction
              </span>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">
                  -{beforeMetrics.duplicates - afterMetrics.duplicates}
                </div>
                <div className="text-xs text-gray-500">records removed</div>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">
                Data Completeness
              </span>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">
                  {(
                    Object.values(afterMetrics.missing).reduce(
                      (sum, metric) => sum + (100 - metric.percentage),
                      0
                    ) / Object.keys(afterMetrics.missing).length
                  ).toFixed(1)}
                  %
                </div>
                <div className="text-xs text-gray-500">
                  average completeness
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataQualityReport;
