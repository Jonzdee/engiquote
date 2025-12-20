import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

/**
 * Template.jsx
 *
 * - Presents a small gallery of templates (images & color vars).
 * - "Refrens" template (webp) is the default (free). Others are marked as premium.
 * - Choosing "Use Template" stores the template under localStorage key "quote_template".
 *
 * Notes:
 * - If your CreateQuotation reads "quote_template" on mount, it will pick up the selection.
 * - Premium templates are visually labeled; you can gate them in UI if you want to restrict access.
 */

const TEMPLATES = [
  {
    id: "refrens-default",
    name: "Refrens (Default)",
    description: "Clean and modern price quote — default template (free).",
    image:
      "https://assets.refrens.com/344_sample_quote_template_word_423325ac3c.webp",
    vars: {
      "--primary": "#0b1724",
      "--accent": "#0ea5a4",
      "--muted": "#475569",
      "--bg-card": "#ffffff",
      "--totals-bg": "#f1fdfa",
    },
    layout: "vertex",
    premium: false,
    default: true,
  },

  {
    id: "cleaning-quote",
    name: "Cleaning Quote",
    description: "Practical cleaning quotation layout — premium.",
    image:
      "https://officetemplatesonline.com/wp-content/uploads/2019/07/cleaning-quotation-template.png",
    vars: {
      "--primary": "#0b1724",
      "--accent": "#2563eb",
      "--muted": "#475569",
      "--bg-card": "#ffffff",
      "--totals-bg": "#eef2ff",
    },
    layout: "modern",
    premium: true,
  },

  {
    id: "detailed-sales",
    name: "Detailed Sales",
    description: "Detailed sales quotation with sections — premium.",
    image:
      "https://www.freemicrosofttemplates.com/wp-content/uploads/2024/07/Detailed-Sales-Quotation-Template.gif",
    vars: {
      "--primary": "#0f172a",
      "--accent": "#b45309",
      "--muted": "#6b7280",
      "--bg-card": "#ffffff",
      "--totals-bg": "#fff7ed",
    },
    layout: "classic",
    premium: true,
  },
];

function TemplateCard({ t, onPreview, onApply }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-slate-800">
      <div className="relative h-40 bg-gray-50 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
        {t.image ? (
          <img
            src={t.image}
            alt={t.name}
            className="object-contain w-full h-full"
          />
        ) : (
          <div className="text-sm text-slate-500 p-4">{t.name}</div>
        )}

        {t.premium && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded">
            Premium
          </div>
        )}

        {t.default && (
          <div className="absolute top-2 right-2 bg-sky-600 text-white text-xs px-2 py-0.5 rounded">
            Default
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold text-sm">{t.name}</div>
            <div className="text-xs text-slate-500 mt-1">{t.description}</div>
          </div>

          <div className="text-sm text-slate-400">{t.layout}</div>
        </div>
      </div>

      <div className="p-3 border-t bg-gray-50 dark:bg-slate-900 flex items-center justify-between gap-2">
        <div className="text-sm text-slate-600">
          {t.premium ? "Premium template" : "Free"}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPreview(t)}
            className="px-3 py-1 border rounded text-sm hover:bg-slate-100"
            aria-label={`Preview ${t.name}`}
            title={`Preview ${t.name}`}
          >
            Preview
          </button>

          <button
            onClick={() => onApply(t)}
            className={`px-3 py-1 rounded text-sm ${
              t.premium
                ? "bg-yellow-600 text-white hover:bg-yellow-700"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
            aria-label={`Use ${t.name}`}
            title={`Use ${t.name}`}
          >
            {t.premium ? "Use (Premium)" : "Use Template"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Template() {
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const navigate = useNavigate();

  const handleApply = (template) => {
    try {
      localStorage.setItem("quote_template", JSON.stringify(template));
      toast.success(`${template.name} applied — opening Create Quotation`);
      navigate("/createquotation");
    } catch (e) {
      console.error(e);
      toast.error("Failed to apply template");
    }
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
  };

  const closePreview = () => setPreviewTemplate(null);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Choose a Quotation Template</h1>
      <p className="text-sm text-slate-500 mb-6">
        Pick a layout and color theme for your quotation. The default template
        (Refrens) is free. Premium templates are labeled.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((t) => (
          <TemplateCard
            key={t.id}
            t={t}
            onPreview={handlePreview}
            onApply={handleApply}
          />
        ))}
      </div>

      {/* Preview modal */}
      {previewTemplate && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${previewTemplate.name} preview`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closePreview}
            aria-hidden="true"
          />
          <div className="relative max-w-3xl w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{previewTemplate.name}</h3>
                <div className="text-sm text-slate-500">
                  {previewTemplate.description}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 border rounded"
                  onClick={() => handleApply(previewTemplate)}
                >
                  Use Template
                </button>
                <button
                  className="px-3 py-1 rounded bg-gray-100"
                  onClick={closePreview}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-bold">
                    {previewTemplate.name}
                  </div>
                  <div className="text-sm mt-2 text-slate-500">
                    {previewTemplate.description}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-slate-500">Quote #</div>
                  <div className="font-bold text-indigo-700">
                    Q-20251201-001
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <img
                  src={previewTemplate.image}
                  alt={`${previewTemplate.name} preview`}
                  className="w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
