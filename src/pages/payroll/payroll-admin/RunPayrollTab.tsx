import React from "react";
import { CheckCircle2, Lock, ArrowRight, ArrowLeft, Check } from "lucide-react";
import {
  type PayrollRun,
  type AttendanceSyncItem,
  type VarianceItem,
  type OneTimeInput,
  formatINR,
  paySteps,
} from "./types";
import { AttendanceStep } from "./AttendanceStep";
import { AdjustmentsStep } from "./AdjustmentsStep";
import { VarianceStep } from "./VarianceStep";
import { ApprovalStep } from "./ApprovalStep";
import { DisburseStep } from "./DisburseStep";

interface Props {
  activeRun: PayrollRun | null;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  attendance: AttendanceSyncItem[];
  inputs: OneTimeInput[];
  variances: VarianceItem[];
  financeApproved: boolean;
  setFinanceApproved: (val: boolean) => void;
  financeComments: string;
  setFinanceComments: (val: string) => void;
  onAdvanceStep: () => void;
  onPreviousStep: () => void;
  onOpenPublishModal: () => void;
  onOpenAddModal: () => void;
  onRemoveInput: (id: string) => void;
  onSyncAttendance: () => void;
}

export const RunPayrollTab: React.FC<Props> = ({
  activeRun,
  currentStep,
  setCurrentStep,
  attendance,
  inputs,
  variances,
  financeApproved,
  setFinanceApproved,
  financeComments,
  setFinanceComments,
  onAdvanceStep,
  onPreviousStep,
  onOpenPublishModal,
  onOpenAddModal,
  onRemoveInput,
  onSyncAttendance,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900">
              {activeRun ? activeRun.month : "October 2026"} Run
            </h3>
            <span className="text-xs text-slate-500 font-sans">
              Target Disbursal Date: 31st of the month � Schedule: Monthly Regular
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

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {currentStep > 1 && !activeRun?.is_locked && (
              <button
                onClick={onPreviousStep}
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
                    onClick={onAdvanceStep}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#0B6FDB] hover:bg-[#0958b0] rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    Complete Step {currentStep} & Proceed
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onOpenPublishModal}
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500">Eligible Employees</span>
          <div className="text-xl font-bold font-display text-slate-900 mt-1">
            {activeRun?.total_employees || 14}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">100% attendance synced</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500">Gross Payroll</span>
          <div className="text-xl font-bold font-display text-slate-900 mt-1">
            {formatINR(activeRun?.total_gross || 0)}
          </div>
          <span className="text-[11px] text-slate-500">Includes bonuses & allowances</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500">Total Deductions</span>
          <div className="text-xl font-bold font-display text-slate-900 mt-1">
            {formatINR(activeRun?.total_deductions || 0)}
          </div>
          <span className="text-[11px] text-slate-500">PF, PT, TDS & shortfalls</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500">Net Disbursement</span>
          <div className="text-xl font-bold font-display text-emerald-600 mt-1">
            {formatINR(activeRun?.total_net || 0)}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">To bank ledger</span>
        </div>
      </div>

      {currentStep === 1 && (
        <AttendanceStep attendance={attendance} onSync={onSyncAttendance} />
      )}

      {currentStep === 2 && (
        <AdjustmentsStep
          inputs={inputs}
          isLocked={!!activeRun?.is_locked}
          onOpenAddModal={onOpenAddModal}
          onRemoveInput={onRemoveInput}
        />
      )}

      {currentStep === 3 && <VarianceStep variances={variances} />}

      {currentStep === 4 && (
        <ApprovalStep
          activeRun={activeRun}
          financeApproved={financeApproved}
          setFinanceApproved={setFinanceApproved}
          financeComments={financeComments}
          setFinanceComments={setFinanceComments}
        />
      )}

      {currentStep === 5 && (
        <DisburseStep
          activeRun={activeRun}
          onOpenPublishModal={onOpenPublishModal}
        />
      )}
    </div>
  );
};
