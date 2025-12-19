// Improved and professional version of the provided code
// Cleaned structure, better organization, clearer naming, separated utilities

import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function CreateQuotation() {
  const quoteRef = useRef();
  const sigCanvasRef = useRef();

  // THEME
  const [dark, setDark] = useState(false);

  // COMPANY
  const [company, setCompany] = useState({
    name: "Your Company Ltd",
    address: "12 Business Rd, Lagos, Nigeria",
    phone: "+234 800 000 0000",
    email: "hello@company.com",
    logoDataUrl: "",
  });

  // CUSTOMER
  const [customer, setCustomer] = useState({
    name: "",
    address: "",
    phone: "",
  });

  // ITEMS
  const [items, setItems] = useState([
    { id: 1, description: "Service / Product", qty: 1, price: 5000 },
  ]);

  // FINANCIALS
  const [vatPercent, setVatPercent] = useState(7.5);
  const [shipping, setShipping] = useState(0);

  // NOTES
  const [notes, setNotes] = useState("");

  // QUOTE METADATA
  const [quoteNumber, setQuoteNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const key = `quote_counter_${today}`;
    const counter = Number(localStorage.getItem(key) || 0) + 1;
    localStorage.setItem(key, String(counter));
    const num = `Q-${today.replaceAll("-", "")}-${String(counter).padStart(
      3,
      "0"
    )}`;
    setQuoteNumber(num);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const addItem = () =>
    setItems([...items, { id: Date.now(), description: "", qty: 1, price: 0 }]);

  const removeItem = (id) => setItems(items.filter((x) => x.id !== id));

  const updateItem = (id, field, value) => {
    setItems(items.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
  };

  const subtotal = items.reduce(
    (s, i) => s + Number(i.qty) * Number(i.price || 0),
    0
  );
  const vatAmount = (subtotal * Number(vatPercent || 0)) / 100;
  const total = subtotal + vatAmount + Number(shipping || 0);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setCompany((c) => ({ ...c, logoDataUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const exportCSV = () => {
    const rows = [
      ["Description", "Qty", "Price", "Total"],
      ...items.map((i) => [i.description, i.qty, i.price, i.qty * i.price]),
      [],
      ["Subtotal", subtotal],
      ["VAT (%)", vatPercent, "VAT Amount", vatAmount],
      ["Shipping", shipping],
      ["Total", total],
    ];

    const csvContent = rows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${quoteNumber}.csv`;
    link.click();
  };

  const exportPDF = async () => {
    const canvas = await html2canvas(quoteRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.width;
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`${quoteNumber}.pdf`);
  };

  const downloadImage = async () => {
    const canvas = await html2canvas(quoteRef.current, { scale: 2 });
    const link = document.createElement("a");
    link.download = `${quoteNumber}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const saveLocalDraft = () => {
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
    localStorage.setItem(`quote_draft_${quoteNumber}`, JSON.stringify(payload));
    alert("Quote saved locally.");
  };

  const downloadJSON = () => {
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
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quoteNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div
      className={`p-6 ${
        dark ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="flex justify-between mb-4">
        <div className="flex gap-3 flex-wrap">
          <Button onClick={exportPDF}>Export PDF</Button>
          <Button onClick={downloadImage}>Image</Button>
          <Button onClick={exportCSV}>CSV</Button>
          <Button onClick={downloadJSON}>Download JSON</Button>
          <Button onClick={saveLocalDraft}>Save Draft</Button>
          <Button onClick={() => window.print()}>Print</Button>
        </div>

        <div className="flex items-center gap-2">
          <Label>Dark</Label>
          <input
            type="checkbox"
            checked={dark}
            onChange={(e) => setDark(e.target.checked)}
          />
        </div>
      </div>

      <Card
        ref={quoteRef}
        className={`p-6 ${dark ? "bg-slate-800" : "bg-white"}`}
      >
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-4 items-start">
            <div className="w-28 h-28 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center overflow-hidden">
              {company.logoDataUrl ? (
                <img
                  src={company.logoDataUrl}
                  alt="logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-sm text-slate-500">Logo</div>
              )}
            </div>

            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="mb-2"
              />
              <Input
                value={company.name}
                onChange={(e) =>
                  setCompany({ ...company, name: e.target.value })
                }
              />
              <Input
                className="mt-2"
                value={company.address}
                onChange={(e) =>
                  setCompany({ ...company, address: e.target.value })
                }
              />
              <div className="flex gap-2 mt-2">
                <Input
                  value={company.phone}
                  onChange={(e) =>
                    setCompany({ ...company, phone: e.target.value })
                  }
                />
                <Input
                  value={company.email}
                  onChange={(e) =>
                    setCompany({ ...company, email: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-slate-500">Quote #</div>
            <div className="font-bold text-lg">{quoteNumber}</div>
            <div className="text-sm text-slate-500 mt-2">Date</div>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Customer Name"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          />
          <Input
            placeholder="Customer Address"
            value={customer.address}
            onChange={(e) =>
              setCustomer({ ...customer, address: e.target.value })
            }
          />
          <Input
            placeholder="Customer Phone"
            value={customer.phone}
            onChange={(e) =>
              setCustomer({ ...customer, phone: e.target.value })
            }
          />
        </div>

        <Separator className="my-6" />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updateItem(item.id, "description", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.qty}
                    onChange={(e) => updateItem(item.id, "qty", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(item.id, "price", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell className="font-semibold">
                  ₦{item.qty * item.price}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-3">
          <Button onClick={addItem}>+ Add item</Button>
        </div>

        <Separator className="my-6" />

        <div className="flex md:justify-end">
          <div className="w-full md:w-80 p-4 border rounded bg-slate-50 dark:bg-slate-900">
            <div className="flex justify-between text-sm text-slate-500 mb-2">
              <span>Subtotal</span>
              <span>₦{subtotal}</span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Label className="text-sm">VAT (%)</Label>
              <Input
                type="number"
                value={vatPercent}
                onChange={(e) => setVatPercent(e.target.value)}
              />
            </div>

            <div className="flex justify-between text-sm text-slate-500 mb-2">
              <span>VAT Amount</span>
              <span>₦{vatAmount.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Label className="text-sm">Shipping</Label>
              <Input
                type="number"
                value={shipping}
                onChange={(e) => setShipping(e.target.value)}
              />
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>₦{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Notes</Label>
            <Textarea
              className="min-h-[140px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div>
            <Label>Signature</Label>
            <div className="border rounded p-2 bg-white dark:bg-slate-800">
              <canvas
                ref={sigCanvasRef}
                width={600}
                height={160}
                className="w-full h-40"
                style={{ background: dark ? "#0f172a" : "#fff" }}
              />
              <div className="flex gap-2 mt-2">
                <Button onClick={clearSignature} variant="destructive">
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
