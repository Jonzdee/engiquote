import React from "react";

export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow flex flex-col items-start"
        >
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {stat.label}
          </span>
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
