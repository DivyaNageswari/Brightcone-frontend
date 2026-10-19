import React from "react";
import type { AttendanceSyncItem } from "./types";

interface Props {
  attendance: AttendanceSyncItem[];
  onSync: () => void;
}

export const AttendanceStep: React.FC<Props> = ({ attendance, onSync }) => {
  return (
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
          onClick={onSync}
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
  );
};
