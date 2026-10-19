import React, { useState } from "react";
import { Search, Download } from "lucide-react";
import { type PayrollRun, registerItems, formatINR } from "./types";

interface Props {
  activeRun: PayrollRun | null;
  onDownloadSlip: (name: string) => void;
  onExport: () => void;
}

export const RegisterTab: React.FC<Props> = ({ activeRun, onDownloadSlip, onExport }) => {
  const [regSearch, setRegSearch] = useState("");

  const filteredRegister = registerItems.filter(
    (item) =>
      item.name.toLowerCase().includes(regSearch.toLowerCase()) ||
      item.dept.toLowerCase().includes(regSearch.toLowerCase()) ||
      item.empId.toLowerCase().includes(regSearch.toLowerCase())
  );

  return (
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
            onClick={onExport}
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
                    onClick={() => onDownloadSlip(r.name)}
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
  );
};
