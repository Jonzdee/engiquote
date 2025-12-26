import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Download,
  Edit2,
  Trash2,
  Copy,
  RefreshCw,
  FileText,
} from "lucide-react";

/**
 * History.jsx — Mobile responsive
 *
 * - Controls stack on small screens (search full width + buttons wrap)
 * - Action buttons are icon-first on small screens, text shows from `sm`
 * - Action row horizontally scrollable on narrow widths so buttons remain tappable
 * - Cards are vertical on mobile, horizontal on `sm+`
 * - Improved truncation and tap target sizing for mobile
 */

function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest"); // newest | oldest | quote-asc | quote-desc
  const [loading, setLoading] = useState(false);

  const loadHistory = useCallback(() => {
    setLoading(true);
    const raw = localStorage.getItem("quote_history");
    if (!raw) {
      setHistory([]);
      setLoading(false);
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filtered = useMemo(() => {
    return history
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
  }, [history, query, sort]);

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
    localStorage.setItem("quote_edit", JSON.stringify(entry.payload));
    navigate("/createquotation");
  };

  const duplicateEntry = (entry) => {
    try {
      const raw = localStorage.getItem("quote_history");
      const arr = raw ? JSON.parse(raw) : [];
      const clone = JSON.parse(JSON.stringify(entry));
      clone.id = `h_${Date.now()}`;
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
      const filteredArr = arr.filter((x) => x.id !== id);
      localStorage.setItem("quote_history", JSON.stringify(filteredArr));
      loadHistory();
    } catch (e) {
      console.error("Failed to delete entry", e);
      window.alert("Failed to delete entry.");
    }
  };

  if (!history.length && !loading) {
    return (
      <div className="p-4 sm:p-6">
        <h2 className="text-lg font-bold mb-2">Quotation History</h2>
        <p className="text-sm text-slate-500 mb-4">
          No saved templates yet. Create and save a quotation from the Create
          screen.
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
    <div className="p-3 sm:p-6">
      {/* Responsive helper styles (kept local to this component) */}
      <style>{`
        /* Action row scroll on very small screens */
        .actions-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        /* hide text labels on xs, show from sm */
        .btn-label { display: none; }
        @media (min-width: 640px) {
          .btn-label { display: inline; }
        }
        /* limit card content width and handle truncation */
        .truncate-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        /* make action buttons a bit larger on mobile for tap targets */
        .action-btn { padding-left: 0.6rem; padding-right: 0.6rem; }
      `}</style>

      {/* Header + controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold">Quotation History</h2>
          <div className="text-sm text-slate-500">
            Saved templates and exported PDFs
          </div>
        </div>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="search"
            placeholder="Search quote #, company or customer..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="px-3 py-2 border rounded w-full sm:w-64"
            aria-label="Search history"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-2 py-2 border rounded bg-white w-full sm:w-auto"
            aria-label="Sort history"
            title="Sort"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="quote-asc">Quote # ↑</option>
            <option value="quote-desc">Quote # ↓</option>
          </select>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={loadHistory}
              title="Refresh history"
              className="flex-1 sm:flex-initial"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline ml-2">Refresh</span>
            </Button>

            <Button
              onClick={() => navigate("/createquotation")}
              className="flex-1 sm:flex-initial"
            >
              <FileText size={16} />
              <span className="hidden sm:inline ml-2">New</span>
            </Button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((entry) => {
          const companyName = entry.payload?.company?.name || "";
          return (
            <article
              key={entry.id}
              className="p-3 sm:p-4 border rounded bg-white dark:bg-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              aria-labelledby={`quote-${entry.id}`}
            >
              <div className="flex items-start gap-3 w-full sm:w-auto">
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

                <div className="min-w-0">
                  <div
                    id={`quote-${entry.id}`}
                    className="text-xs text-slate-500"
                  >
                    Quote #
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className="font-semibold truncate-ellipsis"
                      title={entry.quoteNumber}
                    >
                      {entry.quoteNumber}
                    </div>
                    <div className="text-xs text-slate-400">{entry.date}</div>
                  </div>

                  <div className="text-xs text-slate-400 mt-1">
                    Saved: {new Date(entry.createdAt).toLocaleString()}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                    {companyName && (
                      <div className="truncate-ellipsis" title={companyName}>
                        Company: {companyName}
                      </div>
                    )}
                    {entry.payload?.customer?.name && (
                      <div
                        className="truncate-ellipsis"
                        title={entry.payload.customer.name}
                      >
                        Customer: {entry.payload.customer.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions: horizontally scrollable on very small screens */}
              <div className="mt-2 sm:mt-0 flex items-center gap-2 w-full sm:w-auto">
                <div className="flex gap-1 actions-scroll py-1">
                  <Button
                    variant="ghost"
                    onClick={() => viewPdf(entry)}
                    title="View PDF"
                    aria-label={`View ${entry.quoteNumber}`}
                    className="action-btn"
                  >
                    <Eye size={16} />
                    <span className="btn-label ml-2">View</span>
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => downloadPdf(entry)}
                    title="Download PDF"
                    aria-label={`Download ${entry.quoteNumber} PDF`}
                    className="action-btn"
                  >
                    <Download size={16} />
                    <span className="btn-label ml-2">PDF</span>
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => downloadJson(entry)}
                    title="Download JSON"
                    aria-label={`Download ${entry.quoteNumber} JSON`}
                    className="action-btn"
                  >
                    <Copy size={16} />
                    <span className="btn-label ml-2">JSON</span>
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => editTemplate(entry)}
                    title="Edit template"
                    aria-label={`Edit ${entry.quoteNumber}`}
                    className="action-btn"
                  >
                    <Edit2 size={16} />
                    <span className="btn-label ml-2">Edit</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => duplicateEntry(entry)}
                    title="Duplicate template"
                    aria-label={`Duplicate ${entry.quoteNumber}`}
                    className="action-btn"
                  >
                    <Copy size={16} />
                    <span className="btn-label ml-2">Duplicate</span>
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => deleteEntry(entry.id)}
                    title="Delete template"
                    aria-label={`Delete ${entry.quoteNumber}`}
                    className="action-btn"
                  >
                    <Trash2 size={16} />
                    <span className="btn-label ml-2">Delete</span>
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-slate-500">
        Tip: You can edit a saved template to adjust details and re-save or
        export again.
      </div>
    </div>
  );
}

export default History;
