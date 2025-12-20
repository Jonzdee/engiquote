import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Download, Edit2, Trash2, Copy } from "lucide-react";

/**
 * History.jsx
 *
 * Improvements over the provided version:
 * - Robust localStorage parsing and fallback
 * - Search and sort controls
 * - View / Download PDF, Download JSON, Edit (loads into CreateQuotation), Duplicate, Delete
 * - Small logo preview (if saved in payload) for quick recognition
 * - Accessible buttons with titles/aria-labels
 * - Confirmation on destructive actions
 * - Keeps UI consistent with CreateQuotation (route "/createquotation")
 *
 * Notes:
 * - If your CreateQuotation route differs, change the `navigate("/createquotation")` call.
 * - This component expects saved entries in localStorage under key "quote_history".
 *   Each entry is expected to be an object with at least: id, quoteNumber, date, createdAt, payload, pdfDataUrl
 */

function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest"); // newest | oldest | quote-asc | quote-desc

  const loadHistory = useCallback(() => {
    const raw = localStorage.getItem("quote_history");
    if (!raw) {
      setHistory([]);
      return;
    }
    try {
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) throw new Error("history is not an array");
      setHistory(
        arr
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } catch (e) {
      console.error("Failed to parse quote_history:", e);
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // derived filtered + sorted list
  const filtered = history
    .filter((e) => {
      if (!query) return true;
      const q = query.trim().toLowerCase();
      const fields = [
        e.quoteNumber,
        e.date,
        e.payload?.company?.name,
        e.payload?.customer?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return fields.includes(q);
    })
    .slice()
    .sort((a, b) => {
      if (sort === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "quote-asc")
        return String(a.quoteNumber).localeCompare(String(b.quoteNumber));
      if (sort === "quote-desc")
        return String(b.quoteNumber).localeCompare(String(a.quoteNumber));
      return 0;
    });

  const viewPdf = (entry) => {
    if (!entry?.pdfDataUrl) {
      window.alert("No PDF available for this entry.");
      return;
    }
    window.open(entry.pdfDataUrl, "_blank", "noopener,noreferrer");
  };

  const downloadPdf = (entry) => {
    if (!entry?.pdfDataUrl) {
      window.alert("No PDF available for this entry.");
      return;
    }
    // pdfDataUrl should be a data URL (data:application/pdf;base64,...)
    const a = document.createElement("a");
    a.href = entry.pdfDataUrl;
    a.download = `${entry.quoteNumber || "quotation"}.pdf`;
    a.click();
  };

  const downloadJson = (entry) => {
    const payload = entry.payload ?? entry;
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entry.quoteNumber || "quotation"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const editTemplate = (entry) => {
    if (!entry?.payload) {
      window.alert("No editable payload available for this entry.");
      return;
    }
    // Store payload for CreateQuotation to pick up on mount
    localStorage.setItem("quote_edit", JSON.stringify(entry.payload));
    // Navigate to create page where CreateQuotation reads quote_edit
    navigate("/createquotation");
  };

  const duplicateEntry = (entry) => {
    try {
      const raw = localStorage.getItem("quote_history");
      const arr = raw ? JSON.parse(raw) : [];
      const clone = JSON.parse(JSON.stringify(entry));
      clone.id = `h_${Date.now()}`;
      // Optionally adjust quoteNumber to avoid collision
      clone.quoteNumber = `${clone.quoteNumber || "Q"}-copy-${String(
        Date.now()
      ).slice(-4)}`;
      clone.createdAt = new Date().toISOString();
      arr.unshift(clone);
      localStorage.setItem("quote_history", JSON.stringify(arr));
      loadHistory();
      window.alert("Template duplicated.");
    } catch (e) {
      console.error("Failed to duplicate entry", e);
      window.alert("Failed to duplicate entry.");
    }
  };

  const deleteEntry = (id) => {
    if (!confirm("Delete this saved template? This action cannot be undone."))
      return;
    try {
      const raw = localStorage.getItem("quote_history");
      const arr = raw ? JSON.parse(raw) : [];
      const filtered = arr.filter((x) => x.id !== id);
      localStorage.setItem("quote_history", JSON.stringify(filtered));
      loadHistory();
    } catch (e) {
      console.error("Failed to delete entry", e);
      window.alert("Failed to delete entry.");
    }
  };

  if (!history.length) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-bold mb-2">Quotation History</h2>
        <p className="text-slate-500 mb-4">
          No saved templates yet. Create and save a quotation from the
          CreateQuotation screen.
        </p>

        <div className="flex gap-2">
          <Button onClick={() => navigate("/createquotation")}>
            Create Quotation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold">Quotation History</h2>
          <div className="text-sm text-slate-500">
            Saved templates and exported PDFs
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Search by quote #, company or customer..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="px-3 py-2 border rounded w-64"
            aria-label="Search history"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-2 py-2 border rounded bg-white"
            aria-label="Sort history"
            title="Sort"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="quote-asc">Quote # ↑</option>
            <option value="quote-desc">Quote # ↓</option>
          </select>

          <Button onClick={loadHistory} title="Refresh history">
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((entry) => {
          const companyName =
            entry.payload?.company?.name || entry.payload?.company?.name || "";
          return (
            <article
              key={entry.id}
              className="p-4 border rounded bg-white dark:bg-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              aria-labelledby={`quote-${entry.id}`}
            >
              <div className="flex items-start gap-3">
                {/* small logo / preview */}
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                  {entry.payload?.company?.logoDataUrl ? (
                    <img
                      src={entry.payload.company.logoDataUrl}
                      alt={`${companyName} logo`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <rect width="24" height="24" rx="4" fill="#eef2ff" />
                      <path
                        d="M6 12h12"
                        stroke="#2c5282"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>

                <div>
                  <div
                    id={`quote-${entry.id}`}
                    className="text-sm text-slate-500"
                  >
                    Quote #
                  </div>
                  <div className="font-semibold">{entry.quoteNumber}</div>
                  <div className="text-sm text-slate-500">{entry.date}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Saved: {new Date(entry.createdAt).toLocaleString()}
                  </div>
                  {companyName && (
                    <div className="text-xs text-slate-500 mt-1">
                      Company: {companyName}
                    </div>
                  )}
                  {entry.payload?.customer?.name && (
                    <div className="text-xs text-slate-500">
                      Customer: {entry.payload.customer.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => viewPdf(entry)}
                  title="View PDF"
                  aria-label={`View ${entry.quoteNumber}`}
                >
                  <Eye size={16} /> <span className="sr-only">View</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => downloadPdf(entry)}
                  title="Download PDF"
                  aria-label={`Download ${entry.quoteNumber} PDF`}
                >
                  <Download size={16} />{" "}
                  <span className="sr-only">Download PDF</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => downloadJson(entry)}
                  title="Download JSON"
                  aria-label={`Download ${entry.quoteNumber} JSON`}
                >
                  <Copy size={16} />{" "}
                  <span className="sr-only">Download JSON</span>
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => editTemplate(entry)}
                  title="Edit template"
                  aria-label={`Edit ${entry.quoteNumber}`}
                >
                  <Edit2 size={16} /> Edit
                </Button>

                <Button
                  variant="outline"
                  onClick={() => duplicateEntry(entry)}
                  title="Duplicate template"
                  aria-label={`Duplicate ${entry.quoteNumber}`}
                >
                  Duplicate
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => deleteEntry(entry.id)}
                  title="Delete template"
                  aria-label={`Delete ${entry.quoteNumber}`}
                >
                  <Trash2 size={16} /> Delete
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 text-sm text-slate-500">
        Tip: You can edit a saved template to adjust details and re-save or
        export again.
      </div>
    </div>
  );
}

export default History;
