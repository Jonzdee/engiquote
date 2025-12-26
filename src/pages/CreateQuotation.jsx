import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import jsPDF from "jspdf";
import { FileText, Save, Printer } from "lucide-react";
import { toast } from "react-toastify";
/**
 * CreateQuotation.ksx
 *
 * - Mobile responsive quotation editor (Tailwind classes assumed)
 * - Professional PDF generator (vector text using jsPDF)
 * - Logo upload with resizing, drag & drop, replace/remove
 * - Signature canvas (pointer events)
 * - Save to History stores payload + generated PDF data URL in localStorage
 *
 * Note: rename file to .jsx/.tsx in your project if needed. This file uses Tailwind utility classes in markup.
 */

const MAX_LOGO_SIZE = 5 * 1024 * 1024;
const MAX_LOGO_WIDTH = 800; // px

const currency = (v) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(v || 0));

export default function CreateQuotation() {
  const quoteRef = useRef(null);
  const sigCanvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  // Theme
  const [dark, setDark] = useState(false);

  // Template
  const [template, setTemplate] = useState(null);

  // Company
  const [company, setCompany] = useState({
    name: "Your Company Ltd",
    address: "12 Business Rd, Lagos, Nigeria",
    phone: "+234 800 000 0000",
    email: "hello@company.com",
    logoDataUrl: "",
  });

  // Customer
  const [customer, setCustomer] = useState({
    name: "",
    address: "",
    phone: "",
  });

  // Items
  const [items, setItems] = useState([
    { id: 1, description: "Service / Product", qty: 1, price: 5000 },
  ]);

  // Financials
  const [vatPercent, setVatPercent] = useState(7.5);
  const [shipping, setShipping] = useState(0);

  // Notes & metadata
  const [notes, setNotes] = useState("");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [saving, setSaving] = useState(false);
  // Read selected template (if any) and apply CSS variables / defaults
  useEffect(() => {
    try {
      const raw = localStorage.getItem("quote_template");
      if (!raw) return;
      const template = JSON.parse(raw);
      if (!template || !template.vars) return;
      // apply CSS variables to the quote card (so previews + exports use them)
      const quoteEl = quoteRef.current;
      if (quoteEl) {
        Object.entries(template.vars).forEach(([key, val]) => {
          quoteEl.style.setProperty(key, val);
        });
      }
      // optionally keep the template in state if you want to reference name/layout
      setTemplate(template); // requires: const [template, setTemplate] = useState(null);
    } catch (e) {
      console.warn("Failed to apply template:", e);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("quote_template");
      if (raw) {
        const tpl = JSON.parse(raw);
        setTemplate(tpl);
        const el = quoteRef.current;
        if (el && tpl.vars) {
          Object.entries(tpl.vars).forEach(([k, v]) =>
            el.style.setProperty(k, v)
          );
        }
        return;
      }

      // If no template saved, apply the Refrens default template automatically.
      // Define the default here so CreateQuotation doesn't depend on Template.jsx directly.
      const defaultTemplate = {
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
      };

      // apply default template and persist it so Template page shows the correct state
      localStorage.setItem("quote_template", JSON.stringify(defaultTemplate));
      setTemplate(defaultTemplate);
      const el = quoteRef.current;
      if (el && defaultTemplate.vars) {
        Object.entries(defaultTemplate.vars).forEach(([k, v]) =>
          el.style.setProperty(k, v)
        );
      }
    } catch (e) {
      console.warn("Failed to load or apply template:", e);
    }
  }, []); // run once on mount

  // Inject print CSS so only the quote prints as A4
  useEffect(() => {
    const css = `
      @page { size: A4; margin: 16mm; }
      @media print {
        body * { visibility: hidden !important; }
        .quote-printable, .quote-printable * { visibility: visible !important; }
        .quote-printable { position: absolute !important; left: 0; top: 0; width: 210mm; box-shadow: none !important; }
        html, body { background: white !important; }
      }
    `;
    const styleTag = document.createElement("style");
    styleTag.setAttribute("data-create-quotation-print", "true");
    styleTag.innerHTML = css;
    document.head.appendChild(styleTag);
    return () => styleTag.remove();
  }, []);

  // daily quote number
  useEffect(() => {
    if (quoteNumber) return;
    const today = new Date().toISOString().slice(0, 10);
    const key = `quote_counter_${today}`;
    const counter = Number(localStorage.getItem(key) || 0) + 1;
    localStorage.setItem(key, String(counter));
    const num = `Q-${today.replaceAll("-", "")}-${String(counter).padStart(
      3,
      "0"
    )}`;
    setQuoteNumber(num);
  }, [quoteNumber]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Items helpers
  const addItem = () =>
    setItems((s) => [
      ...s,
      { id: Date.now(), description: "", qty: 1, price: 0 },
    ]);
  const removeItem = (id) => setItems((s) => s.filter((x) => x.id !== id));
  const updateItem = (id, field, value) =>
    setItems((s) =>
      s.map((it) =>
        it.id === id
          ? {
              ...it,
              [field]:
                field === "qty" || field === "price"
                  ? value === ""
                    ? ""
                    : Number(value)
                  : value,
            }
          : it
      )
    );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + Number(it.qty || 0) * Number(it.price || 0),
        0
      ),
    [items]
  );
  const vatAmount = useMemo(
    () => (subtotal * Number(vatPercent || 0)) / 100,
    [subtotal, vatPercent]
  );
  const total = useMemo(
    () => subtotal + vatAmount + Number(shipping || 0),
    [subtotal, vatAmount, shipping]
  );

  // Logo upload utilities
  const resizeImageDataUrl = (dataUrl, maxWidth = MAX_LOGO_WIDTH) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width <= maxWidth) return resolve(dataUrl);
        const scale = maxWidth / img.width;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const outDataUrl = canvas.toDataURL("image/jpeg", 0.9);
        resolve(outDataUrl);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });

  const processLogoFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (png, jpg, svg, etc.)");
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      const ok = confirm(
        "The image is large. Try uploading a smaller file (max 5MB). Attempt to resize automatically?"
      );
      if (!ok) return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      let dataUrl = reader.result;
      const isRaster = file.type !== "image/svg+xml";
      if (isRaster) {
        try {
          dataUrl = await resizeImageDataUrl(dataUrl);
        } catch (err) {
          console.warn("Logo resize failed, using original", err);
        }
      }
      setCompany((c) => ({ ...c, logoDataUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    processLogoFile(file);
  };

  const handleLogoDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file) processLogoFile(file);
  };
  const handleLogoDragOver = (e) => {
    e.preventDefault();
  };

  const removeLogo = () => {
    setCompany((c) => ({ ...c, logoDataUrl: "" }));
  };

  // Signature canvas: adapt to responsive width & high DPI
  useEffect(() => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const cssWidth = Math.min(600, canvas.clientWidth || 600);
      const cssHeight = 120;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = dark ? "#fff" : "#000";
      ctx.fillStyle = dark ? "#0f172a" : "#ffffff";
      ctx.fillRect(0, 0, cssWidth, cssHeight);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [dark]);

  // Pointer-based drawing (desktop & touch)
  useEffect(() => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const getPos = (evt) => {
      const rect = canvas.getBoundingClientRect();
      const x = (evt.clientX ?? evt.touches?.[0]?.clientX) - rect.left;
      const y = (evt.clientY ?? evt.touches?.[0]?.clientY) - rect.top;
      return { x, y };
    };

    const down = (e) => {
      drawingRef.current = true;
      lastPoint.current = getPos(e);
    };
    const move = (e) => {
      if (!drawingRef.current) return;
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      lastPoint.current = p;
    };
    const up = () => (drawingRef.current = false);

    canvas.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    return () => {
      canvas.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Small helper to load image element from data URL
  const loadImage = (src) =>
    new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

  // Professional PDF generator (vector-based using jsPDF)
  const generateProfessionalPdfDataUrl = useCallback(async () => {
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    // colors and typography
    const textColor = "#111827";
    const mutedColor = "#6b7280";
    const accentColor = "#0f172a";

    // load images (logo + signature)
    const logoImg = await loadImage(company.logoDataUrl);
    const sigCanvas = sigCanvasRef.current;
    let sigDataUrl = null;
    if (sigCanvas) {
      try {
        sigDataUrl = sigCanvas.toDataURL("image/png");
      } catch (e) {
        sigDataUrl = null;
        e
      }
    }
    const sigImg = sigDataUrl ? await loadImage(sigDataUrl) : null;

    // Start positions
    let y = margin;

    // Header: logo + company info
    const logoMaxW = 40; // mm
    const logoPadRight = 6;
    let logoDrawW = 0;
    let logoDrawH = 0;
    if (logoImg) {
      const ratio = logoImg.width / (logoImg.height || 1);
      logoDrawW = Math.min(logoMaxW, contentWidth * 0.25);
      logoDrawH = logoDrawW / ratio;
      pdf.addImage(logoImg, "PNG", margin, y, logoDrawW, logoDrawH);
    }

    // Company text next to logo
    const companyX = margin + (logoDrawW ? logoDrawW + logoPadRight : 0);
    const companyW = contentWidth - (companyX - margin);
    pdf.setFontSize(12);
    pdf.setTextColor(textColor);
    pdf.setFont(undefined, "bold");
    pdf.text(company.name || "Your Company", companyX, y + 6, {
      maxWidth: companyW,
    });
    pdf.setFontSize(9);
    pdf.setFont(undefined, "normal");
    const companyInfo = `${company.address || ""}\n${company.phone || ""}${
      company.phone && company.email ? " • " : ""
    }${company.email || ""}`;
    const companyLines = companyInfo.split("\n").filter(Boolean);
    companyLines.forEach((line, i) => {
      pdf.setTextColor(mutedColor);
      pdf.text(line, companyX, y + 12 + i * 5, { maxWidth: companyW });
    });

    // Quote meta top-right
    const metaX = pageWidth - margin;
    pdf.setTextColor(mutedColor);
    pdf.setFontSize(9);
    pdf.text("Quotation", metaX, y + 6, { align: "right" });
    pdf.setFontSize(12);
    pdf.setTextColor(accentColor);
    pdf.setFont(undefined, "bold");
    pdf.text(quoteNumber || "-", metaX, y + 12, { align: "right" });
    pdf.setFontSize(9);
    pdf.setTextColor(mutedColor);
    pdf.setFont(undefined, "normal");
    pdf.text(`Date: ${date || ""}`, metaX, y + 18, { align: "right" });

    // Advance y below header
    const headerH = Math.max(logoDrawH || 0, 20);
    y += headerH + 8;

    // Prepared for (customer)
    pdf.setFontSize(10);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor(textColor);
    pdf.text("Prepared for", margin, y);
    pdf.setFont(undefined, "normal");
    const custLines = [
      customer.name || "",
      customer.address || "",
      customer.phone || "",
    ].filter(Boolean);
    custLines.forEach((line, i) => {
      pdf.setTextColor(mutedColor);
      pdf.text(line, margin, y + 6 + i * 5);
    });
    y += Math.max(12, custLines.length * 5) + 6;

    // Items table header
  
    const colDescW = contentWidth * 0.55;
    const colQtyW = contentWidth * 0.1;
    const colUnitW = contentWidth * 0.17;
    const colTotalW = contentWidth - (colDescW + colQtyW + colUnitW);

    const rowHeight = 7;
    // header background
    pdf.setFillColor(245, 247, 250);
    pdf.rect(margin, y - 4, contentWidth, rowHeight + 2, "F");
    pdf.setFontSize(10);
    pdf.setTextColor("#374151");
    pdf.setFont(undefined, "bold");
    pdf.text("Description", margin + 2, y + 3);
    pdf.text("Qty", margin + colDescW + 2, y + 3);
    pdf.text("Unit", margin + colDescW + colQtyW + 2, y + 3);
    pdf.text("Total", margin + colDescW + colQtyW + colUnitW + 2, y + 3, {
      align: "right",
    });
    y += rowHeight;

    // table rows
    pdf.setFont(undefined, "normal");
    pdf.setFontSize(10);
    let fillToggle = false;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];

      // page break if needed
      if (y + rowHeight > pageHeight - margin - 90) {
        pdf.addPage();
        y = margin;
        // redraw header on new page
        pdf.setFillColor(245, 247, 250);
        pdf.rect(margin, y - 4, contentWidth, rowHeight + 2, "F");
        pdf.setFontSize(10);
        pdf.setTextColor("#374151");
        pdf.setFont(undefined, "bold");
        pdf.text("Description", margin + 2, y + 3);
        pdf.text("Qty", margin + colDescW + 2, y + 3);
        pdf.text("Unit", margin + colDescW + colQtyW + 2, y + 3);
        pdf.text("Total", margin + colDescW + colQtyW + colUnitW + 2, y + 3, {
          align: "right",
        });
        y += rowHeight;
      }

      // alternating row fill
      if (fillToggle) {
        pdf.setFillColor(250, 250, 252);
        pdf.rect(margin, y - 2, contentWidth, rowHeight + 2, "F");
      }
      fillToggle = !fillToggle;

      pdf.setTextColor(textColor);
      const descX = margin + 2;
      const descMaxW = colDescW - 4;
      const lines = pdf.splitTextToSize(it.description || "-", descMaxW);
      pdf.text(lines, descX, y + 3);

      // Qty
      pdf.text(String(it.qty ?? ""), margin + colDescW + 2, y + 3, {
        align: "left",
      });

      // Unit price
      pdf.text(currency(it.price), margin + colDescW + colQtyW + 2, y + 3, {
        align: "left",
      });

      // Total
      const lineTotal = Number(it.qty || 0) * Number(it.price || 0);
      pdf.text(
        currency(lineTotal),
        margin + colDescW + colQtyW + colUnitW + colTotalW - 2,
        y + 3,
        {
          align: "right",
        }
      );

      const usedLines = Math.max(lines.length, 1);
      y += rowHeight * usedLines;
    }

    // Totals box
    const totalsBoxW = 80;
    const totalsBoxX = pageWidth - margin - totalsBoxW;
    const totalsBoxY = y + 8;
    pdf.setFillColor(249, 250, 251);
    pdf.roundedRect(totalsBoxX, totalsBoxY, totalsBoxW, 36, 2, 2, "F");
    pdf.setTextColor(mutedColor);
    pdf.setFontSize(10);
    pdf.text("Subtotal", totalsBoxX + 6, totalsBoxY + 9);
    pdf.text(currency(subtotal), totalsBoxX + totalsBoxW - 6, totalsBoxY + 9, {
      align: "right",
    });

    pdf.text(`VAT (${vatPercent}%)`, totalsBoxX + 6, totalsBoxY + 16);
    pdf.text(
      currency(vatAmount),
      totalsBoxX + totalsBoxW - 6,
      totalsBoxY + 16,
      { align: "right" }
    );

    pdf.text("Shipping", totalsBoxX + 6, totalsBoxY + 23);
    pdf.text(currency(shipping), totalsBoxX + totalsBoxW - 6, totalsBoxY + 23, {
      align: "right",
    });

    // Grand total (bold)
    pdf.setFont(undefined, "bold");
    pdf.setFontSize(12);
    pdf.text("Total", totalsBoxX + 6, totalsBoxY + 31);
    pdf.text(currency(total), totalsBoxX + totalsBoxW - 6, totalsBoxY + 31, {
      align: "right",
    });

    y = totalsBoxY + 40;

    // Notes
    pdf.setFont(undefined, "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(textColor);
    pdf.text("Notes", margin, y);
    const notesLines = pdf.splitTextToSize(
      notes ||
        "Thank you for the opportunity to quote. This quotation is valid for 30 days.",
      contentWidth - totalsBoxW - 10
    );
    pdf.setTextColor(mutedColor);
    pdf.text(notesLines, margin, y + 6);

    // Signature on the right if present
    if (sigImg) {
      const sigW = 50;
      const sigH = (sigImg.height / sigImg.width) * sigW;
      pdf.addImage(sigImg, "PNG", totalsBoxX, y + 6, sigW, sigH);
      pdf.setTextColor(mutedColor);
      pdf.setFontSize(9);
      pdf.text("Authorized signature", totalsBoxX, y + 6 + sigH + 4);
    }

    // Footer (terms)
    const footerText =
      "Prices exclude any applicable taxes unless stated. Payment terms: 50% deposit, balance on delivery.";
    pdf.setFontSize(8);
    pdf.setTextColor(mutedColor);
    pdf.text(footerText, margin, pageHeight - margin - 6);

    // Output to data URL (PDF)
    const blob = pdf.output("blob");
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    return dataUrl;
  }, [
    company,
    customer,
    items,
    quoteNumber,
    date,
    vatPercent,
    shipping,
    notes,
    sigCanvasRef,
    subtotal,
    vatAmount,
    total,
  ]);

  // export PDF using professional generator
  const exportPdf = async () => {
    try {
      await toast.promise(
        (async () => {
          const dataUrl = await generateProfessionalPdfDataUrl();
          if (!dataUrl) throw new Error("PDF generation failed");
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = `${quoteNumber || "quotation"}.pdf`;
          a.click();
        })(),
        {
          pending: "Preparing PDF…",
          success: "PDF ready ✅",
          error: "Failed to generate PDF",
        },
        { autoClose: 3000 }
      );
    } catch (err) {
      console.error(err);
    }
  };

  // save to history (stores payload + pdf data URL) with toast feedback
  const saveToHistory = async () => {
    setSaving(true);
    try {
      await toast.promise(
        (async () => {
          const pdfDataUrl = await generateProfessionalPdfDataUrl();
          if (!pdfDataUrl) throw new Error("PDF generation failed");
          const payload = {
            company,
            customer,
            items,
            vatPercent,
            shipping,
            notes,
            quoteNumber,
            date,
          };
          const entry = {
            id: `h_${Date.now()}`,
            quoteNumber,
            date,
            createdAt: new Date().toISOString(),
            payload,
            pdfDataUrl,
          };
          const raw = localStorage.getItem("quote_history");
          const arr = raw ? JSON.parse(raw) : [];
          arr.unshift(entry);
          localStorage.setItem("quote_history", JSON.stringify(arr));
        })(),
        {
          pending: "Saving template…",
          success: "Saved to History ✅",
          error: "Failed to save template",
        },
        { autoClose: 3000 }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Actions bar buttons (with icons)
  const ActionsBar = (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={exportPdf}
        title="Export quotation as PDF"
        className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 whitespace-nowrap"
      >
        <FileText size={16} aria-hidden="true" />
        <span>Export PDF</span>
      </button>

      <button
        type="button"
        onClick={saveToHistory}
        disabled={saving}
        aria-busy={saving}
        title="Save quotation to History"
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md shadow-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-400
        ${
          saving
            ? "bg-gray-200 text-gray-600 cursor-not-allowed"
            : "bg-white border border-slate-200 text-slate-800 hover:bg-slate-50"
        }`}
      >
        {saving ? (
          <svg
            className="w-4 h-4 animate-spin text-slate-700"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              opacity="0.25"
            ></circle>
            <path
              d="M22 12a10 10 0 00-10-10"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            ></path>
          </svg>
        ) : (
          <Save size={16} aria-hidden="true" />
        )}
        <span>{saving ? "Saving..." : "Save"}</span>
      </button>

      <button
        type="button"
        onClick={() => window.print()}
        title="Print only the quotation (A4)"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md shadow-sm whitespace-nowrap bg-amber-400 text-slate-900 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
      >
        <Printer size={16} aria-hidden="true" />
        <span>Print (A4)</span>
      </button>
    </div>
  );

  return (
    <div
      className={`p-4 sm:p-6 ${
        dark ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900"
      } min-h-screen`}
    >
      {/* Actions */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex-1">{ActionsBar}</div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={dark}
              onChange={(e) => setDark(e.target.checked)}
              className="cursor-pointer"
            />
            Dark
          </label>
        </div>
      </div>

      {/* Main editable quotation card (printable area) */}
      <div className="max-w-5xl mx-auto">
        <div
          ref={quoteRef}
          className="quote-printable bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-sm"
        >
          {/* Header: company + meta */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="w-20 h-20 sm:w-28 sm:h-28 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden flex items-center justify-center relative"
                onDrop={handleLogoDrop}
                onDragOver={handleLogoDragOver}
                aria-label="Company logo upload dropzone"
                title="Click to upload or drag & drop an image"
              >
                <label
                  htmlFor="companyLogoInput"
                  className="absolute inset-0 cursor-pointer flex items-center justify-center"
                >
                  {company.logoDataUrl ? (
                    <img
                      src={company.logoDataUrl}
                      alt="logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-sm text-slate-500">Logo</div>
                  )}
                </label>

                {/* hidden file input */}
                <input
                  id="companyLogoInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  aria-hidden="true"
                />

                {/* remove / replace controls (show when a logo exists) */}
                {company.logoDataUrl && (
                  <div className="absolute bottom-1 right-1 flex gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("companyLogoInput")?.click()
                      }
                      className="bg-white/90 text-xs px-2 py-1 rounded shadow-sm"
                      aria-label="Replace logo"
                      title="Replace logo"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded shadow-sm"
                      aria-label="Remove logo"
                      title="Remove logo"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <input
                  className="w-full bg-transparent outline-none text-lg font-semibold"
                  value={company.name}
                  onChange={(e) =>
                    setCompany((c) => ({ ...c, name: e.target.value }))
                  }
                  placeholder="Company name"
                />
                <input
                  className="w-full bg-transparent outline-none text-sm text-slate-500 mt-1"
                  value={company.address}
                  onChange={(e) =>
                    setCompany((c) => ({ ...c, address: e.target.value }))
                  }
                  placeholder="Company address"
                />
                <div className="flex gap-2 mt-2 text-sm">
                  <input
                    className="bg-transparent outline-none text-sm text-slate-500"
                    value={company.phone}
                    onChange={(e) =>
                      setCompany((c) => ({ ...c, phone: e.target.value }))
                    }
                    placeholder="Phone"
                  />
                  <input
                    className="bg-transparent outline-none text-sm text-slate-500"
                    value={company.email}
                    onChange={(e) =>
                      setCompany((c) => ({ ...c, email: e.target.value }))
                    }
                    placeholder="Email"
                  />
                </div>
              </div>
            </div>

            <div className="text-right min-w-[160px]">
              <div className="text-sm text-slate-500">Quote #</div>
              <div className="font-bold text-lg">{quoteNumber}</div>
              <div className="text-sm text-slate-500 mt-2">Date</div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full bg-transparent outline-none text-sm"
              />
              <div className="mt-3 text-left md:text-right">
                <div className="text-sm text-slate-500">Prepared for</div>
                <input
                  className="w-full md:w-auto bg-transparent outline-none font-medium"
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer((c) => ({ ...c, name: e.target.value }))
                  }
                  placeholder="Customer name"
                />
                <div className="text-xs text-slate-500">{customer.address}</div>
              </div>
            </div>
          </div>

          <hr className="my-4 border-slate-100 dark:border-slate-700" />

          {/* Customer fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
            <input
              className="p-2 border rounded"
              placeholder="Customer Name"
              value={customer.name}
              onChange={(e) =>
                setCustomer((c) => ({ ...c, name: e.target.value }))
              }
            />
            <input
              className="p-2 border rounded"
              placeholder="Customer Address"
              value={customer.address}
              onChange={(e) =>
                setCustomer((c) => ({ ...c, address: e.target.value }))
              }
            />
            <input
              className="p-2 border rounded"
              placeholder="Customer Phone"
              value={customer.phone}
              onChange={(e) =>
                setCustomer((c) => ({ ...c, phone: e.target.value }))
              }
            />
          </div>

          {/* Items */}
          <div className="mb-4">
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="py-2">Description</th>
                    <th className="py-2 w-24 text-right">Qty</th>
                    <th className="py-2 w-40 text-right">Unit</th>
                    <th className="py-2 w-40 text-right">Total</th>
                    <th className="py-2 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="py-2">
                        <input
                          className="w-full bg-transparent outline-none"
                          value={it.description}
                          onChange={(e) =>
                            updateItem(it.id, "description", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-2 text-right">
                        <input
                          type="number"
                          className="w-16 text-right bg-transparent outline-none"
                          value={it.qty}
                          onChange={(e) =>
                            updateItem(it.id, "qty", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-2 text-right">
                        <input
                          type="number"
                          className="w-28 text-right bg-transparent outline-none"
                          value={it.price}
                          onChange={(e) =>
                            updateItem(it.id, "price", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-2 text-right font-semibold">
                        {currency(Number(it.qty || 0) * Number(it.price || 0))}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          className="text-red-600"
                          onClick={() => removeItem(it.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="p-3 border rounded bg-white dark:bg-slate-800"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-slate-500">
                        Description
                      </label>
                      <input
                        className="w-full bg-transparent outline-none"
                        value={it.description}
                        onChange={(e) =>
                          updateItem(it.id, "description", e.target.value)
                        }
                      />
                    </div>
                    <div className="w-20">
                      <label className="text-xs text-slate-500">Qty</label>
                      <input
                        type="number"
                        className="w-full bg-transparent outline-none text-right"
                        value={it.qty}
                        onChange={(e) =>
                          updateItem(it.id, "qty", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1">
                      <label className="text-xs text-slate-500">Price</label>
                      <input
                        type="number"
                        className="w-full bg-transparent outline-none"
                        value={it.price}
                        onChange={(e) =>
                          updateItem(it.id, "price", e.target.value)
                        }
                      />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Total</div>
                      <div className="font-semibold">
                        {currency(Number(it.qty || 0) * Number(it.price || 0))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-2">
                    <button
                      className="text-red-600"
                      onClick={() => removeItem(it.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <button
                className="px-3 py-2 rounded bg-black text-white"
                onClick={addItem}
              >
                + Add item
              </button>
            </div>
          </div>

          {/* Totals */}
          <div className="md:flex md:justify-end">
            <div className="w-full md:w-80 p-4 border rounded bg-slate-50 dark:bg-slate-900">
              <div className="flex justify-between text-sm text-slate-500 mb-2">
                <span>Subtotal</span>
                <span>{currency(subtotal)}</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm">VAT (%)</label>
                <input
                  type="number"
                  className="w-20 p-1 border rounded"
                  value={vatPercent}
                  onChange={(e) => setVatPercent(Number(e.target.value || 0))}
                />
              </div>

              <div className="flex justify-between text-sm text-slate-500 mb-2">
                <span>VAT Amount</span>
                <span>{currency(vatAmount)}</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm">Shipping</label>
                <input
                  type="number"
                  className="w-24 p-1 border rounded"
                  value={shipping}
                  onChange={(e) => setShipping(Number(e.target.value || 0))}
                />
              </div>

              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{currency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="my-4 border-slate-100 dark:border-slate-700" />

          {/* Notes & Signature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold">Notes</label>
              <textarea
                className="w-full mt-2 p-2 border rounded min-h-[140px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold">Signature</label>
              <div className="border rounded p-2 bg-white dark:bg-slate-800">
                <canvas ref={sigCanvasRef} className="w-full h-32 block" />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={clearSignature}
                    className="px-3 py-1 rounded bg-red-500 text-white"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-slate-500">
            <strong>Terms:</strong> Prices exclude taxes unless stated. Payment
            terms: 50% deposit, balance on delivery. Quotation valid for 30
            days.
          </div>
        </div>
      </div>

      {/* Mobile fixed summary bar */}
      <div className="fixed left-0 right-0 bottom-0 md:hidden bg-white dark:bg-slate-800 border-t p-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">Total</div>
            <div className="font-bold">{currency(total)}</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportPdf}
              className="px-3 py-2 rounded bg-indigo-600 text-white"
            >
              Export PDF
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded bg-white border"
            >
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
