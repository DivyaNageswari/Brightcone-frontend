import React, { useState } from "react";
import { Building2, TrendingUp, History, Calculator, Plus, DollarSign } from "lucide-react";
import { useSalaryStructure } from "./salary-structure/useSalaryStructure";
import { StructuresTab } from "./salary-structure/StructuresTab";
import { RevisionsTab } from "./salary-structure/RevisionsTab";
import { HistoryTab } from "./salary-structure/HistoryTab";
import { SalaryCalculatorTab } from "./salary-structure/SalaryCalculatorTab";
import { NewStructureModal, ProposeRevisionModal } from "./salary-structure/StructureModals";

export const SalaryStructurePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"structures" | "revisions" | "history" | "calculator">("structures");
  const [search, setSearch] = useState("");
  const [isStructModalOpen, setIsStructModalOpen] = useState(false);
  const [isRevModalOpen, setIsRevModalOpen] = useState(false);

  const {
    structures,
    revisions,
    history,
    calcInputGross,
    setCalcInputGross,
    calcPfCapped,
    setCalcPfCapped,
    calcRegime,
    setCalcRegime,
    calcResult,
    handleProposeRevision,
    handleApproveRevision,
    handleCreateStructure,
  } = useSalaryStructure();

  const activeStructures = structures.filter((s) => s.is_active);
  const totalPayrollGross = activeStructures.reduce((sum, s) => sum + s.gross_monthly, 0);
  const avgIncrement = Math.round(
    history.reduce((sum, h) => sum + h.increment_percentage, 0) / (history.length || 1)
  );

  return (
    <div className="space-y-6">
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
            ₹{totalPayrollGross.toLocaleString("en-IN")}
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
          <div className="text-[11px] text-txt-faint mt-1">Across historical appraisal cycles</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <History className="w-4 h-4" />
            </span>
            <span>Increment Records</span>
          </div>
          <div className="font-sora text-2xl font-bold text-txt mt-2">
            {history.length}
          </div>
          <div className="text-[11px] text-txt-faint mt-1">Logged promotion and merit records</div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-line pb-3 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab("structures")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === "structures"
              ? "bg-brand text-white font-semibold"
              : "text-txt-muted hover:text-txt hover:bg-surface-secondary"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Active Structures (PAY-09)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-secondary text-txt-muted border border-line">
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

      {activeTab === "structures" && (
        <StructuresTab
          structures={structures}
          search={search}
          onSearchChange={setSearch}
        />
      )}

      {activeTab === "revisions" && (
        <RevisionsTab
          revisions={revisions}
          onApproveRevision={handleApproveRevision}
        />
      )}

      {activeTab === "history" && <HistoryTab history={history} />}

      {activeTab === "calculator" && (
        <SalaryCalculatorTab
          calcInputGross={calcInputGross}
          setCalcInputGross={setCalcInputGross}
          calcRegime={calcRegime}
          setCalcRegime={setCalcRegime}
          calcPfCapped={calcPfCapped}
          setCalcPfCapped={setCalcPfCapped}
          calcResult={calcResult}
        />
      )}

      <NewStructureModal
        isOpen={isStructModalOpen}
        onClose={() => setIsStructModalOpen(false)}
        onSubmit={(data) => {
          handleCreateStructure(data);
          setIsStructModalOpen(false);
        }}
      />

      <ProposeRevisionModal
        isOpen={isRevModalOpen}
        onClose={() => setIsRevModalOpen(false)}
        onSubmit={(data) => {
          handleProposeRevision(data);
          setIsRevModalOpen(false);
        }}
      />
    </div>
  );
};

export default SalaryStructurePage;
