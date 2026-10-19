import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Building2,
  Plus,
  Receipt,
  PieChart,
  X,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";
import { useNotifications } from "../../services/notificationsContext";

interface OfficeExpense {
  id: string;
  vendor_name: string;
  category: string;
  invoice_no: string;
  invoice_date: string;
  base_amount: number;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
  status: "Paid" | "Pending";
}

const defaultExpenses: OfficeExpense[] = [
  {
    id: "OE-1",
    vendor_name: "WeWork Cyber City",
    category: "Office Rent",
    invoice_no: "WW-2026-10-892",
    invoice_date: "2026-10-01",
    base_amount: 450000,
    gst_rate: 18,
    gst_amount: 81000,
    total_amount: 531000,
    status: "Paid",
  },
  {
    id: "OE-2",
    vendor_name: "Airtel Business Enterprise",
    category: "Internet & Telecom",
    invoice_no: "AB-TEL-9981",
    invoice_date: "2026-10-04",
    base_amount: 32000,
    gst_rate: 18,
    gst_amount: 5760,
    total_amount: 37760,
    status: "Paid",
  },
  {
    id: "OE-3",
    vendor_name: "Dell Technologies India",
    category: "Hardware & IT",
    invoice_no: "DEL-IN-2026-44",
    invoice_date: "2026-10-11",
    base_amount: 280000,
    gst_rate: 18,
    gst_amount: 50400,
    total_amount: 330400,
    status: "Pending",
  },
  {
    id: "OE-4",
    vendor_name: "Amazon Business Supplies",
    category: "Office Supplies",
    invoice_no: "AMZ-SUP-112",
    invoice_date: "2026-10-13",
    base_amount: 14500,
    gst_rate: 12,
    gst_amount: 1740,
    total_amount: 16240,
    status: "Pending",
  },
];

const categories = [
  "Office Rent",
  "Internet & Telecom",
  "Hardware & IT",
  "Office Supplies",
  "Electricity & Utilities",
  "Legal & Professional",
];

const gstRates = [0, 5, 12, 18, 28];

