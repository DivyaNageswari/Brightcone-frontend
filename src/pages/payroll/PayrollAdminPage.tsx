import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { Lock, Plus, Download } from "lucide-react";
import { useNotifications } from "../../services/NotificationsContext";
import {
  type PayrollRun,
  type AttendanceSyncItem,
  type VarianceItem,
  type OneTimeInput,
  paySteps,
} from "./payroll-admin/types";
import { RunPayrollTab } from "./payroll-admin/RunPayrollTab";
import { RegisterTab } from "./payroll-admin/RegisterTab";
import { ComplianceTab } from "./payroll-admin/ComplianceTab";
import { HistoryTab } from "./payroll-admin/HistoryTab";
import {
  AddInputModal,
  PublishLockModal,
  SupplementaryRunModal,
} from "./payroll-admin/PayrollModals";

export const PayrollAdminPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { addNotification } = useNotifications();

  const initialTab = searchParams.get("tab") || "run";
  const [activeTab, setActiveTab] = useState<string>(
    initialTab === "register" ? "register" : initialTab === "compliance" ? "compliance" : "run"
  );

  const [activeRun, setActiveRun] = useState<PayrollRun | null>(null);
  const [allRuns, setAllRuns] = useState<PayrollRun[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSyncItem[]>([]);
  const [variances, setVariances] = useState<VarianceItem[]>([]);

  const [currentStep, setCurrentStep] = useState<number>(3);
  const [inputs, setInputs] = useState<OneTimeInput[]>([
    { id: "IN-1", emp: "Karthik Reddy", type: "Performance Bonus", amt: 150000, notes: "Q3 Top Achiever" },
    { id: "IN-2", emp: "Arjun Nair", type: "Travel Reimbursement", amt: 48200, notes: "Client Visit Mumbai" },
    { id: "IN-3", emp: "Pooja Hegde", type: "Referral Bonus", amt: 35000, notes: "Backend Eng Hire" },
    { id: "IN-4", emp: "Sameer Joshi", type: "Notice Period Deduction", amt: -12500, notes: "Shortfall recovery" },
  ]);

  const [showAddInputModal, setShowAddInputModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showSuppModal, setShowSuppModal] = useState(false);

  const [financeApproved, setFinanceApproved] = useState(false);
  const [financeComments, setFinanceComments] = useState("All attendance deductions and incentive adjustments reconciled with ERP.");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
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
    } catch {
      // Local fallback
    }
  };

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
        addNotification({
          title: "Payroll Run Advanced",
          message: `Moved ${activeRun.month} to step ${nextStep}: ${paySteps[nextStep - 1].title}`,
          category: "payroll",
          actionUrl: "/payroll/admin",
        });
      } catch {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        setActiveRun({ ...activeRun, current_step: nextStep });
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1 && !activeRun?.is_locked) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handlePublishAndLock = async () => {
    if (!activeRun) return;
    try {
      setPublishing(true);
      const res = await axios.post(`/api/payroll/runs/${activeRun.id}/publish-and-lock`);
      setActiveRun(res.data.run);
      setCurrentStep(5);
      setShowPublishModal(false);

      addNotification({
        title: "Payroll Disbursed & Month Locked",
        message: `${activeRun.month} payroll is officially locked. Payslips published to all employees.`,
        category: "payroll",
        actionUrl: "/payroll/admin",
      });

      const runsRes = await axios.get<PayrollRun[]>("/api/payroll/runs");
      setAllRuns(runsRes.data);
    } catch {
      setActiveRun({ ...activeRun, is_locked: true, status: "Locked & Disbursed" });
      setShowPublishModal(false);
    } finally {
      setPublishing(false);
    }
  };

  const handleCreateSupplementary = async (month: string, notes: string) => {
    try {
      const res = await axios.post("/api/payroll/runs/create-supplementary", { month, notes });
      addNotification({
        title: "Supplementary Run Created",
        message: `Created supplementary run for ${month}`,
        category: "payroll",
        actionUrl: "/payroll/admin",
      });

      setAllRuns([res.data, ...allRuns]);
      setActiveRun(res.data);
      setCurrentStep(1);
      setShowSuppModal(false);
      setActiveTab("run");
    } catch {
      const newRun: PayrollRun = {
        id: `RUN-SUPP-${Date.now()}`,
        month: `${month} (Supp)`,
        status: "Draft",
        current_step: 1,
        total_employees: 4,
        total_gross: 180000,
        total_net: 165000,
        total_deductions: 15000,
        is_locked: false,
        is_supplementary: true,
        supplementary_notes: notes,
        created_at: new Date().toISOString(),
      };
      setAllRuns([newRun, ...allRuns]);
      setActiveRun(newRun);
      setCurrentStep(1);
      setShowSuppModal(false);
      setActiveTab("run");
    }
  };

  const handleAddInput = (data: { emp: string; type: string; amt: number; notes: string }) => {
    const newItem: OneTimeInput = {
      id: `IN-${Date.now()}`,
      emp: data.emp,
      type: data.type,
      amt: data.amt,
      notes: data.notes,
    };
    setInputs([newItem, ...inputs]);
    setShowAddInputModal(false);
  };

  const handleRemoveInput = (id: string) => {
    setInputs(inputs.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in">
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
                addNotification({
                  title: "Bank File Export",
                  message: "Generating NEFT/RTGS batch transfer file for bank portal...",
                  category: "payroll",
                  actionUrl: "/payroll/admin",
                });
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0B2641] hover:bg-[#07192c] rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export Bank File
            </button>
          </div>
        </div>

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

      {activeTab === "run" && (
        <RunPayrollTab
          activeRun={activeRun}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          attendance={attendance}
          inputs={inputs}
          variances={variances}
          financeApproved={financeApproved}
          setFinanceApproved={setFinanceApproved}
          financeComments={financeComments}
          setFinanceComments={setFinanceComments}
          onAdvanceStep={handleAdvanceStep}
          onPreviousStep={handlePreviousStep}
          onOpenPublishModal={() => setShowPublishModal(true)}
          onOpenAddModal={() => setShowAddInputModal(true)}
          onRemoveInput={handleRemoveInput}
          onSyncAttendance={() => {
            addNotification({
              title: "Attendance Synced",
              message: "Biometric logs refreshed for October 2026.",
              category: "payroll",
              actionUrl: "/payroll/admin",
            });
          }}
        />
      )}

      {activeTab === "register" && (
        <RegisterTab
          activeRun={activeRun}
          onDownloadSlip={(name) => {
            addNotification({
              title: "Payslip Downloaded",
              message: `Payslip for ${name} downloaded.`,
              category: "payroll",
              actionUrl: "/payroll/admin",
            });
          }}
          onExport={() => {
            addNotification({
              title: "Export",
              message: "Salary register exported to CSV.",
              category: "payroll",
              actionUrl: "/payroll/admin",
            });
          }}
        />
      )}

      {activeTab === "compliance" && (
        <ComplianceTab
          onDownloadPack={() => {
            addNotification({
              title: "Compliance Pack",
              message: "Downloaded unified statutory compliance pack for audit.",
              category: "payroll",
              actionUrl: "/payroll/admin",
            });
          }}
          onMarkFiled={(name) => {
            addNotification({
              title: "Filing Recorded",
              message: `${name} marked as filed.`,
              category: "payroll",
              actionUrl: "/payroll/admin",
            });
          }}
          onDownloadChallan={(name) => {
            addNotification({
              title: "Challan Downloaded",
              message: `Challan receipt for ${name} downloaded.`,
              category: "payroll",
              actionUrl: "/payroll/admin",
            });
          }}
        />
      )}

      {activeTab === "history" && (
        <HistoryTab
          allRuns={allRuns}
          onOpenSuppModal={() => setShowSuppModal(true)}
          onExportBankFile={(month) => {
            addNotification({
              title: "Bank File Export",
              message: `Bank transmission file for ${month} downloaded.`,
              category: "payroll",
              actionUrl: "/payroll/admin",
            });
          }}
        />
      )}

      <AddInputModal
        isOpen={showAddInputModal}
        onClose={() => setShowAddInputModal(false)}
        onSubmit={handleAddInput}
      />

      <PublishLockModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={handlePublishAndLock}
        publishing={publishing}
        activeRun={activeRun}
      />

      <SupplementaryRunModal
        isOpen={showSuppModal}
        onClose={() => setShowSuppModal(false)}
        onSubmit={handleCreateSupplementary}
      />
    </div>
  );
};

export default PayrollAdminPage;
