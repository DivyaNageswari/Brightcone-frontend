import React, { useState, useEffect } from "react";
import axios from "axios";
import {

  Plus,
  Clock,
  CheckCircle2,
  DollarSign,

  FileText,
  Calendar,
  X,
  UploadCloud,
} from "lucide-react";
import { useNotifications } from "../../services/notificationsContext";

interface ExpenseClaim {
  id: string;
  employee_id: string;
  employee_name: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  receipt_url?: string;
  status: "Pending" | "Approved" | "Paid" | "Rejected";
  paid_at?: string;
  rejection_reason?: string;
  created_at: string;
}

const defaultClaims: ExpenseClaim[] = [
  {
    id: "E-101",
    employee_id: "EMP-001",
    employee_name: "Ananya Rao",
    category: "Travel",
    amount: 3450,
    date: "2026-10-12",
    description: "Client visit cab fare and regional rail",
    status: "Approved",
    created_at: "2026-10-12T09:30:00Z",
  },
  {
    id: "E-102",
    employee_id: "EMP-001",
    employee_name: "Ananya Rao",
    category: "Internet",
    amount: 1499,
    date: "2026-10-05",
    description: "Monthly broadband reimbursement - WFH",
    status: "Paid",
    paid_at: "2026-10-08T14:20:00Z",
    created_at: "2026-10-05T10:15:00Z",
  },
  {
    id: "E-103",
    employee_id: "EMP-001",
    employee_name: "Ananya Rao",
    category: "Meals",
    amount: 2150,
    date: "2026-10-14",
    description: "Team sprint completion lunch",
    status: "Pending",
    created_at: "2026-10-14T15:45:00Z",
  },
];

const categories = [
  "Travel",
  "Meals",
  "Internet",
  "Client entertainment",
  "Learning",
  "Office supplies",
  "Other",
];

export const ExpenseEmployeePage: React.FC = () => {
  const [claims, setClaims] = useState<ExpenseClaim[]>(defaultClaims);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>("All");
  const { addNotification } = useNotifications();

  // Form State
  const [category, setCategory] = useState("Travel");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");

  const fetchClaims = async () => {
    try {
      const res = await axios.get("/api/expenses");
      if (res.data && Array.isArray(res.data)) {
        setClaims(res.data);
      }
    } catch {
      // Keep local state fallback
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      alert("Please enter a valid expense amount greater than 0.");
      return;
    }

    const payload = {
      category,
      amount: numAmount,
      date,
      description,
      receipt_url: fileName ? `/uploads/${fileName}` : undefined,
    };

    try {
      const res = await axios.post("/api/expenses", payload);
      if (res.data) {
        setClaims((prev) => [res.data, ...prev]);
      }
    } catch {
      const newClaim: ExpenseClaim = {
        id: `E-${Math.floor(100 + Math.random() * 900)}`,
        employee_id: "EMP-001",
        employee_name: "Ananya Rao",
        category,
        amount: numAmount,
        date,
        description,
        status: "Pending",
        created_at: new Date().toISOString(),
      };
      setClaims((prev) => [newClaim, ...prev]);
    }

    addNotification({
      title: "Expense Claim Submitted",
      message: `Your claim of ?${numAmount.toLocaleString("en-IN")} for ${category} has been submitted for approval.`,
      category: "expense",
      actionUrl: "/payroll/expenses",
    });

    setIsModalOpen(false);
    setAmount("");
    setDescription("");
    setFileName("");
  };

  const totalClaimed = claims.reduce((sum, c) => sum + c.amount, 0);
  const totalReimbursed = claims
    .filter((c) => c.status === "Paid")
    .reduce((sum, c) => sum + c.amount, 0);
  const totalPending = claims
    .filter((c) => c.status === "Pending" || c.status === "Approved")
    .reduce((sum, c) => sum + c.amount, 0);

  const filteredClaims = claims.filter((c) =>
    filter === "All" ? true : c.status === filter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora text-2xl font-semibold text-txt">
            My Expense Claims
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            Claim business expenses and reimbursements. Approved claims are paid directly into your salary account.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand hover:bg-brand/90 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Claim Expense</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-brand-soft text-brand">
              <DollarSign className="w-4 h-4" />
            </span>
            <span>Total Claimed</span>
          </div>
          <div className="font-sora text-2xl font-bold text-txt mt-2">
            ?{totalClaimed.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-txt-faint mt-1">{claims.length} total claims recorded</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span>Reimbursed (Paid)</span>
          </div>
          <div className="font-sora text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            ?{totalReimbursed.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-txt-faint mt-1">Disbursed with monthly payroll</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
            <span>In Pipeline</span>
          </div>
          <div className="font-sora text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            ?{totalPending.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-txt-faint mt-1">Awaiting review or payment</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-line pb-2 text-xs">
        {["All", "Pending", "Approved", "Paid", "Rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === tab
                ? "bg-brand text-white font-semibold"
                : "text-txt-muted hover:text-txt hover:bg-surface-secondary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Claims Table */}
      <div className="bg-surface border border-line rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-secondary text-txt-muted border-b border-line font-medium">
              <tr>
                <th className="p-3.5 pl-5">Claim ID</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-txt-faint">
                    No expense claims found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-surface-secondary/50 transition-colors">
                    <td className="p-3.5 pl-5 font-semibold text-txt">
                      {claim.id}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-surface-secondary border border-line text-txt-muted font-medium">
                        {claim.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-txt-muted max-w-xs truncate" title={claim.description}>
                      {claim.description}
                    </td>
                    <td className="p-3.5 text-txt-faint flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {claim.date}
                    </td>
                    <td className="p-3.5 font-sora font-semibold text-txt">
                      ?{claim.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          claim.status === "Paid"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : claim.status === "Approved"
                            ? "bg-blue-50 text-brand dark:bg-blue-950/40 dark:text-blue-300"
                            : claim.status === "Rejected"
                            ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        {claim.status}
                      </span>
                    </td>
                    <td className="p-3.5 pr-5">
                      {claim.receipt_url ? (
                        <span className="text-brand hover:underline inline-flex items-center gap-1 cursor-pointer">
                          <FileText className="w-3.5 h-3.5" />
                          View
                        </span>
                      ) : (
                        <span className="text-txt-faint">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-lg bg-surface border border-line rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-line flex items-center justify-between bg-surface-secondary/40">
              <div>
                <h3 className="font-sora font-semibold text-sm text-txt">
                  Claim an Expense
                </h3>
                <p className="text-xs text-txt-muted mt-0.5">
                  Attach your bill or receipt when your manager requests it.
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
              <div>
                <label className="block text-txt font-medium mb-1">Category</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-txt font-medium mb-1">Amount (?)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-txt font-medium mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-txt font-medium mb-1">Description / Purpose</label>
                <textarea
                  rows={3}
                  placeholder="What was this expense for? (e.g. Client meeting cab, Broadband monthly invoice)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-txt font-medium mb-1">Receipt Attachment (Optional)</label>
                <div className="border-2 border-dashed border-line rounded-xl p-4 text-center hover:border-brand/50 transition-colors cursor-pointer bg-surface-secondary/30">
                  <UploadCloud className="w-6 h-6 text-txt-faint mx-auto mb-1" />
                  <p className="text-txt-muted text-xs">
                    {fileName ? fileName : "Click or drag & drop invoice PDF or image"}
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    id="receipt-file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  <label htmlFor="receipt-file" className="text-brand font-medium cursor-pointer underline text-[11px] mt-1 block">
                    Browse file
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
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseEmployeePage;

