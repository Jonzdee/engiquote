// QuickActions.jsx
import React from "react";

export default function QuickActions({ onCreate, onTemplates }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <button
        onClick={onCreate}
        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition"
      >
        + Create New Quotation
      </button>

      <button
        onClick={onTemplates}
        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition"
      >
        View Templates
      </button>
    </div>
  );
}
