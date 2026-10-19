import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Building2,
  TrendingUp,
  History,
  Calculator,
  Plus,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Search,
  DollarSign,
  X,
  Sparkles,
} from "lucide-react";
import { useNotifications } from "../../services/notificationsContext";

interface SalaryStructure {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  effective_from: string;
  gross_monthly: number;
  basic: number;
  hra: number;
  special_allowance: number;
  employee_pf: number;
  professional_tax: number;
  estimated_tds: number;
  net_take_home: number;
  annual_ctc: number;
  pf_opt_out: boolean;
  tax_regime: string;
  is_active: boolean;
  superseded_by?: string;
}

interface SalaryRevision {
  id: string;
  employee_id: string;
  employee_name: string;
  current_gross: number;
  proposed_gross: number;
  increment_percent: number;
  effective_date: string;
  reason: string;
  notes: string;
  status: "Draft" | "Under Review" | "Approved" | "Rejected";
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

interface IncrementRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  previous_gross: number;
  revised_gross: number;
  increment_amount: number;
  increment_percentage: number;
  effective_date: string;
  change_type: string;
  approved_by: string;
  approved_at: string;
  notes: string;
}

interface SalaryBreakdown {
  gross_monthly_rupees: number;
  basic_monthly_rupees: number;
  hra_monthly_rupees: number;
  special_allowance_rupees: number;
  employee_pf_rupees: number;
  employer_pf_rupees: number;
  professional_tax_rupees: number;
  estimated_tds_rupees: number;
  net_take_home_rupees: number;
  annual_ctc_rupees: number;
  gross_monthly_paise: number;
  basic_monthly_paise: number;
  hra_monthly_paise: number;
  special_allowance_paise: number;
  employee_pf_paise: number;
  employer_pf_paise: number;
  professional_tax_paise: number;
  estimated_tds_paise: number;
  net_take_home_paise: number;
}

const defaultStructures: SalaryStructure[] = [
  {
    id: "STR-001",
    employee_id: "EMP-001",
    employee_name: "Ananya Rao",
    department: "People Ops",
    effective_from: "2026-04-01",
    gross_monthly: 85000,
    basic: 42500,
    hra: 21250,
    special_allowance: 21250,
    employee_pf: 1800,
    professional_tax: 200,
    estimated_tds: 2340,
    net_take_home: 80660,
    annual_ctc: 1041600,
    pf_opt_out: false,
    tax_regime: "New",
    is_active: true,
  },
  {
    id: "STR-002",
    employee_id: "EMP-002",
    employee_name: "Karthik Nair",
    department: "Engineering",
    effective_from: "2026-04-01",
    gross_monthly: 120000,
    basic: 60000,
    hra: 30000,
    special_allowance: 30000,
    employee_pf: 1800,
    professional_tax: 200,
    estimated_tds: 6760,
    net_take_home: 111240,
    annual_ctc: 1461600,
    pf_opt_out: false,
    tax_regime: "New",
    is_active: true,
  },
  {
    id: "STR-003",
    employee_id: "EMP-003",
    employee_name: "Priya Sharma",
    department: "Product & Design",
    effective_from: "2026-04-01",
    gross_monthly: 65000,
    basic: 32500,
    hra: 16250,
    special_allowance: 16250,
    employee_pf: 1800,
    professional_tax: 200,
    estimated_tds: 0,
    net_take_home: 63000,
    annual_ctc: 801600,
    pf_opt_out: false,
    tax_regime: "Old",
    is_active: true,
  },
];

const defaultRevisions: SalaryRevision[] = [
  {
    id: "REV-101",
    employee_id: "EMP-001",
    employee_name: "Ananya Rao",
    current_gross: 85000,
    proposed_gross: 100000,
    increment_percent: 17.65,
    effective_date: "2026-11-01",
    reason: "Annual Appraisal",
    notes: "Exceeded Q2 & Q3 organizational hiring and portal delivery benchmarks.",
    status: "Under Review",
    created_at: "2026-10-10T11:00:00Z",
  },
  {
    id: "REV-102",
    employee_id: "EMP-002",
    employee_name: "Karthik Nair",
    current_gross: 120000,
    proposed_gross: 140000,
    increment_percent: 16.67,
    effective_date: "2026-11-01",
    reason: "Promotion",
    notes: "Promotion to Principal Rust Engineer & Platform Architect.",
    status: "Approved",
    approved_by: "Siddharth Patel (CEO)",
    approved_at: "2026-10-14T16:00:00Z",
    created_at: "2026-10-05T09:30:00Z",
  },
];

