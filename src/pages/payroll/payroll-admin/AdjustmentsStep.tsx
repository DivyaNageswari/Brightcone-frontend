import React from "react";
import { Plus, X } from "lucide-react";
import { type OneTimeInput, formatINR } from "./types";

interface Props {
  inputs: OneTimeInput[];
  isLocked: boolean;
  onOpenAddModal: () => void;
  onRemoveInput: (id: string) => void;
}

export const AdjustmentsStep: React.FC<Props> = ({
  inputs,
  isLocked,
  onOpenAddModal,
  onRemoveInput,
}) => {
  return (
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
        {!isLocked && (
          <button
            onClick={onOpenAddModal}
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
              {!isLocked && <th className="py-3 px-4 text-center">Action</th>}
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
                {!isLocked && (
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onRemoveInput(item.id)}
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
  );
};
