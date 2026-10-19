import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  AlertTriangle,
  Lock,
  Plus,
  Download,
  Calendar,
  Users,
  CreditCard,
  Search,
  ShieldCheck,
  Building2,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  X,
  FileText,
  Clock,
  Sparkles,
  Info,
  Check,
} from "lucide-react";
import { useNotifications } from "../../services/notificationsContext";

interface PayrollRun {
  id: string;
  month: string;
  status: string;
  current_step: number;
  total_employees: number;
  total_gross: number;
  total_net: number;
  total_deductions: number;
  is_locked: boolean;
  is_supplementary: boolean;
  supplementary_notes?: string;
  disbursed_at?: string;
  created_at: string;
}

interface AttendanceSyncItem {
  employee_id: string;
  employee_name: string;
  department: string;
  total_days: number;
  days_worked: number;
  paid_leaves: number;
  lop_days: number;
  payable_days: number;
}

interface VarianceItem {
  employee_id: string;
  employee_name: string;
  department: string;
  previous_net: number;
  current_net: number;
  variance_amount: number;
  variance_pct: number;
  flagged: boolean;
  reason: string;
}

interface OneTimeInput {
  id: string;
  emp: string;
  type: string;
  amt: number;
  notes?: string;
}

export const PayrollAdminPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { addNotification } = useNotifications();

  // Active Tab: 'run' | 'register' | 'compliance' | 'history'
  const initialTab = searchParams.get("tab") || "run";
  const [activeTab, setActiveTab] = useState<string>(
    initialTab === "register" ? "register" : initialTab === "compliance" ? "compliance" : "run"
  );

  // Live State
  const [activeRun, setActiveRun] = useState<PayrollRun | null>(null);
  const [allRuns, setAllRuns] = useState<PayrollRun[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSyncItem[]>([]);
  const [variances, setVariances] = useState<VarianceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Stepper State
  const [currentStep, setCurrentStep] = useState<number>(3);

  // One time inputs (Step 2)
  const [inputs, setInputs] = useState<OneTimeInput[]>([
    { id: "IN-1", emp: "Karthik Reddy", type: "Performance Bonus", amt: 150000, notes: "Q3 Top Achiever" },
    { id: "IN-2", emp: "Arjun Nair", type: "Travel Reimbursement", amt: 48200, notes: "Client Visit Mumbai" },
    { id: "IN-3", emp: "Pooja Hegde", type: "Referral Bonus", amt: 35000, notes: "Backend Eng Hire" },
    { id: "IN-4", emp: "Sameer Joshi", type: "Notice Period Deduction", amt: -12500, notes: "Shortfall recovery" },
  ]);

  // Modals
  const [showAddInputModal, setShowAddInputModal] = useState(false);
  const [newInputEmp, setNewInputEmp] = useState("Ananya Rao");
  const [newInputType, setNewInputType] = useState("Bonus");
  const [newInputAmt, setNewInputAmt] = useState("");
  const [newInputNotes, setNewInputNotes] = useState("");

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [showSuppModal, setShowSuppModal] = useState(false);
  const [suppMonth, setSuppMonth] = useState("October 2026");
  const [suppNotes, setSuppNotes] = useState("");

  // Search filter in register
  const [regSearch, setRegSearch] = useState("");

  // Sign-off step 4
  const [financeApproved, setFinanceApproved] = useState(false);
  const [financeComments, setFinanceComments] = useState("All attendance deductions and incentive adjustments reconciled with ERP.");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [runsRes, activeRes, attRes, varRes] = await Promise.all([
        axios.get<PayrollRun[]>("/api/payroll/runs"),
        axios.get<PayrollRun>("/api/payroll/runs/active"),
        axios.get<AttendanceSyncItem[]>("/api/payroll/attendance-sync"),
        axios.get<VarianceItem[]>("/api/payroll/variances"),
      ]);

      setAllRuns(runsRes.data);
      if (activeRes.data) {
        setActiveRun(activeRes.data);
        setCurrentStep(activeRes.data.current_step);
      }
      setAttendance(attRes.data);
      setVariances(varRes.data);
    } catch (err) {
      console.error("Failed to load payroll admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const paySteps = [
    { title: "Sync attendance & leave", desc: "Biometric and leave balances reconciliation" },
    { title: "Add bonuses & deductions", desc: "One-time variable inputs and ad-hoc additions" },
    { title: "Review variances", desc: "Audit flags exceeding 10% net pay variance" },
    { title: "Approve payroll", desc: "Two-tier HR and Finance leadership sign-off" },
    { title: "Disburse & publish payslips", desc: "Generate payslips, disburse and lock month" },
  ];

  // Advance Stepper
  const handleAdvanceStep = async () => {
    if (!activeRun) return;
    if (activeRun.is_locked) {
      alert("This payroll run is locked. Create a supplementary run for modifications.");
      return;
    }

    if (currentStep < 5) {
      try {
        const nextStep = currentStep + 1;
        await axios.post(`/api/payroll/runs/${activeRun.id}/advance-step`);
        setCurrentStep(nextStep);
        setActiveRun({ ...activeRun, current_step: nextStep });
        addNotification(
          "Payroll Run Advanced",
          `Moved ${activeRun.month} to step ${nextStep}: ${paySteps[nextStep - 1].title}`,
          "info"
        );
      } catch (err) {
        console.error("Failed to advance step", err);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1 && !activeRun?.is_locked) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Publish and Lock
  const handlePublishAndLock = async () => {
    if (!activeRun) return;
    try {
      setPublishing(true);
      const res = await axios.post(`/api/payroll/runs/${activeRun.id}/publish-and-lock`);
      setActiveRun(res.data.run);
      setCurrentStep(5);
      setShowPublishModal(false);

      addNotification(
        "Payroll Disbursed & Month Locked",
        `${activeRun.month} payroll is officially locked. Payslips published to all employees.`,
        "success"
      );

      // Refresh runs list
      const runsRes = await axios.get<PayrollRun[]>("/api/payroll/runs");
      setAllRuns(runsRes.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to publish payroll.");
    } finally {
      setPublishing(false);
    }
  };

  // Create Supplementary Run
  const handleCreateSupplementary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suppNotes.trim()) {
      alert("Please provide the reason for the supplementary run.");
      return;
    }

    try {
      const res = await axios.post("/api/payroll/runs/create-supplementary", {
        month: suppMonth,
        notes: suppNotes,
      });

      addNotification(
        "Supplementary Run Created",
        `Created supplementary run for ${suppMonth}`,
        "info"
      );

      setAllRuns([res.data, ...allRuns]);
      setActiveRun(res.data);
      setCurrentStep(1);
      setShowSuppModal(false);
      setSuppNotes("");
      setActiveTab("run");
    } catch (err) {
      console.error("Failed to create supplementary run", err);
    }
  };

  // Add one time input
  const handleAddInput = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newInputAmt);
    if (isNaN(val)) return;

    const newItem: OneTimeInput = {
      id: `IN-${Date.now()}`,
      emp: newInputEmp,
      type: newInputType,
      amt: val,
      notes: newInputNotes,
    };

    setInputs([newItem, ...inputs]);
    setShowAddInputModal(false);
    setNewInputAmt("");
    setNewInputNotes("");
  };

  const handleRemoveInput = (id: string) => {
    setInputs(inputs.filter((i) => i.id !== id));
  };

  // Mock employee register items for Tab 2
  const registerItems = [
    { empId: "BC-1001", name: "Ananya Rao", dept: "People Ops", gross: 145000, pf: 1740, pt: 200, tds: 12500, net: 130560 },
    { empId: "BC-1002", name: "Rahul Varma", dept: "Engineering", gross: 195000, pf: 1800, pt: 200, tds: 21000, net: 172000 },
    { empId: "BC-1003", name: "Karthik Reddy", dept: "Engineering", gross: 240000, pf: 1800, pt: 200, tds: 32000, net: 206000 },
    { empId: "BC-1004", name: "Meera Joshi", dept: "Finance", gross: 160000, pf: 1800, pt: 200, tds: 16500, net: 141500 },
    { empId: "BC-1005", name: "Pooja Hegde", dept: "Design", gross: 135000, pf: 1620, pt: 200, tds: 10500, net: 122680 },
    { empId: "BC-1006", name: "Vikram Singh", dept: "Engineering", gross: 110000, pf: 1320, pt: 200, tds: 7500, net: 100980 },
    { empId: "BC-1007", name: "Divya Kulkarni", dept: "Marketing", gross: 125000, pf: 1500, pt: 200, tds: 9200, net: 114100 },
    { empId: "BC-1008", name: "Siddharth Sen", dept: "Sales", gross: 150000, pf: 1800, pt: 200, tds: 14000, net: 134000 },
  ];

  const filteredRegister = registerItems.filter(
    (item) =>
      item.name.toLowerCase().includes(regSearch.toLowerCase()) ||
      item.dept.toLowerCase().includes(regSearch.toLowerCase()) ||
      item.empId.toLowerCase().includes(regSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* Page Title & Navigation Tabs */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Payroll Management Suite
              </span>
              {activeRun?.is_locked && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked Month
                </span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Payroll Run Wizard
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-sans">
              Run monthly payroll, review the salary register and stay on top of statutory filings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSuppModal(true)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              New Supplementary Run
            </button>
            <button
              onClick={() => {
                addNotification("Bank File Export", "Generating NEFT/RTGS batch transfer file for bank portal...", "info");
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0B2641] hover:bg-[#07192c] rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export Bank File
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 mt-6 gap-6 overflow-x-auto">
          {[
            { id: "run", label: "Run Payroll (5-Step Wizard)" },
            { id: "register", label: "Salary Register" },
            { id: "compliance", label: "Statutory Compliance" },
            { id: "history", label: "History & Supplementary" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "border-[#0B6FDB] text-[#0B6FDB]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: RUN PAYROLL (5-STEP STATE MACHINE WIZARD)
          ========================================================================= */}
      {activeTab === "run" && (
        <div className="space-y-6">
          {/* Stepper Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900">
                  {activeRun ? activeRun.month : "October 2026"} Run
                </h3>
                <span className="text-xs text-slate-500 font-sans">
                  Target Disbursal Date: 31st of the month • Schedule: Monthly Regular
                </span>
              </div>
              <div className="flex items-center gap-2">
                {activeRun?.is_locked ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Month Locked & Published
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    Step {currentStep} of 5 in progress
                  </span>
                )}
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {paySteps.map((step, idx) => {
                  const stepNum = idx + 1;
                  const isDone = activeRun?.is_locked || stepNum < currentStep;
                  const isCur = !activeRun?.is_locked && stepNum === currentStep;

                  return (
                    <div
                      key={step.title}
                      onClick={() => !activeRun?.is_locked && setCurrentStep(stepNum)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isDone
                          ? "bg-emerald-50/50 border-emerald-200 text-slate-800"
                          : isCur
                          ? "bg-blue-50/80 border-[#0B6FDB] text-slate-900 shadow-xs ring-2 ring-blue-500/20"
                          : "bg-slate-50/70 border-slate-200 text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isDone
                              ? "bg-emerald-600 text-white"
                              : isCur
                              ? "bg-[#0B6FDB] text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5" /> : stepNum}
                        </span>
                        <span className="text-xs font-bold leading-tight line-clamp-1">{step.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stepper Action Bar */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {currentStep > 1 && !activeRun?.is_locked && (
                  <button
                    onClick={handlePreviousStep}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Previous Step
                  </button>
                )}
                <span className="text-xs text-slate-500">
                  {activeRun?.is_locked
                    ? "Locked run is view-only. Modifications require a supplementary payroll run."
                    : `Currently reviewing: Step ${currentStep} (${paySteps[currentStep - 1].title})`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {!activeRun?.is_locked && (
                  <>
                    {currentStep < 5 ? (
                      <button
                        onClick={handleAdvanceStep}
                        className="px-5 py-2.5 text-xs font-semibold text-white bg-[#0B6FDB] hover:bg-[#0958b0] rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        Complete Step {currentStep} & Proceed
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowPublishModal(true)}
                        className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        <Lock className="w-4 h-4" />
                        Disburse & Publish Payslips (Lock Month)
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Aggregate Stat Pills */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500">Eligible Employees</span>
              <div className="text-xl font-bold font-display text-slate-900 mt-1">
                {activeRun?.total_employees || 38}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">100% attendance synced</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500">Gross Payroll</span>
              <div className="text-xl font-bold font-display text-slate-900 mt-1">
                {formatINR(activeRun?.total_gross || 3420000)}
              </div>
              <span className="text-[11px] text-slate-500">Includes bonuses & allowances</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500">Total Deductions</span>
              <div className="text-xl font-bold font-display text-slate-900 mt-1">
                {formatINR(activeRun?.total_deductions || 406000)}
              </div>
              <span className="text-[11px] text-slate-500">PF, PT, TDS & shortfalls</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500">Net Disbursement</span>
              <div className="text-xl font-bold font-display text-emerald-600 mt-1">
                {formatINR(activeRun?.total_net || 3014000)}
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">To bank ledger</span>
            </div>
          </div>

          {/* Dynamic Step Content based on currentStep */}
          {/* STEP 1: ATTENDANCE & LEAVE SYNC */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-display text-slate-900">
                    Step 1: Attendance Ledger & Leave Deductions
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Reconciled with biometric punch cards, approved casual leaves and Loss of Pay (LOP) days.
                  </p>
                </div>
                <button
                  onClick={() => addNotification("Attendance Synced", "Biometric logs refreshed for October 2026.", "success")}
                  className="px-3 py-1.5 text-xs font-semibold text-[#0B6FDB] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  Sync Latest Biometrics
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Total Month Days</th>
                      <th className="py-3 px-4">Days Worked</th>
                      <th className="py-3 px-4">Paid Leaves</th>
                      <th className="py-3 px-4">LOP (Unpaid)</th>
                      <th className="py-3 px-4 font-bold text-slate-900">Payable Days</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {attendance.map((row) => (
                      <tr key={row.employee_id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{row.employee_name}</div>
                          <div className="text-[11px] text-slate-400">{row.employee_id}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{row.department}</td>
                        <td className="py-3 px-4 text-slate-600">{row.total_days}</td>
                        <td className="py-3 px-4 text-slate-600">{row.days_worked}</td>
                        <td className="py-3 px-4 text-emerald-600 font-medium">{row.paid_leaves}</td>
                        <td className="py-3 px-4">
                          {row.lop_days > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              {row.lop_days} days
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{row.payable_days}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 2: BONUSES & DEDUCTIONS */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-display text-slate-900">
                    Step 2: One-Time Bonuses, Reimbursements & Ad-Hoc Deductions
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Variable additions or loan deductions applied exclusively to this pay cycle.
                  </p>
                </div>
                {!activeRun?.is_locked && (
                  <button
                    onClick={() => setShowAddInputModal(true)}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-[#0B6FDB] hover:bg-[#0958b0] rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add One-Time Input
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Notes / Justification</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      {!activeRun?.is_locked && <th className="py-3 px-4 text-center">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {inputs.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-semibold text-slate-900">{item.emp}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              item.amt >= 0
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{item.notes || "—"}</td>
                        <td
                          className={`py-3 px-4 text-right font-bold tabular-nums ${
                            item.amt >= 0 ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {item.amt >= 0 ? `+${formatINR(item.amt)}` : `-${formatINR(Math.abs(item.amt))}`}
                        </td>
                        {!activeRun?.is_locked && (
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleRemoveInput(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW VARIANCES */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-display text-slate-900">
                    Step 3: Variance Analysis vs September 2026
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Automated flags for any compensation movement exceeding ±10% or unexpected LOP deductions.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  {variances.filter((v) => v.flagged).length} Flagged Deviations
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4 text-right">Previous Net (Sep)</th>
                      <th className="py-3 px-4 text-right">Current Net (Oct)</th>
                      <th className="py-3 px-4 text-right">Delta (₹)</th>
                      <th className="py-3 px-4 text-right">Delta (%)</th>
                      <th className="py-3 px-4">Flag & Audit Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {variances.map((v) => (
                      <tr
                        key={v.employee_id}
                        className={v.flagged ? "bg-amber-50/40 hover:bg-amber-50/60" : "hover:bg-slate-50/50"}
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{v.employee_name}</div>
                          <div className="text-[11px] text-slate-400">{v.employee_id}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{v.department}</td>
                        <td className="py-3 px-4 text-right tabular-nums text-slate-600">
                          {formatINR(v.previous_net)}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums font-bold text-slate-900">
                          {formatINR(v.current_net)}
                        </td>
                        <td
                          className={`py-3 px-4 text-right tabular-nums font-semibold ${
                            v.variance_amount >= 0 ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {v.variance_amount >= 0
                            ? `+${formatINR(v.variance_amount)}`
                            : `-${formatINR(Math.abs(v.variance_amount))}`}
                        </td>
                        <td
                          className={`py-3 px-4 text-right tabular-nums font-bold ${
                            Math.abs(v.variance_pct) > 10 ? "text-amber-700" : "text-slate-600"
                          }`}
                        >
                          {v.variance_pct > 0 ? `+${v.variance_pct}%` : `${v.variance_pct}%`}
                        </td>
                        <td className="py-3 px-4">
                          {v.flagged ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-800">
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              {v.reason}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">{v.reason}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 4: APPROVE PAYROLL */}
          {currentStep === 4 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900">
                  Step 4: Two-Tier Leadership Sign-off
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mandatory dual authorization required prior to bank transmission and employee slip generation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tier 1: HR Ops Lead */}
                <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Tier 1: HR Operations Sign-off
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    "Attendance ledger, loss of pay cuts, approved leaves and variable payouts verified with manager approvals."
                  </p>
                  <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold text-slate-900">Ananya Rao (Head of People)</span>
                    <span>Signed on Oct 28, 14:10</span>
                  </div>
                </div>

                {/* Tier 2: Finance Director */}
                <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                      Tier 2: Finance & Treasury Sign-off
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        financeApproved
                          ? "bg-emerald-600 text-white flex items-center gap-1"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {financeApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                      {financeApproved ? "Approved" : "Pending Sign-off"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Audit Notes / Bank Escrow Reference:</label>
                    <textarea
                      value={financeComments}
                      onChange={(e) => setFinanceComments(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0B6FDB] bg-white"
                      placeholder="Add reconciliation notes..."
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={financeApproved}
                        onChange={(e) => setFinanceApproved(e.target.checked)}
                        className="w-4 h-4 rounded-sm text-[#0B6FDB] focus:ring-[#0B6FDB]"
                      />
                      <span>Authorize net disbursal of {formatINR(activeRun?.total_net || 3014000)}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: DISBURSE & PUBLISH PAYSLIPS */}
          {currentStep === 5 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900">
                  Step 5: Final Disbursal & Month Lock
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish payslips to employee self-service portals and seal the accounting period.
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Disbursement Pre-flight Verification</h4>
                    <p className="text-slate-600 mt-1">
                      Both leadership sign-offs have been received. Bank transfer file is generated. Publishing will lock this cycle permanently to preserve audit compliance.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400">Headcount</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{activeRun?.total_employees || 38} Employees</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400">Net Transfer Amount</span>
                    <div className="font-bold text-emerald-600 text-sm mt-0.5">{formatINR(activeRun?.total_net || 3014000)}</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400">Statutory Remittance</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{formatINR(activeRun?.total_deductions || 406000)}</div>
                  </div>
                </div>
              </div>

              {!activeRun?.is_locked ? (
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowPublishModal(true)}
                    className="px-6 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    Publish Payslips & Lock Month Permanently
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-800">
                    This payroll month was published and locked on {activeRun.disbursed_at || "31 Oct 2026"}. Payslips are accessible to all employees.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: SALARY REGISTER
          ========================================================================= */}
      {activeTab === "register" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900">
                Salary Register, {activeRun ? activeRun.month : "October 2026"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">
                Full breakdown of earnings, statutory deductions, tax withholdings and net payout per employee.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search employee or dept..."
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0B6FDB] w-56"
                />
              </div>
              <button
                onClick={() => addNotification("Export", "Salary register exported to CSV.", "success")}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-right">Gross Pay</th>
                  <th className="py-3 px-4 text-right">EPF (12%)</th>
                  <th className="py-3 px-4 text-right">Prof Tax (PT)</th>
                  <th className="py-3 px-4 text-right">TDS / IT</th>
                  <th className="py-3 px-4 text-right font-bold text-slate-900">Net Pay</th>
                  <th className="py-3 px-4 text-center">Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredRegister.map((r) => (
                  <tr key={r.empId} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{r.name}</div>
                      <div className="text-[11px] text-slate-400">{r.empId}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{r.dept}</td>
                    <td className="py-3 px-4 text-right tabular-nums font-semibold text-slate-900">
                      {formatINR(r.gross)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-600">{formatINR(r.pf)}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-600">{formatINR(r.pt)}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-600">{formatINR(r.tds)}</td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-emerald-600">
                      {formatINR(r.net)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => addNotification("Payslip Downloaded", `Payslip for ${r.name} downloaded.`, "info")}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#0B6FDB] bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: STATUTORY COMPLIANCE
          ========================================================================= */}
      {activeTab === "compliance" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900">
                Statutory Filings & Challans Tracker
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">
                Track regulatory return filings, generate Electronic Challan cum Return (ECR) files and verify compliance deadlines.
              </p>
            </div>
            <button
              onClick={() => addNotification("Compliance Pack", "Downloaded unified statutory compliance pack for audit.", "success")}
              className="px-4 py-2 text-xs font-semibold text-[#0B2641] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Audit Pack
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Statutory Filing</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {[
                  { name: "Provident Fund (ECR)", period: "Sep 2026", amt: 136800, due: "15 Oct 2026", status: "Pending" },
                  { name: "Employee State Insurance (ESI)", period: "Sep 2026", amt: 0, due: "15 Oct 2026", status: "Completed" },
                  { name: "Professional Tax (Telangana)", period: "Sep 2026", amt: 7600, due: "10 Oct 2026", status: "Pending" },
                  { name: "TDS (Form 24Q) - Q2", period: "Q2 FY 2026-27", amt: 245000, due: "31 Oct 2026", status: "Pending" },
                  { name: "Labour Welfare Fund (LWF)", period: "H1 2026", amt: 228, due: "15 Jul 2026", status: "Completed" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                    <td className="py-3 px-4 text-slate-600">{row.period}</td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums text-slate-900">
                      {formatINR(row.amt)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{row.due}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          row.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {row.status === "Pending" ? (
                        <button
                          onClick={() => addNotification("Filing Recorded", `${row.name} marked as filed.`, "success")}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          Mark Filed
                        </button>
                      ) : null}
                      <button
                        onClick={() => addNotification("Challan Downloaded", `Challan receipt for ${row.name} downloaded.`, "info")}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Challan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: HISTORY & SUPPLEMENTARY RUNS
          ========================================================================= */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900">
                Payroll Cycle History & Supplementary Runs
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">
                Permanent audit trail of all historical regular and supplementary payroll cycles.
              </p>
            </div>
            <button
              onClick={() => setShowSuppModal(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0B6FDB] hover:bg-[#0958b0] rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Supplementary Run
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Cycle Month</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Headcount</th>
                  <th className="py-3 px-4 text-right">Gross Total</th>
                  <th className="py-3 px-4 text-right">Net Payout</th>
                  <th className="py-3 px-4">Status & Disbursal</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {allRuns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">{r.month}</td>
                    <td className="py-3 px-4">
                      {r.is_supplementary ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          Supplementary
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                          Regular
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{r.total_employees} emps</td>
                    <td className="py-3 px-4 text-right tabular-nums font-semibold text-slate-900">
                      {formatINR(r.total_gross)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-emerald-600">
                      {formatINR(r.total_net)}
                    </td>
                    <td className="py-3 px-4">
                      {r.is_locked ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                          <Lock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Locked</span>
                        </div>
                      ) : (
                        <span className="text-blue-600 font-medium">In Progress (Step {r.current_step})</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => addNotification("Bank File Export", `Bank transmission file for ${r.month} downloaded.`, "info")}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Bank File
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD ONE-TIME INPUT (STEP 2)
          ========================================================================= */}
      {showAddInputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-display">Add One-Time Input</h3>
              <button
                onClick={() => setShowAddInputModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddInput} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employee</label>
                <select
                  value={newInputEmp}
                  onChange={(e) => setNewInputEmp(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {registerItems.map((e) => (
                    <option key={e.empId} value={e.name}>
                      {e.name} ({e.empId} - {e.dept})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Type</label>
                <select
                  value={newInputType}
                  onChange={(e) => setNewInputType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Performance Bonus">Performance Bonus</option>
                  <option value="Project Incentive">Project Incentive</option>
                  <option value="Client Reimbursement">Client Reimbursement</option>
                  <option value="Salary Arrears">Salary Arrears</option>
                  <option value="Loan Recovery">Loan Recovery (Deduction)</option>
                  <option value="Notice Shortfall">Notice Shortfall (Deduction)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Amount (₹) — Use negative for deductions
                </label>
                <input
                  type="number"
                  placeholder="e.g. 25000 or -5000"
                  required
                  value={newInputAmt}
                  onChange={(e) => setNewInputAmt(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Notes / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Outstanding performance bonus approved by VP"
                  value={newInputNotes}
                  onChange={(e) => setNewInputNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddInputModal(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-[#0B6FDB] hover:bg-[#0958b0] rounded-xl font-semibold cursor-pointer"
                >
                  Add Input
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PUBLISH & LOCK MONTH (PAY-02)
          ========================================================================= */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Publish Payroll & Lock Month Permanently?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Once published, {activeRun?.month || "October 2026"} will be permanently locked against any retroactive edits.
                </p>
              </div>
            </div>

            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Statutory Lock Rule [PAY-02]</span>
              </div>
              <p className="leading-relaxed">
                Publishing triggers automated generation of payslips in employee self-service portals and releases bank transfer instructions. Any subsequent corrections must be processed through a <strong>Supplementary Payroll Run</strong>.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Cancel Review
              </button>
              <button
                type="button"
                disabled={publishing}
                onClick={handlePublishAndLock}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
              >
                {publishing ? "Publishing & Locking..." : "Confirm & Lock Month"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE SUPPLEMENTARY RUN (PAY-02)
          ========================================================================= */}
      {showSuppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-display">Create Supplementary Run</h3>
              <button
                onClick={() => setShowSuppModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200 text-xs text-blue-900">
              Supplementary runs allow post-lock adjustments (such as missed reimbursements, salary arrears or joiner adjustments) without altering the closed month register.
            </div>

            <form onSubmit={handleCreateSupplementary} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Closed Month</label>
                <input
                  type="text"
                  value={suppMonth}
                  onChange={(e) => setSuppMonth(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  placeholder="e.g. October 2026"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Supplementary Run (Audit Required)
                </label>
                <textarea
                  value={suppNotes}
                  onChange={(e) => setSuppNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  placeholder="e.g. Arrears for mid-month joinees and 3 approved travel claims received after cut-off."
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSuppModal(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-[#0B6FDB] hover:bg-[#0958b0] rounded-xl font-semibold cursor-pointer"
                >
                  Initiate Supplementary Run
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollAdminPage;