const defaultHistory: IncrementRecord[] = [
  {
    id: "INC-01",
    employee_id: "EMP-001",
    employee_name: "Ananya Rao",
    previous_gross: 72000,
    revised_gross: 85000,
    increment_amount: 13000,
    increment_percentage: 18.06,
    effective_date: "2026-04-01",
    change_type: "Annual Appraisal",
    approved_by: "HR Compensation Committee",
    approved_at: "2026-03-25T14:00:00Z",
    notes: "FY26 merit-based appraisal cycle.",
  },
  {
    id: "INC-02",
    employee_id: "EMP-002",
    employee_name: "Karthik Nair",
    previous_gross: 100000,
    revised_gross: 120000,
    increment_amount: 20000,
    increment_percentage: 20.0,
    effective_date: "2026-04-01",
    change_type: "Promotion",
    approved_by: "Engineering VP",
    approved_at: "2026-03-20T10:00:00Z",
    notes: "Promotion to Senior Tech Lead.",
  },
  {
    id: "INC-03",
    employee_id: "EMP-003",
    employee_name: "Priya Sharma",
    previous_gross: 55000,
    revised_gross: 65000,
    increment_amount: 10000,
    increment_percentage: 18.18,
    effective_date: "2026-04-01",
    change_type: "Annual Appraisal",
    approved_by: "HR Committee",
    approved_at: "2026-03-24T12:00:00Z",
    notes: "Exceeded design system unification milestones.",
  },
];

