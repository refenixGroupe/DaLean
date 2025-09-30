import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import DataQualityDashboard from "../../components/DataQualityDashboard";
import { useToast } from "../../components/ToastProvider";

const Preview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const file = location.state?.file;

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileInfo, setFileInfo] = useState(null);

  const parseCSVFile = useCallback((file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          try {
            if (results.errors.length > 0) {
              console.warn("CSV parsing warnings:", results.errors);
            }

            const parsedData = results.data.filter((row) =>
              row.some(
                (cell) => cell !== null && cell !== undefined && cell !== ""
              )
            );

            if (parsedData.length > 0) {
              const headers = parsedData[0];
              const rows = parsedData.slice(1);

              setColumns(headers);
              setData(rows); // Process all rows
              setFileInfo({
                totalRows: rows.length,
                totalColumns: headers.length,
                displayedRows: rows.length,
              });
            }
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        error: (error) => {
          reject(error);
        },
        header: false,
        skipEmptyLines: true,
      });
    });
  }, []);

  const parseExcelFile = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          // Get the first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const filteredData = jsonData.filter((row) =>
            row.some(
              (cell) => cell !== null && cell !== undefined && cell !== ""
            )
          );

          if (filteredData.length > 0) {
            const headers = filteredData[0];
            const rows = filteredData.slice(1);

            setColumns(headers);
            setData(rows); // Process all rows
            setFileInfo({
              totalRows: rows.length,
              totalColumns: headers.length,
              displayedRows: rows.length,
            });
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const parseJSONFile = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);

          // Handle different JSON structures
          let processedData = [];
          if (Array.isArray(jsonData)) {
            processedData = jsonData;
          } else if (typeof jsonData === "object") {
            // If it's an object, convert to array
            processedData = [jsonData];
          }

          if (processedData.length > 0) {
            // Extract column names from the first object
            const headers = Object.keys(processedData[0]);
            const rows = processedData.map((item) =>
              headers.map((header) => item[header])
            );

            setColumns(headers);
            setData(rows); // Process all rows
            setFileInfo({
              totalRows: rows.length,
              totalColumns: headers.length,
              displayedRows: rows.length,
            });
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read JSON file"));
      reader.readAsText(file);
    });
  }, []);

  const parseFile = useCallback(
    async (file) => {
      setLoading(true);
      setError("");

      try {
        const fileExtension = "." + file.name.split(".").pop().toLowerCase();

        if (fileExtension === ".csv" || fileExtension === ".tsv") {
          await parseCSVFile(file);
        } else if (fileExtension === ".xlsx" || fileExtension === ".xls") {
          await parseExcelFile(file);
        } else if (fileExtension === ".json") {
          await parseJSONFile(file);
        } else {
          // For other text-based files, try parsing as CSV
          await parseCSVFile(file);
        }
      } catch (err) {
        setError("Error parsing file: " + err.message);
        toast.show("Error parsing file: " + err.message, { type: "error" });
      } finally {
        setLoading(false);
      }
    },
    [parseCSVFile, parseExcelFile, parseJSONFile]
  );

  useEffect(() => {
    if (file) {
      parseFile(file);
    }
  }, [file, parseFile]);

  const handleCleanData = () => {
    navigate("/clean", {
      state: {
        file: file,
        data: data,
        columns: columns,
        fileInfo: fileInfo,
      },
    });
  };

  const handleBack = () => {
    navigate("/upload");
  };

  if (!file) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            No File Selected
          </h2>
          <p className="text-gray-600 mb-6">
            Please upload a file to preview its contents.
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

  return (
    <div className="container mx-auto">
      {/* Header */}
      {/* Action Buttons */}
      {/* Remove any 'Back to Upload' button from the top section. Only keep the one at the end of the page. */}

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Data Preview</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Preview your uploaded data before cleaning. The table below shows the
          first 10 rows of your file.
        </p>
      </div>

      {/* File Information Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            File Information
          </h2>
          <span className="text-sm text-gray-500">{file.name}</span>
        </div>

        {fileInfo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-medium text-blue-800">Total Rows</div>
              <div className="text-2xl font-bold text-blue-600">
                {fileInfo.totalRows.toLocaleString()}
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-medium text-green-800">Total Columns</div>
              <div className="text-2xl font-bold text-green-600">
                {fileInfo.totalColumns}
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="font-medium text-purple-800">Showing Rows</div>
              <div className="text-2xl font-bold text-purple-600">
                {fileInfo.displayedRows}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Quality Assessment */}
      {!loading && !error && data.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 max-w-7xl mx-auto">
          <DataQualityDashboard data={data} title="Data Quality Assessment" />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Parsing your file...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-4xl mx-auto mb-8">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-red-600 mr-3"
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
            <div>
              <h3 className="text-lg font-medium text-red-800">
                Parsing Error
              </h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && data.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-7xl mx-auto mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Data Preview
            </h3>
            <p className="text-sm text-gray-600">
              Showing first {data.length} rows
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                    >
                      <div className="truncate" title={column}>
                        {column || `Column ${index + 1}`}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {columns.map((_, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200 last:border-r-0"
                      >
                        <div
                          className="truncate max-w-xs"
                          title={row[colIndex]}
                        >
                          {row[colIndex] !== null && row[colIndex] !== undefined
                            ? String(row[colIndex])
                            : "-"}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Move both buttons to end of page */}
      {!loading && !error && data.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-4xl mx-auto mb-8">
          <button
            onClick={handleBack}
            className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Upload
          </button>
          <button
            onClick={handleCleanData}
            className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg font-medium"
          >
            Clean Data
            <svg
              className="w-5 h-5 ml-2"
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

      {/* No Data State */}
      {!loading && !error && data.length === 0 && file && (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
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
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Data Found
          </h3>
          <p className="text-gray-600 mb-6">
            The file appears to be empty or contains no readable data.
          </p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload Different File
          </button>
        </div>
      )}
    </div>
  );
};

export default Preview;
