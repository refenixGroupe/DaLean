import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DataGrid } from "react-data-grid";
import "react-data-grid/lib/styles.css";

const CleanedResult = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { cleanedData, columns, qualityScore, cleaningSummary } = location.state || {};

	return (
		<div className="min-h-screen bg-white py-8 px-4">
			<h1 className="text-3xl font-bold mb-4 text-center">Cleaned Data & Quality Assessment</h1>
			<div className="mb-6">
				<div className="text-lg font-semibold">Quality Score: <span className="text-blue-600">{qualityScore ?? "N/A"}</span></div>
				<div className="mt-2 p-4 bg-gray-50 rounded shadow">
					<h2 className="font-bold mb-2">Cleaning Report</h2>
					<pre className="text-sm whitespace-pre-wrap">{cleaningSummary ?? "No summary available."}</pre>
				</div>
			</div>
			<div className="mb-8">
				<h2 className="font-bold mb-2">Cleaned Data Preview</h2>
				{cleanedData && columns ? (
					<DataGrid columns={columns} rows={cleanedData} className="border rounded" />
				) : (
					<div className="text-gray-500">No cleaned data to display.</div>
				)}
			</div>
			<button
				className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
				onClick={() => navigate("/upload")}
			>
				Back to Upload
			</button>
		</div>
	);
};

export default CleanedResult;
