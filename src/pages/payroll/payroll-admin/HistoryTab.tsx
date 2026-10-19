import React from "react";
import { Plus, Lock } from "lucide-react";
import { type PayrollRun, formatINR } from "./types";

interface Props {
  allRuns: PayrollRun[];
  onOpenSuppModal: () => void;
  onExportBankFile: (month: string) => void;
}

export const HistoryTab: React.FC<Props> = ({
  allRuns,
  onOpenSuppModal,
  onExportBankFile,
}) => {
  return (
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
          onClick={onOpenSuppModal}
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
                    onClick={() => onExportBankFile(r.month)}
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
  );
};
