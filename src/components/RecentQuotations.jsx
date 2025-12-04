import React from "react";

export default function RecentQuotations({ quotations }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Recent Quotations</h2>

      {quotations.length === 0 ? (
        <p className="text-gray-500">No quotations yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                <th className="px-4 py-2 text-gray-600">Client</th>
                <th className="px-4 py-2 text-gray-600">Project</th>
                <th className="px-4 py-2 text-gray-600">Amount</th>
                <th className="px-4 py-2 text-gray-600">Status</th>
                <th className="px-4 py-2 text-gray-600">Date</th>
                <th className="px-4 py-2 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q, idx) => (
                <tr
                  key={idx}
                  className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-2">{q.client}</td>
                  <td className="px-4 py-2">{q.project}</td>
                  <td className="px-4 py-2">${q.amount}</td>
                  <td className="px-4 py-2">{q.status}</td>
                  <td className="px-4 py-2">{q.date}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button className="text-blue-600 hover:underline">
                      View
                    </button>
                    <button className="text-green-600 hover:underline">
                      Edit
                    </button>
                    <button className="text-red-600 hover:underline">
                      Delete
                    </button>
                    <button className="text-gray-800 hover:underline">
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
