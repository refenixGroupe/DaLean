import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ModelPerformanceComparison = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock API call - replace with actual API endpoint
  const fetchMetricsComparison = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock response - replace with actual fetch call
      // const response = await fetch('/api/metrics-comparison');
      // const data = await response.json();

      const mockData = {
        before: {
          accuracy: 0.85,
          precision: 0.8,
          recall: 0.78,
          f1: 0.79,
        },
        after: {
          accuracy: 0.92,
          precision: 0.88,
          recall: 0.86,
          f1: 0.87,
        },
      };

      setData(mockData);
    } catch (err) {
      setError("Failed to fetch performance metrics. Please try again.");
      console.error("Error fetching metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricsComparison();
  }, []);

  // Transform data for chart
  const chartData = data
    ? [
        {
          metric: "Accuracy",
          before: data.before.accuracy,
          after: data.after.accuracy,
        },
        {
          metric: "Precision",
          before: data.before.precision,
          after: data.after.precision,
        },
        {
          metric: "Recall",
          before: data.before.recall,
          after: data.after.recall,
        },
        {
          metric: "F1-Score",
          before: data.before.f1,
          after: data.after.f1,
        },
      ]
    : [];

  // Calculate improvements
  const getImprovement = (before, after) => {
    const improvement = ((after - before) / before) * 100;
    return improvement.toFixed(1);
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${
                entry.dataKey === "before"
                  ? "Before Cleaning"
                  : "After Cleaning"
              }: ${(entry.value * 100).toFixed(1)}%`}
            </p>
          ))}
          {payload.length === 2 && (
            <p className="text-sm text-green-600 font-medium mt-1">
              Improvement: +{getImprovement(payload[0].value, payload[1].value)}
              %
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div
      className="flex justify-center items-center p-8"
      role="status"
      aria-label="Loading performance metrics"
    >
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">Loading performance metrics...</span>
    </div>
  );

  // Error component
  const ErrorMessage = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-red-600 mb-2">
        <svg
          className="w-12 h-12 mx-auto"
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
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Error Loading Data
      </h3>
      <p className="text-red-600 mb-4">{error}</p>
      <button
        onClick={fetchMetricsComparison}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;
  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Model Performance Comparison
        </h1>
        <p className="text-gray-600">
          Compare machine learning model performance before and after data
          cleaning
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Before Cleaning Card */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-gray-400 rounded mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-800">
              Before Cleaning
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">
                {(data.before.accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Accuracy</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">
                {(data.before.precision * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Precision</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">
                {(data.before.recall * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Recall</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">
                {(data.before.f1 * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">F1-Score</div>
            </div>
          </div>
        </div>

        {/* After Cleaning Card */}
        <div className="bg-white rounded-lg border-2 border-green-200 bg-green-50 p-6">
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
            <h3 className="text-lg font-semibold text-green-800">
              After Cleaning
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {(data.after.accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Accuracy</div>
              <div className="text-xs text-green-600 mt-1 font-medium">
                +{getImprovement(data.before.accuracy, data.after.accuracy)}%
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {(data.after.precision * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Precision</div>
              <div className="text-xs text-green-600 mt-1 font-medium">
                +{getImprovement(data.before.precision, data.after.precision)}%
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {(data.after.recall * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Recall</div>
              <div className="text-xs text-green-600 mt-1 font-medium">
                +{getImprovement(data.before.recall, data.after.recall)}%
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {(data.after.f1 * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">F1-Score</div>
              <div className="text-xs text-green-600 mt-1 font-medium">
                +{getImprovement(data.before.f1, data.after.f1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          Performance Metrics Comparison
        </h2>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="metric"
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={{ stroke: "#d1d5db" }}
              />
              <YAxis
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={{ stroke: "#d1d5db" }}
                label={{
                  value: "Score (%)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
              <Bar
                dataKey="before"
                name="Before Cleaning"
                fill="#9ca3af"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
              <Bar
                dataKey="after"
                name="After Cleaning"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Data Cleaning Impact Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                +{getImprovement(data.before.accuracy, data.after.accuracy)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy Gain</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                +{getImprovement(data.before.precision, data.after.precision)}%
              </div>
              <div className="text-sm text-gray-600">Precision Gain</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                +{getImprovement(data.before.recall, data.after.recall)}%
              </div>
              <div className="text-sm text-gray-600">Recall Gain</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                +{getImprovement(data.before.f1, data.after.f1)}%
              </div>
              <div className="text-sm text-gray-600">F1-Score Gain</div>
            </div>
          </div>
          <p className="text-gray-600 mt-4 text-sm">
            Data cleaning significantly improved model performance across all
            metrics, demonstrating the importance of proper data preprocessing
            in machine learning workflows.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformanceComparison;