export const OfficeExpensePage: React.FC = () => {
  const [expenses, setExpenses] = useState<OfficeExpense[]>(defaultExpenses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const { addNotification } = useNotifications();

  // Form State
  const [vendorName, setVendorName] = useState("");
  const [category, setCategory] = useState("Office Supplies");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [baseAmount, setBaseAmount] = useState("");
  const [gstRate, setGstRate] = useState(18);
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Pending">("Pending");

  const numBase = parseFloat(baseAmount) || 0;
  const computedGst = Math.round((numBase * gstRate) / 100);
  const computedTotal = numBase + computedGst;

  const fetchExpenses = async () => {
    try {
      const res = await axios.get("/api/office-expenses");
      if (res.data && Array.isArray(res.data)) {
        setExpenses(res.data);
      }
    } catch {
      // Local fallback
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim() || !invoiceNo.trim() || numBase <= 0) {
      alert("Please enter valid vendor, invoice number and base amount.");
      return;
    }

    const payload = {
      vendor_name: vendorName.trim(),
      category,
      invoice_no: invoiceNo.trim(),
      invoice_date: invoiceDate,
      base_amount: numBase,
      gst_rate: gstRate,
      status: paymentStatus,
    };

    try {
      const res = await axios.post("/api/office-expenses", payload);
      if (res.data) {
        setExpenses((prev) => [res.data, ...prev]);
      }
    } catch {
      const newExp: OfficeExpense = {
        id: `OE-${Math.floor(100 + Math.random() * 900)}`,
        vendor_name: vendorName.trim(),
        category,
        invoice_no: invoiceNo.trim(),
        invoice_date: invoiceDate,
        base_amount: numBase,
        gst_rate: gstRate,
        gst_amount: computedGst,
        total_amount: computedTotal,
        status: paymentStatus,
      };
      setExpenses((prev) => [newExp, ...prev]);
    }

    addNotification({
      title: "Vendor Invoice Logged",
      message: `Invoice ${invoiceNo} for ?${computedTotal.toLocaleString("en-IN")} from ${vendorName} recorded.`,
      category: "expense",
      actionUrl: "/payroll/office-expense",
    });

    setIsModalOpen(false);
    setVendorName("");
    setInvoiceNo("");
    setBaseAmount("");
  };

  const totalSpend = expenses.reduce((sum, e) => sum + e.total_amount, 0);
  const totalBaseSpend = expenses.reduce((sum, e) => sum + e.base_amount, 0);
  const totalGstCredit = expenses.reduce((sum, e) => sum + e.gst_amount, 0);
  const pendingAmount = expenses
    .filter((e) => e.status === "Pending")
    .reduce((sum, e) => sum + e.total_amount, 0);

  // Category Breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.total_amount;
  });

  const filtered = expenses.filter((e) => {
    const matchesCat = selectedCategory === "All" ? true : e.category === selectedCategory;
    const matchesSearch =
      e.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
      e.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora text-2xl font-semibold text-txt">
            Office Expenses & Vendor GST Tracker
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            Track organizational expenditures on rent, utilities, IT equipment, and supplies. GST input tax credit is computed automatically.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand hover:bg-brand/90 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record Vendor Invoice</span>
        </button>
      </div>

      {/* KPI Stats (EXP-06 & PAY-15 Dashboard) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-brand-soft text-brand">
              <Building2 className="w-4 h-4" />
            </span>
            <span>Total Spend (Gross)</span>
          </div>
          <div className="font-sora text-2xl font-bold text-txt mt-2">
            ?{totalSpend.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-txt-faint mt-1">Base + All applicable GST</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-blue-50 text-brand-cyan dark:bg-blue-950/40 dark:text-cyan-400">
              <Receipt className="w-4 h-4" />
            </span>
            <span>Total Base Cost</span>
          </div>
          <div className="font-sora text-2xl font-bold text-txt mt-2">
            ?{totalBaseSpend.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-txt-faint mt-1">Net organizational expense</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span>GST Input Tax Credit</span>
          </div>
          <div className="font-sora text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            ?{totalGstCredit.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-txt-faint mt-1">Claimable on monthly GSTR-3B</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
            <span>Pending Invoices</span>
          </div>
          <div className="font-sora text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            ?{pendingAmount.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-txt-faint mt-1">Due for vendor payout</div>
        </div>
      </div>

      {/* Category Spend Distribution Cards (PAY-15) */}
      <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
        <h3 className="font-sora font-semibold text-xs text-txt mb-3 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-brand" />
          <span>Spend by Category Breakdown (PAY-15)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {Object.entries(categoryTotals).map(([cat, amount]) => {
            const pct = Math.round((amount / (totalSpend || 1)) * 100);
            return (
              <div key={cat} className="p-3 rounded-xl bg-surface-secondary border border-line/60">
                <div className="text-txt-faint text-[11px] truncate">{cat}</div>
                <div className="font-sora font-bold text-txt mt-1">
                  ?{amount.toLocaleString("en-IN")}
                </div>
                <div className="w-full bg-line rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="bg-brand h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-[10px] text-txt-faint mt-1 text-right">{pct}% of total</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-brand text-white font-semibold"
                  : "text-txt-muted hover:text-txt hover:bg-surface-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-txt-faint absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search vendor, invoice #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface border border-line text-xs text-txt outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-line rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-secondary text-txt-muted border-b border-line font-medium">
              <tr>
                <th className="p-3.5 pl-5">Invoice ID</th>
                <th className="p-3.5">Vendor Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Base (?)</th>
                <th className="p-3.5">GST Rate</th>
                <th className="p-3.5">GST (?)</th>
                <th className="p-3.5">Total Amount (?)</th>
                <th className="p-3.5 pr-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-txt-faint">
                    No vendor invoices match this search.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-secondary/50 transition-colors">
                    <td className="p-3.5 pl-5 font-semibold text-txt">{item.id}</td>
                    <td className="p-3.5 font-medium text-txt">{item.vendor_name}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-surface-secondary border border-line text-txt-muted">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-txt-muted">{item.invoice_no}</td>
                    <td className="p-3.5 text-txt-faint">{item.invoice_date}</td>
                    <td className="p-3.5 font-sora font-medium text-txt">
                      ?{item.base_amount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5 text-txt-muted font-medium">{item.gst_rate}%</td>
                    <td className="p-3.5 font-sora text-emerald-600 dark:text-emerald-400 font-medium">
                      +?{item.gst_amount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5 font-sora font-semibold text-txt">
                      ?{item.total_amount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5 pr-5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.status === "Paid"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-lg bg-surface border border-line rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-line flex items-center justify-between bg-surface-secondary/40">
              <div>
                <h3 className="font-sora font-semibold text-sm text-txt">
                  Record Vendor Office Expense
                </h3>
                <p className="text-xs text-txt-muted mt-0.5">
                  GST input credit will be computed and mapped to statutory tax registers.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-txt-faint hover:text-txt rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-txt font-medium mb-1">Vendor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. WeWork, Airtel, Dell"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-txt font-medium mb-1">Expense Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-txt font-medium mb-1">Invoice Number</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-908"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-txt font-medium mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-txt font-medium mb-1">Base Amount (?)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 50000"
                    value={baseAmount}
                    onChange={(e) => setBaseAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-txt font-medium mb-1">GST Slab Rate</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand font-semibold"
                  >
                    {gstRates.map((r) => (
                      <option key={r} value={r}>
                        {r}% GST
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Automatic Calculation Preview Box */}
              <div className="p-3.5 rounded-xl bg-surface-secondary border border-line space-y-1.5">
                <div className="flex justify-between text-txt-muted text-[11px]">
                  <span>Base Amount:</span>
                  <span className="font-mono text-txt font-semibold">?{numBase.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-[11px]">
                  <span>Computed GST ({gstRate}%):</span>
                  <span className="font-mono font-semibold">+?{computedGst.toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-1.5 border-t border-line flex justify-between text-txt text-xs font-bold">
                  <span>Total Payable:</span>
                  <span className="font-mono text-brand text-sm">?{computedTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div>
                <label className="block text-txt font-medium mb-1">Payment Status</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={paymentStatus === "Pending"}
                      onChange={() => setPaymentStatus("Pending")}
                      className="text-brand focus:ring-0"
                    />
                    <span className="text-txt">Pending Payout</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={paymentStatus === "Paid"}
                      onChange={() => setPaymentStatus("Paid")}
                      className="text-brand focus:ring-0"
                    />
                    <span className="text-txt">Already Paid</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-line text-txt-muted hover:text-txt hover:bg-surface-secondary font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand/90 shadow-sm"
                >
                  Save Vendor Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeExpensePage;


