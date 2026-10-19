import React from "react";
import { Download } from "lucide-react";
import { formatINR } from "./types";

interface Props {
  onDownloadPack: () => void;
  onMarkFiled: (name: string) => void;
  onDownloadChallan: (name: string) => void;
}

export const ComplianceTab: React.FC<Props> = ({
  onDownloadPack,
  onMarkFiled,
  onDownloadChallan,
}) => {
  const complianceData = [
    { name: "Provident Fund (ECR)", period: "Sep 2026", amt: 136800, due: "15 Oct 2026", status: "Pending" },
    { name: "Employee State Insurance (ESI)", period: "Sep 2026", amt: 0, due: "15 Oct 2026", status: "Completed" },
    { name: "Professional Tax (Telangana)", period: "Sep 2026", amt: 7600, due: "10 Oct 2026", status: "Pending" },
    { name: "TDS (Form 24Q) - Q2", period: "Q2 FY 2026-27", amt: 245000, due: "31 Oct 2026", status: "Pending" },
    { name: "Labour Welfare Fund (LWF)", period: "H1 2026", amt: 228, due: "15 Jul 2026", status: "Completed" },
  ];

  return (
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
          onClick={onDownloadPack}
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
            {complianceData.map((row, i) => (
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
                      onClick={() => onMarkFiled(row.name)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      Mark Filed
                    </button>
                  ) : null}
                  <button
                    onClick={() => onDownloadChallan(row.name)}
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
  );
};
