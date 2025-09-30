import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataQualityScorer } from "../utils/DataQualityScorer";

const DataQualityDashboard = ({
  data,
  cleanedData = null,
  title = "Data Quality Assessment",
  fileName = "data_export",
}) => {
  const navigate = useNavigate();
  const [qualityAssessment, setQualityAssessment] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      setLoading(true);

      try {
        // Create DataQualityScorer instance
        const scorer = new DataQualityScorer();

        // Calculate quality assessment
        const assessment = scorer.assessDataQuality(data);
        setQualityAssessment(assessment);

        // If cleaned data is provided, calculate comparison
        if (
          cleanedData &&
          Array.isArray(cleanedData) &&
          cleanedData.length > 0
        ) {
          const comp = scorer.compareQualityScores(data, cleanedData);
          setComparison(comp);
        }
      } catch (error) {
        console.error("Error in data quality assessment:", error);
        setQualityAssessment(null);
        setComparison(null);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setQualityAssessment(null);
      setComparison(null);
    }
  }, [data, cleanedData]);

  const getScoreColor = (score) => {
    if (score >= 0.9) return "text-green-600 bg-green-100";
    if (score >= 0.8) return "text-blue-600 bg-blue-100";
    if (score >= 0.6) return "text-yellow-600 bg-yellow-100";
    if (score >= 0.4) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreBorder = (score) => {
    if (score >= 0.9) return "border-green-200";
    if (score >= 0.8) return "border-blue-200";
    if (score >= 0.6) return "border-yellow-200";
    if (score >= 0.4) return "border-orange-200";
    return "border-red-200";
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "text-red-700 bg-red-100";
      case "medium":
        return "text-yellow-700 bg-yellow-100";
      case "low":
        return "text-green-700 bg-green-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Analyzing data quality...</span>
      </div>
    );
  }

  if (
    !qualityAssessment ||
    !qualityAssessment.dimensions ||
    !qualityAssessment.overall
  ) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>No data available for quality assessment</p>
        <p className="text-sm mt-2">
          Data: {data ? `${data.length} rows` : "No data"}
        </p>
        <p className="text-sm">
          Quality Assessment:{" "}
          {qualityAssessment ? "Available but incomplete" : "Not available"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <div
          className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getScoreColor(
            qualityAssessment.overall || 0
          )}`}
        >
          <span className="text-2xl mr-2">
            {(qualityAssessment.overall || 0) >= 0.9
              ? "🟢"
              : (qualityAssessment.overall || 0) >= 0.8
              ? "🔵"
              : (qualityAssessment.overall || 0) >= 0.6
              ? "🟡"
              : (qualityAssessment.overall || 0) >= 0.4
              ? "🟠"
              : "🔴"}
          </span>
          {qualityAssessment.scoreInterpretation?.overall || "Unknown"} -{" "}
          {qualityAssessment.qualityLevel?.toUpperCase() || "UNKNOWN"}
        </div>
        <p className="text-gray-600 mt-2">
          {qualityAssessment.scoreInterpretation?.description ||
            "No description available"}
        </p>
      </div>

      {/* Comparison Section (if cleaned data is available) */}
      {comparison && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-green-600"
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
            Cleaning Performance Impact
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-gray-700">
                {comparison["Score Before"]
                  ? (comparison["Score Before"] * 100).toFixed(1)
                  : "0.0"}
                %
              </div>
              <div className="text-sm text-gray-500">Before Cleaning</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">
                {comparison["Score After"]
                  ? (comparison["Score After"] * 100).toFixed(1)
                  : "0.0"}
                %
              </div>
              <div className="text-sm text-gray-500">After Cleaning</div>
            </div>
            <div className="text-center p-4 bg-green-100 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                +
                {comparison["Improvement %"]
                  ? comparison["Improvement %"].toFixed(1)
                  : "0.0"}
                %
              </div>
              <div className="text-sm text-green-600">Improvement</div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <strong>Summary:</strong> {comparison.summary?.rowsRemoved || 0}{" "}
            rows removed,
            {comparison.summary?.qualityGained
              ? comparison.summary.qualityGained.toFixed(1)
              : "0.0"}{" "}
            quality points gained
          </div>
        </div>
      )}

      {/* Dimension Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(qualityAssessment.dimensions || {}).map(
          ([dimension, score]) => {
            // Ensure score is a valid number
            const validScore =
              typeof score === "number" && !isNaN(score) ? score : 0;
            const improvementData = comparison?.dimensions?.[dimension];

            return (
              <div
                key={dimension}
                className={`bg-white rounded-lg border-2 p-4 ${getScoreBorder(
                  validScore
                )}`}
              >
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900 capitalize mb-2">
                    {dimension === "uniqueness"
                      ? "Uniqueness"
                      : dimension === "completeness"
                      ? "Completeness"
                      : dimension === "consistency"
                      ? "Consistency"
                      : "Accuracy"}
                  </h4>
                  <div
                    className={`text-3xl font-bold mb-2 ${
                      getScoreColor(validScore).split(" ")[0]
                    }`}
                  >
                    {(validScore * 100).toFixed(1)}%
                  </div>

                  {improvementData && (
                    <div className="text-sm">
                      <div className="flex justify-between text-gray-600 mb-1">
                        <span>Before:</span>
                        <span>
                          {improvementData.before
                            ? (improvementData.before * 100).toFixed(1)
                            : "0.0"}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Improvement:</span>
                        <span>
                          +
                          {improvementData.improvementPercentage
                            ? improvementData.improvementPercentage.toFixed(1)
                            : "0.0"}
                          %
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-2">
                    <div className={`w-full bg-gray-200 rounded-full h-2`}>
                      <div
                        className={`h-2 rounded-full ${
                          getScoreColor(validScore).includes("green")
                            ? "bg-green-500"
                            : getScoreColor(validScore).includes("blue")
                            ? "bg-blue-500"
                            : getScoreColor(validScore).includes("yellow")
                            ? "bg-yellow-500"
                            : getScoreColor(validScore).includes("orange")
                            ? "bg-orange-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${validScore * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Dataset Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Dataset Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-700">
              {qualityAssessment.details?.totalRows?.toLocaleString() || "0"}
            </div>
            <div className="text-sm text-gray-500">Total Rows</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-700">
              {qualityAssessment.details?.totalFields || 0}
            </div>
            <div className="text-sm text-gray-500">Columns</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-xl font-bold text-red-600">
              {qualityAssessment.details?.missingValues?.toLocaleString() ||
                "0"}
            </div>
            <div className="text-sm text-red-500">Missing Values</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-xl font-bold text-orange-600">
              {qualityAssessment.details?.duplicateRows?.toLocaleString() ||
                "0"}
            </div>
            <div className="text-sm text-orange-500">Duplicate Rows</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {qualityAssessment.recommendations &&
        qualityAssessment.recommendations.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-blue-600"
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
              Recommendations
            </h3>
            <div className="space-y-3">
              {qualityAssessment.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    rec.severity === "high"
                      ? "bg-red-50 border-red-400"
                      : rec.severity === "medium"
                      ? "bg-yellow-50 border-yellow-400"
                      : "bg-green-50 border-green-400"
                  }`}
                >
                  <div className="flex items-start">
                    <div
                      className={`flex-shrink-0 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-3 ${getSeverityColor(
                        rec.severity
                      )}`}
                    >
                      {rec.severity.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800">{rec.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Weights Information */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Scoring Weights
        </h4>
        <div className="grid grid-cols-4 gap-2 text-xs">
          {Object.entries(DataQualityScorer.DEFAULT_WEIGHTS || {}).map(
            ([dimension, weight]) => (
              <div key={dimension} className="text-center">
                <div className="font-medium capitalize">{dimension}</div>
                <div className="text-gray-600">{weight * 100}%</div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default DataQualityDashboard;