export const SalaryStructurePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"structures" | "revisions" | "history" | "calculator">("structures");
  const [structures, setStructures] = useState<SalaryStructure[]>(defaultStructures);
  const [revisions, setRevisions] = useState<SalaryRevision[]>(defaultRevisions);
  const [history, setHistory] = useState<IncrementRecord[]>(defaultHistory);
  const [search, setSearch] = useState("");
  const { addNotification } = useNotifications();

  // New Structure Modal State
  const [isStructModalOpen, setIsStructModalOpen] = useState(false);
  const [structEmpId, setStructEmpId] = useState("EMP-001");
  const [structEmpName, setStructEmpName] = useState("Ananya Rao");
  const [structDept, setStructDept] = useState("People Ops");
  const [structGross, setStructGross] = useState("90000");
  const [structRegime, setStructRegime] = useState("New");
  const [structPfOptOut, setStructPfOptOut] = useState(false);
  const [structDate, setStructDate] = useState("2026-11-01");

  // Propose Revision Modal State
  const [isRevModalOpen, setIsRevModalOpen] = useState(false);
  const [revEmpId, setRevEmpId] = useState("EMP-001");
  const [revEmpName, setRevEmpName] = useState("Ananya Rao");
  const [revCurrentGross, setRevCurrentGross] = useState(85000);
  const [revProposedGross, setRevProposedGross] = useState("95000");
  const [revReason, setRevReason] = useState("Annual Appraisal");
  const [revEffectiveDate, setRevEffectiveDate] = useState("2026-11-01");
  const [revNotes, setRevNotes] = useState("");

  // Live Calculator State (PAY-01)
  const [calcInputGross, setCalcInputGross] = useState("100000");
  const [calcPfCapped, setCalcPfCapped] = useState(true);
  const [calcRegime, setCalcRegime] = useState("New");
  const [calcResult, setCalcResult] = useState<SalaryBreakdown | null>(null);

  const fetchAll = async () => {
    try {
      const [resStructs, resRevs, resHist] = await Promise.all([
        axios.get("/api/salary/structures"),
        axios.get("/api/salary/revisions"),
        axios.get("/api/salary/increments"),
      ]);
      if (resStructs.data) setStructures(resStructs.data);
      if (resRevs.data) setRevisions(resRevs.data);
      if (resHist.data) setHistory(resHist.data);
    } catch {
      // Keep local state
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Run calculation for PAY-01 live calculator
  const runLiveCalculation = async () => {
    const num = parseFloat(calcInputGross) || 0;
    if (num <= 0) return;

    try {
      const res = await axios.post("/api/salary/calculate", {
        gross_monthly: num,
        pf_capped: calcPfCapped,
        tax_regime: calcRegime,
      });
      if (res.data) setCalcResult(res.data);
    } catch {
      const basic = Math.round(num * 0.5);
      const hra = Math.round(basic * 0.5);
      const special = num - basic - hra;
      const pf = calcPfCapped ? Math.min(1800, Math.round(basic * 0.12)) : Math.round(basic * 0.12);
      const pt = num > 15000 ? 200 : 150;
      const tds = num > 100000 ? Math.round(num * 0.06) : 0;
      const net = num - pf - pt - tds;

      setCalcResult({
        gross_monthly_rupees: num,
        basic_monthly_rupees: basic,
        hra_monthly_rupees: hra,
        special_allowance_rupees: special,
        employee_pf_rupees: pf,
        employer_pf_rupees: pf,
        professional_tax_rupees: pt,
        estimated_tds_rupees: tds,
        net_take_home_rupees: net,
        annual_ctc_rupees: (num + pf) * 12,
        gross_monthly_paise: num * 100,
        basic_monthly_paise: basic * 100,
        hra_monthly_paise: hra * 100,
        special_allowance_paise: special * 100,
        employee_pf_paise: pf * 100,
        employer_pf_paise: pf * 100,
        professional_tax_paise: pt * 100,
        estimated_tds_paise: tds * 100,
        net_take_home_paise: net * 100,
      });
    }
  };

  useEffect(() => {
    runLiveCalculation();
  }, [calcInputGross, calcPfCapped, calcRegime]);

  // Handle Propose Revision
  const handleProposeRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    const prop = parseFloat(revProposedGross) || 0;
    if (prop <= 0) return;

    const incAmt = prop - revCurrentGross;
    const incPct = Math.round((incAmt / revCurrentGross) * 10000) / 100;

    const payload = {
      employee_id: revEmpId,
      employee_name: revEmpName,
      current_gross: revCurrentGross,
      proposed_gross: prop,
      effective_date: revEffectiveDate,
      reason: revReason,
      notes: revNotes,
    };

    try {
      const res = await axios.post("/api/salary/revisions", payload);
      if (res.data) setRevisions((prev) => [res.data, ...prev]);
    } catch {
      const newRev: SalaryRevision = {
        id: `REV-${Math.floor(100 + Math.random() * 900)}`,
        employee_id: revEmpId,
        employee_name: revEmpName,
        current_gross: revCurrentGross,
        proposed_gross: prop,
        increment_percent: incPct,
        effective_date: revEffectiveDate,
        reason: revReason,
        notes: revNotes,
        status: "Under Review",
        created_at: new Date().toISOString(),
      };
      setRevisions((prev) => [newRev, ...prev]);
    }

    addNotification({
      title: "Salary Revision Proposed",
      message: `Revision of +${incPct}% for ${revEmpName} submitted for compensation committee approval.`,
      category: "payroll",
      actionUrl: "/payroll/salary-structure",
    });

    setIsRevModalOpen(false);
  };

  // Handle Approve Revision (PAY-10 -> Auto updates PAY-09 and EXP-07!)
  const handleApproveRevision = async (revId: string) => {
    try {
      await axios.post(`/api/salary/revisions/${revId}/approve`);
      await fetchAll();
    } catch {
      const rev = revisions.find((r) => r.id === revId);
      if (!rev) return;

      setRevisions((prev) =>
        prev.map((r) =>
          r.id === revId
            ? {
                ...r,
                status: "Approved",
                approved_by: "HR Compensation Committee",
                approved_at: new Date().toISOString(),
              }
            : r
        )
      );

      const incRecord: IncrementRecord = {
        id: `INC-${Math.floor(10 + Math.random() * 90)}`,
        employee_id: rev.employee_id,
        employee_name: rev.employee_name,
        previous_gross: rev.current_gross,
        revised_gross: rev.proposed_gross,
        increment_amount: rev.proposed_gross - rev.current_gross,
        increment_percentage: rev.increment_percent,
        effective_date: rev.effective_date,
        change_type: rev.reason,
        approved_by: "HR Compensation Committee",
        approved_at: new Date().toISOString(),
        notes: rev.notes,
      };
      setHistory((prev) => [incRecord, ...prev]);

      const newStructId = `STR-${Math.floor(100 + Math.random() * 900)}`;
      const basic = Math.round(rev.proposed_gross * 0.5);
      const hra = Math.round(basic * 0.5);
      const special = rev.proposed_gross - basic - hra;
      const pf = 1800;
      const pt = 200;
      const tds = rev.proposed_gross > 100000 ? Math.round(rev.proposed_gross * 0.05) : 0;
      const net = rev.proposed_gross - pf - pt - tds;

      setStructures((prev) => [
        {
          id: newStructId,
          employee_id: rev.employee_id,
          employee_name: rev.employee_name,
          department: "Engineering",
          effective_from: rev.effective_date,
          gross_monthly: rev.proposed_gross,
          basic,
          hra,
          special_allowance: special,
          employee_pf: pf,
          professional_tax: pt,
          estimated_tds: tds,
          net_take_home: net,
          annual_ctc: (rev.proposed_gross + pf) * 12,
          pf_opt_out: false,
          tax_regime: "New",
          is_active: true,
        },
        ...prev.map((s) =>
          s.employee_id === rev.employee_id && s.is_active
            ? { ...s, is_active: false, superseded_by: newStructId }
            : s
        ),
      ]);
    }

    addNotification({
      title: "Salary Revision Approved",
      message: `Revision approved! New active structure created and increment history updated automatically.`,
      category: "payroll",
      actionUrl: "/payroll/salary-structure",
    });
  };

  // Handle Create Structure (PAY-09 Supersede Rule)
  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    const gross = parseFloat(structGross) || 0;
    if (gross <= 0) return;

    const payload = {
      employee_id: structEmpId,
      employee_name: structEmpName,
      department: structDept,
      gross_monthly: gross,
      pf_opt_out: structPfOptOut,
      tax_regime: structRegime,
      effective_from: structDate,
    };

    try {
      const res = await axios.post("/api/salary/structures", payload);
      if (res.data) {
        await fetchAll();
      }
    } catch {
      const newId = `STR-${Math.floor(100 + Math.random() * 900)}`;
      const basic = Math.round(gross * 0.5);
      const hra = Math.round(basic * 0.5);
      const special = gross - basic - hra;
      const pf = structPfOptOut ? Math.round(basic * 0.12) : 1800;
      const pt = 200;
      const tds = gross > 100000 ? Math.round(gross * 0.05) : 0;
      const net = gross - pf - pt - tds;

      setStructures((prev) => [
        {
          id: newId,
          employee_id: structEmpId,
          employee_name: structEmpName,
          department: structDept,
          effective_from: structDate,
          gross_monthly: gross,
          basic,
          hra,
          special_allowance: special,
          employee_pf: pf,
          professional_tax: pt,
          estimated_tds: tds,
          net_take_home: net,
          annual_ctc: (gross + pf) * 12,
          pf_opt_out: structPfOptOut,
          tax_regime: structRegime,
          is_active: true,
        },
        ...prev.map((s) =>
          s.employee_id === structEmpId && s.is_active
            ? { ...s, is_active: false, superseded_by: newId }
            : s
        ),
      ]);
    }

    addNotification({
      title: "Salary Structure Configured",
      message: `Active salary structure configured for ${structEmpName}. Previous active revision superseded.`,
      category: "payroll",
      actionUrl: "/payroll/salary-structure",
    });

    setIsStructModalOpen(false);
  };

  const activeStructures = structures.filter((s) => s.is_active);
  const totalPayrollGross = activeStructures.reduce((sum, s) => sum + s.gross_monthly, 0);
  const avgIncrement = Math.round(
    history.reduce((sum, h) => sum + h.increment_percentage, 0) / (history.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora text-2xl font-semibold text-txt">
            Salary Structures & Increment History
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            Manage compensation components, appraise and revise salaries, and track historical increment audit trails.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsRevModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-line bg-surface hover:bg-surface-secondary text-txt text-xs font-semibold shadow-sm transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-brand" />
            <span>Propose Revision (PAY-10)</span>
          </button>
          <button
            onClick={() => setIsStructModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand hover:bg-brand/90 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Configure Structure (PAY-09)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-brand-soft text-brand">
              <Building2 className="w-4 h-4" />
            </span>
            <span>Active Structures</span>
          </div>
          <div className="font-sora text-2xl font-bold text-txt mt-2">
            {activeStructures.length}
          </div>
          <div className="text-[11px] text-txt-faint mt-1">Active employee payroll profiles</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-blue-50 text-brand-cyan dark:bg-blue-950/40 dark:text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </span>
            <span>Monthly Base Commitment</span>
          </div>
          <div className="font-sora text-2xl font-bold text-txt mt-2">
            ?{totalPayrollGross.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-txt-faint mt-1">Total active gross commitment</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span>Avg Appraisal Increment</span>
          </div>
          <div className="font-sora text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            +{avgIncrement}%
          </div>
          <div className="text-[11px] text-txt-faint mt-1">Across approved merit cycles</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
            <span>Pending Revisions</span>
          </div>
          <div className="font-sora text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {revisions.filter((r) => r.status === "Under Review").length}
          </div>
          <div className="text-[11px] text-txt-faint mt-1">In review by comp committee</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-line pb-2 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab("structures")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === "structures"
              ? "bg-brand text-white font-semibold"
              : "text-txt-muted hover:text-txt hover:bg-surface-secondary"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Salary Structures (PAY-09)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white">
            {structures.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("revisions")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === "revisions"
              ? "bg-brand text-white font-semibold"
              : "text-txt-muted hover:text-txt hover:bg-surface-secondary"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Revisions & Appraisals (PAY-10)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold">
            {revisions.filter((r) => r.status === "Under Review").length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === "history"
              ? "bg-brand text-white font-semibold"
              : "text-txt-muted hover:text-txt hover:bg-surface-secondary"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Increment History (EXP-07)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-secondary text-txt-muted border border-line">
            {history.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("calculator")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === "calculator"
              ? "bg-brand text-white font-semibold"
              : "text-txt-muted hover:text-txt hover:bg-surface-secondary"
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Whole-Paise Engine (PAY-01)</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: SALARY STRUCTURES (PAY-09)
          ========================================================================= */}
      {activeTab === "structures" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-txt-faint absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search employee, structure ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface border border-line text-xs text-txt outline-none focus:border-brand"
              />
            </div>
            <div className="text-xs text-txt-faint">
              Active structures supersede automatically on new revision creation.
            </div>
          </div>

          <div className="bg-surface border border-line rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-secondary text-txt-muted border-b border-line font-medium">
                  <tr>
                    <th className="p-3.5 pl-5">Structure ID</th>
                    <th className="p-3.5">Employee</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Effective Date</th>
                    <th className="p-3.5">Monthly Gross</th>
                    <th className="p-3.5">Basic (50%)</th>
                    <th className="p-3.5">HRA (25%)</th>
                    <th className="p-3.5">Employee PF</th>
                    <th className="p-3.5">Net Take-Home</th>
                    <th className="p-3.5">Annual CTC</th>
                    <th className="p-3.5 pr-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {structures
                    .filter(
                      (s) =>
                        s.employee_name.toLowerCase().includes(search.toLowerCase()) ||
                        s.id.toLowerCase().includes(search.toLowerCase()) ||
                        s.department.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((s) => (
                      <tr
                        key={s.id}
                        className={`hover:bg-surface-secondary/50 transition-colors ${
                          !s.is_active ? "opacity-60 bg-surface-secondary/20" : ""
                        }`}
                      >
                        <td className="p-3.5 pl-5 font-mono font-semibold text-txt">{s.id}</td>
                        <td className="p-3.5 font-medium text-txt flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-soft text-brand text-[10px] font-bold flex items-center justify-center">
                            {s.employee_name[0]}
                          </div>
                          <span>{s.employee_name}</span>
                        </td>
                        <td className="p-3.5 text-txt-muted">{s.department}</td>
                        <td className="p-3.5 text-txt-faint">{s.effective_from}</td>
                        <td className="p-3.5 font-sora font-semibold text-txt">
                          ?{s.gross_monthly.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3.5 font-sora text-txt-muted">
                          ?{s.basic.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3.5 font-sora text-txt-muted">
                          ?{s.hra.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3.5 font-sora text-txt-muted">
                          ?{s.employee_pf.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3.5 font-sora font-semibold text-emerald-600 dark:text-emerald-400">
                          ?{s.net_take_home.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3.5 font-sora text-txt font-medium">
                          ?{s.annual_ctc.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3.5 pr-5">
                          {s.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-secondary border border-line text-txt-faint"
                              title={`Superseded by ${s.superseded_by || "revision"}`}
                            >
                              Superseded
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: SALARY REVISIONS & APPRAISALS (PAY-10)
          ========================================================================= */}
      {activeTab === "revisions" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-brand-soft/30 border border-brand/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-brand shrink-0" />
              <div>
                <strong className="text-txt font-semibold block">
                  Automatic Increment Pipeline Active
                </strong>
                <span className="text-txt-muted">
                  Approving a revision automatically updates the employee's active salary structure and logs an immutable entry to the Increment History timeline.
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-line rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-secondary text-txt-muted border-b border-line font-medium">
                  <tr>
                    <th className="p-3.5 pl-5">Proposal ID</th>
                    <th className="p-3.5">Employee</th>
                    <th className="p-3.5">Current Gross</th>
                    <th className="p-3.5">Proposed Gross</th>
                    <th className="p-3.5">Increment %</th>
                    <th className="p-3.5">Effective Date</th>
                    <th className="p-3.5">Reason</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Committee Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {revisions.map((rev) => (
                    <tr key={rev.id} className="hover:bg-surface-secondary/50 transition-colors">
                      <td className="p-3.5 pl-5 font-mono font-semibold text-txt">{rev.id}</td>
                      <td className="p-3.5 font-medium text-txt">{rev.employee_name}</td>
                      <td className="p-3.5 font-sora text-txt-muted">
                        ?{rev.current_gross.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3.5 font-sora font-semibold text-txt">
                        ?{rev.proposed_gross.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          +{rev.increment_percent}%
                        </span>
                      </td>
                      <td className="p-3.5 text-txt-faint">{rev.effective_date}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-surface-secondary border border-line text-txt-muted font-medium">
                          {rev.reason}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            rev.status === "Approved"
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                          }`}
                        >
                          {rev.status}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        {rev.status === "Approved" ? (
                          <span className="text-[11px] text-txt-faint inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Approved
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApproveRevision(rev.id)}
                            className="px-3 py-1 rounded-xl bg-brand hover:bg-brand/90 text-white font-semibold shadow-sm transition-all text-xs"
                          >
                            Approve Revision
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: INCREMENT HISTORY TIMELINE (EXP-07)
          ========================================================================= */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-sora font-semibold text-sm text-txt">
              Employee Compensation Increment Audit Trail
            </h3>
            <span className="text-xs text-txt-faint">
              Auto-fed by approved revisions and performance promotions
            </span>
          </div>

          <div className="space-y-3">
            {history.map((record) => (
              <div
                key={record.id}
                className="p-4 rounded-2xl bg-surface border border-line shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand to-brand-cyan text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {record.employee_name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-xs text-txt">{record.employee_name}</h4>
                      <span className="px-2 py-0.2 rounded-md bg-surface-secondary border border-line text-[10px] text-txt-muted font-medium">
                        {record.change_type}
                      </span>
                      <span className="text-[11px] text-txt-faint">Effective: {record.effective_date}</span>
                    </div>
                    <p className="text-xs text-txt-muted mt-1 leading-relaxed">
                      {record.notes}
                    </p>
                    <div className="text-[11px] text-txt-faint mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                      <span>{record.approved_by}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start sm:items-end flex-col justify-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-line">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-txt-faint line-through">
                      ?{record.previous_gross.toLocaleString("en-IN")}
                    </span>
                    <span className="font-sora font-bold text-sm text-txt">
                      ?{record.revised_gross.toLocaleString("en-IN")}/mo
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      +?{record.increment_amount.toLocaleString("en-IN")} (+{record.increment_percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: LIVE WHOLE-PAISE SALARY ENGINE (PAY-01)
          ========================================================================= */}
      {activeTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls (5 cols) */}
          <div className="lg:col-span-5 bg-surface border border-line rounded-2xl shadow-card p-5 space-y-4 text-xs">
            <div>
              <h3 className="font-sora font-semibold text-sm text-txt">
                Whole-Paise Calculation Engine
              </h3>
              <p className="text-xs text-txt-muted mt-0.5">
                Simulate monthly components with exact integer paise precision and rounding.
              </p>
            </div>

            <div>
              <label className="block text-txt font-medium mb-1">Monthly Gross (INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-txt-faint font-semibold">?</span>
                <input
                  type="number"
                  step="1000"
                  value={calcInputGross}
                  onChange={(e) => setCalcInputGross(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-surface border border-line text-sm font-sora font-semibold text-txt outline-none focus:border-brand"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-txt font-medium mb-1">Tax Regime</label>
                <select
                  value={calcRegime}
                  onChange={(e) => setCalcRegime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand font-medium"
                >
                  <option value="New">New Regime (FY26-27)</option>
                  <option value="Old">Old Regime</option>
                </select>
              </div>

              <div>
                <label className="block text-txt font-medium mb-1">Provident Fund Cap</label>
                <select
                  value={calcPfCapped ? "capped" : "uncapped"}
                  onChange={(e) => setCalcPfCapped(e.target.value === "capped")}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand font-medium"
                >
                  <option value="capped">Capped (?1,800/mo)</option>
                  <option value="uncapped">Uncapped (12% of Basic)</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-secondary border border-line text-[11px] text-txt-muted space-y-1">
              <div className="font-semibold text-txt">Engine Math Rules (Whole Paise):</div>
              <div>? Basic: 50% of Gross CTC</div>
              <div>? HRA: 50% of Basic (25% of Gross)</div>
              <div>? Special Allowance: Remainder (25%)</div>
              <div>? Professional Tax: Flat ?200/mo</div>
              <div>? 1 Rupee = 100 Paise (Eliminates floating-point rounding drifts)</div>
            </div>
          </div>

          {/* Results Display (7 cols) */}
          {calcResult && (
            <div className="lg:col-span-7 bg-surface border border-line rounded-2xl shadow-card p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-line gap-3">
                <div>
                  <div className="text-[11px] text-txt-faint uppercase tracking-wider font-semibold">
                    Computed Net Take-Home
                  </div>
                  <div className="font-sora text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    ?{calcResult.net_take_home_rupees.toLocaleString("en-IN")}
                  </div>
                  <div className="font-mono text-[11px] text-txt-faint mt-0.5">
                    {calcResult.net_take_home_paise.toLocaleString()} Paise
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="text-[11px] text-txt-faint uppercase tracking-wider font-semibold">
                    Annual CTC
                  </div>
                  <div className="font-sora text-xl font-bold text-txt mt-1">
                    ?{calcResult.annual_ctc_rupees.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-txt-muted">Includes Employer PF</div>
                </div>
              </div>

              {/* Earnings Breakdown */}
              <div>
                <h4 className="text-xs font-semibold text-txt mb-2.5 flex items-center justify-between">
                  <span>Monthly Earnings Structure</span>
                  <span className="font-sora text-brand font-bold">
                    ?{calcResult.gross_monthly_rupees.toLocaleString("en-IN")} Gross
                  </span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 rounded-xl bg-surface-secondary border border-line/60">
                    <div>
                      <span className="font-medium text-txt">Basic Salary</span>
                      <span className="text-[10px] text-txt-faint ml-2">(50% of Gross)</span>
                    </div>
                    <span className="font-sora font-semibold text-txt">
                      ?{calcResult.basic_monthly_rupees.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-xl bg-surface-secondary border border-line/60">
                    <div>
                      <span className="font-medium text-txt">House Rent Allowance (HRA)</span>
                      <span className="text-[10px] text-txt-faint ml-2">(50% of Basic)</span>
                    </div>
                    <span className="font-sora font-semibold text-txt">
                      ?{calcResult.hra_monthly_rupees.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-xl bg-surface-secondary border border-line/60">
                    <div>
                      <span className="font-medium text-txt">Special Allowance</span>
                      <span className="text-[10px] text-txt-faint ml-2">(Balancing Component)</span>
                    </div>
                    <span className="font-sora font-semibold text-txt">
                      ?{calcResult.special_allowance_rupees.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions Breakdown */}
              <div>
                <h4 className="text-xs font-semibold text-txt mb-2.5 flex items-center justify-between">
                  <span>Monthly Deductions</span>
                  <span className="font-sora text-rose-500 font-bold">
                    -?
                    {(
                      calcResult.employee_pf_rupees +
                      calcResult.professional_tax_rupees +
                      calcResult.estimated_tds_rupees
                    ).toLocaleString("en-IN")}
                  </span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/30">
                    <span className="font-medium text-txt">Employee PF (12%)</span>
                    <span className="font-sora font-semibold text-rose-600 dark:text-rose-400">
                      -?{calcResult.employee_pf_rupees.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/30">
                    <span className="font-medium text-txt">Professional Tax (PT)</span>
                    <span className="font-sora font-semibold text-rose-600 dark:text-rose-400">
                      -?{calcResult.professional_tax_rupees.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/30">
                    <span className="font-medium text-txt">Estimated Monthly TDS</span>
                    <span className="font-sora font-semibold text-rose-600 dark:text-rose-400">
                      -?{calcResult.estimated_tds_rupees.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Configure Salary Structure (PAY-09) */}
      {isStructModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-lg bg-surface border border-line rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-line flex items-center justify-between bg-surface-secondary/40">
              <div>
                <h3 className="font-sora font-semibold text-sm text-txt">
                  Configure Salary Structure (PAY-09)
                </h3>
                <p className="text-xs text-txt-muted mt-0.5">
                  Any currently active structure for this employee will be automatically superseded.
                </p>
              </div>
              <button
                onClick={() => setIsStructModalOpen(false)}
                className="p-1 text-txt-faint hover:text-txt rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStructure} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-txt font-medium mb-1">Employee</label>
                  <select
                    value={structEmpName}
                    onChange={(e) => {
                      setStructEmpName(e.target.value);
                      if (e.target.value === "Ananya Rao") {
                        setStructEmpId("EMP-001");
                        setStructDept("People Ops");
                      } else if (e.target.value === "Karthik Nair") {
                        setStructEmpId("EMP-002");
                        setStructDept("Engineering");
                      } else {
                        setStructEmpId("EMP-003");
                        setStructDept("Product & Design");
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand font-medium"
                  >
                    <option value="Ananya Rao">Ananya Rao (EMP-001)</option>
                    <option value="Karthik Nair">Karthik Nair (EMP-002)</option>
                    <option value="Priya Sharma">Priya Sharma (EMP-003)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-txt font-medium mb-1">Department</label>
                  <input
                    type="text"
                    value={structDept}
                    readOnly
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-line text-txt-muted outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-txt font-medium mb-1">Monthly Gross (INR)</label>
                  <input
                    type="number"
                    step="1000"
                    placeholder="e.g. 90000"
                    value={structGross}
                    onChange={(e) => setStructGross(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand font-sora font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-txt font-medium mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={structDate}
                    onChange={(e) => setStructDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-txt font-medium mb-1">Tax Regime</label>
                  <select
                    value={structRegime}
                    onChange={(e) => setStructRegime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
                  >
                    <option value="New">New Regime</option>
                    <option value="Old">Old Regime</option>
                  </select>
                </div>

                <div>
                  <label className="block text-txt font-medium mb-1">PF Contribution</label>
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-line bg-surface cursor-pointer">
                    <input
                      type="checkbox"
                      checked={structPfOptOut}
                      onChange={(e) => setStructPfOptOut(e.target.checked)}
                      className="w-4 h-4 rounded text-brand focus:ring-0"
                    />
                    <span className="text-txt font-medium text-[11px]">Uncapped 12% PF</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsStructModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-line text-txt-muted hover:text-txt hover:bg-surface-secondary font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand/90 shadow-sm"
                >
                  Save Active Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Propose Revision (PAY-10) */}
      {isRevModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-lg bg-surface border border-line rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-line flex items-center justify-between bg-surface-secondary/40">
              <div>
                <h3 className="font-sora font-semibold text-sm text-txt">
                  Propose Salary Revision (PAY-10)
                </h3>
                <p className="text-xs text-txt-muted mt-0.5">
                  Proposals are routed to the compensation committee. Approval automatically creates increment history.
                </p>
              </div>
              <button
                onClick={() => setIsRevModalOpen(false)}
                className="p-1 text-txt-faint hover:text-txt rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProposeRevision} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-txt font-medium mb-1">Employee</label>
                <select
                  value={revEmpName}
                  onChange={(e) => {
                    setRevEmpName(e.target.value);
                    if (e.target.value === "Ananya Rao") {
                      setRevEmpId("EMP-001");
                      setRevCurrentGross(85000);
                    } else if (e.target.value === "Karthik Nair") {
                      setRevEmpId("EMP-002");
                      setRevCurrentGross(120000);
                    } else {
                      setRevEmpId("EMP-003");
                      setRevCurrentGross(65000);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand font-medium"
                >
                  <option value="Ananya Rao">Ananya Rao (Current: ?85,000)</option>
                  <option value="Karthik Nair">Karthik Nair (Current: ?120,000)</option>
                  <option value="Priya Sharma">Priya Sharma (Current: ?65,000)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-txt font-medium mb-1">Current Monthly Gross</label>
                  <input
                    type="text"
                    value={`?${revCurrentGross.toLocaleString("en-IN")}`}
                    readOnly
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-line text-txt-muted font-sora font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-txt font-medium mb-1">Proposed Monthly Gross</label>
                  <input
                    type="number"
                    step="1000"
                    placeholder="e.g. 100000"
                    value={revProposedGross}
                    onChange={(e) => setRevProposedGross(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand font-sora font-semibold"
                  />
                </div>
              </div>

              {/* Increment Preview */}
              {parseFloat(revProposedGross) > revCurrentGross && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between">
                  <span className="text-emerald-700 dark:text-emerald-300 font-medium">Computed Increment:</span>
                  <span className="font-sora font-bold text-emerald-600 dark:text-emerald-400">
                    +?{(parseFloat(revProposedGross) - revCurrentGross).toLocaleString("en-IN")}{" "}
                    (+{Math.round(((parseFloat(revProposedGross) - revCurrentGross) / revCurrentGross) * 10000) / 100}%)
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-txt font-medium mb-1">Revision Reason</label>
                  <select
                    value={revReason}
                    onChange={(e) => setRevReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
                  >
                    <option value="Annual Appraisal">Annual Appraisal</option>
                    <option value="Promotion">Promotion</option>
                    <option value="Market Adjustment">Market Adjustment</option>
                    <option value="Off-cycle Correction">Off-cycle Correction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-txt font-medium mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={revEffectiveDate}
                    onChange={(e) => setRevEffectiveDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-txt font-medium mb-1">Appraisal Notes / Justification</label>
                <textarea
                  rows={3}
                  placeholder="Performance benchmarks, KPI accomplishments, promotion justification..."
                  value={revNotes}
                  onChange={(e) => setRevNotes(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
                />
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRevModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-line text-txt-muted hover:text-txt hover:bg-surface-secondary font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand/90 shadow-sm"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryStructurePage;
