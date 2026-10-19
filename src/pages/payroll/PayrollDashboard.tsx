import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Building,
  DollarSign,
  PieChart,
  Layers,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface MonthlyTrendItem {
  month: string;
  gross: number;
  net: number;
  headcount: number;
}

interface DeptCostItem {
  department: string;
  amount: number;
  percentage: number;
}

interface DashboardMetrics {
  total_gross_current_month: number;
  total_net_current_month: number;
  next_pay_date: string;
  days_until_pay_date: number;
  active_run_month: string;
  active_run_step: number;
  active_run_status: string;
  active_run_is_locked: boolean;
  monthly_trend: MonthlyTrendItem[];
  department_costs: DeptCostItem[];
  claims_waiting_reimbursement: number;
}

export const PayrollDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await axios.get<DashboardMetrics>("/api/payroll/dashboard-metrics");
      setMetrics(res.data);
    } catch (err: any) {
      console.error("Failed to fetch payroll metrics", err);
      setError("Unable to load live payroll metrics.");
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
    "Sync attendance & leave",
    "Add bonuses & deductions",
    "Review variances",
    "Approve payroll",
    "Disburse & publish payslips",
  ];

  const statutoryDeadlines = [
    { title: "Professional Tax, Telangana", due: "10 Oct", status: "Pending", type: "State" },
    { title: "Provident Fund (ECR)", due: "15 Oct", status: "Pending", type: "Statutory" },
    { title: "Employee State Insurance (ESI)", due: "15 Oct", status: "Completed", type: "Statutory" },
    { title: "TDS (Form 24Q) - Q2", due: "31 Oct", status: "Pending", type: "Direct Tax" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {metrics ? metrics.active_run_month : "Current Period"} Active
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Payroll Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-sans">
            {metrics ? metrics.active_run_month : "October 2026"} run, cost trends and statutory deadlines at a glance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/payroll/admin?tab=register")}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            Salary Register
          </button>
          <button
            onClick={() => navigate("/payroll/admin")}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0B6FDB] hover:bg-[#0958b0] rounded-xl transition-all shadow-sm flex items-center gap-2 group cursor-pointer"
          >
            {metrics && metrics.active_run_is_locked
              ? "View Payroll Run"
              : "Continue Payroll Run"}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B6FDB]"></div>
          <p className="mt-3 text-sm text-slate-500">Loading payroll analytics...</p>
        </div>
      ) : metrics ? (
        <>
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Gross Pay */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Gross Pay, {metrics.active_run_month.split(" ")[0]}
                </span>
                <span className="w-9 h-9 rounded-xl bg-blue-50 text-[#0B6FDB] flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl lg:text-3xl font-bold font-display text-slate-900">
                  {formatINR(metrics.total_gross_current_month)}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-600 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+7.5% vs previous cycle</span>
                </div>
              </div>
            </div>

            {/* Net Payout */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Net Payout
                </span>
                <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl lg:text-3xl font-bold font-display text-emerald-600">
                  {formatINR(metrics.total_net_current_month)}
                </div>
                <div className="text-xs text-slate-500 mt-1.5 font-sans">
                  Direct transfer to employee bank accounts
                </div>
              </div>
            </div>

            {/* Total Deductions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Deductions & Tax
                </span>
                <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl lg:text-3xl font-bold font-display text-slate-900">
                  {formatINR(metrics.total_gross_current_month - metrics.total_net_current_month)}
                </div>
                <div className="text-xs text-slate-500 mt-1.5 font-sans">
                  PF, Professional Tax & TDS remittances
                </div>
              </div>
            </div>

            {/* Next Pay Date */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Next Pay Date
                </span>
                <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl lg:text-3xl font-bold font-display text-slate-900">
                  {metrics.next_pay_date}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-700 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {metrics.active_run_is_locked
                      ? "Disbursed & Month Locked"
                      : `${metrics.days_until_pay_date} days remaining`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Claim Banner */}
          {metrics.claims_waiting_reimbursement > 0 && (
            <div className="bg-linear-to-r from-blue-50 to-indigo-50/60 p-4 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Approved Reimbursements Ready for Payroll ({formatINR(metrics.claims_waiting_reimbursement)})
                  </h4>
                  <p className="text-xs text-slate-600">
                    Claims will be automatically disbursed alongside {metrics.active_run_month} salary slips upon month lock.
                  </p>
                </div>
              </div>
              <Link
                to="/payroll/expenses-finance"
                className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
              >
                Review Finance Ledger
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Charts & Active Run Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 6 Months Trend Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Gross Payroll Cost (Last 6 Months)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Monthly commitment trend & headcount growth
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                    In ₹ Lakhs
                  </span>
                </div>

                {/* Bar visualization */}
                <div className="pt-6 pb-2">
                  <div className="flex items-end justify-between gap-3 h-48 border-b border-slate-100 pb-3">
                    {metrics.monthly_trend.map((item, idx) => {
                      const maxGross = Math.max(...metrics.monthly_trend.map((m) => m.gross));
                      const heightPercent = Math.round((item.gross / maxGross) * 100);
                      const isCurrent = idx === metrics.monthly_trend.length - 1;

                      return (
                        <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                          {/* Value tooltip on hover */}
                          <div className="text-[11px] font-semibold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            ₹{(item.gross / 100000).toFixed(1)}L
                          </div>
                          {/* Bar */}
                          <div className="w-full max-w-[48px] bg-slate-100 rounded-t-lg relative flex items-end overflow-hidden h-36">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className={`w-full rounded-t-lg transition-all duration-500 ${
                                isCurrent
                                  ? "bg-linear-to-t from-[#0B6FDB] to-blue-400"
                                  : "bg-slate-300 group-hover:bg-slate-400"
                              }`}
                            ></div>
                          </div>
                          {/* Month Label */}
                          <span
                            className={`text-xs font-medium ${
                              isCurrent ? "text-blue-600 font-bold" : "text-slate-500"
                            }`}
                          >
                            {item.month}
                          </span>
                          <span className="text-[10px] text-slate-400">{item.headcount} emps</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#0B6FDB]"></span> Current Cycle
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-slate-300"></span> Previous Closed
                  </span>
                </div>
                <span>Avg Cost / Head: ₹89,400</span>
              </div>
            </div>

            {/* Active Run Status & 5-Step Progress */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      {metrics.active_run_month} Run
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {metrics.active_run_is_locked
                        ? "Run finalized & locked"
                        : `Step ${metrics.active_run_step} of 5 in progress`}
                    </p>
                  </div>
                  {metrics.active_run_is_locked ? (
                    <span className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                      Completed
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg">
                      Step {metrics.active_run_step} / 5
                    </span>
                  )}
                </div>

                {/* 5-step checklist */}
                <div className="space-y-3 mt-4">
                  {paySteps.map((stepName, idx) => {
                    const stepNumber = idx + 1;
                    const isDone = metrics.active_run_is_locked || stepNumber < metrics.active_run_step;
                    const isCurrent = !metrics.active_run_is_locked && stepNumber === metrics.active_run_step;

                    return (
                      <div
                        key={stepName}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-colors ${
                          isDone
                            ? "bg-emerald-50/40 border-emerald-100 text-slate-700"
                            : isCurrent
                            ? "bg-blue-50/60 border-blue-200 text-slate-900 font-semibold shadow-xs"
                            : "bg-slate-50/60 border-slate-100 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isDone
                                ? "bg-emerald-600 text-white"
                                : isCurrent
                                ? "bg-[#0B6FDB] text-white"
                                : "bg-slate-200 text-slate-500"
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : stepNumber}
                          </span>
                          <span>{stepName}</span>
                        </div>
                        <span className="text-[11px]">
                          {isDone ? (
                            <span className="text-emerald-600 font-medium">Done</span>
                          ) : isCurrent ? (
                            <span className="text-blue-600 font-bold animate-pulse">In Progress</span>
                          ) : (
                            <span className="text-slate-400">Upcoming</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => navigate("/payroll/admin")}
                  className="w-full py-2.5 px-4 bg-[#0B2641] hover:bg-[#081b2f] text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  Open Payroll Run Wizard
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Department Breakdown & Statutory Compliance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Monthly Cost by Department
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Payroll cost distribution across departments
                  </p>
                </div>
                <PieChart className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-4 mt-6">
                {metrics.department_costs.map((dept) => (
                  <div key={dept.department} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{dept.department}</span>
                      <span className="font-bold text-slate-900">
                        {formatINR(dept.amount)} ({dept.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-[#0B6FDB] to-indigo-500 rounded-full"
                        style={{ width: `${dept.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statutory Compliance Deadlines */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Statutory Deadlines
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      State & Central regulatory filing schedules
                    </p>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>

                <div className="divide-y divide-slate-100">
                  {statutoryDeadlines.map((item) => (
                    <div key={item.title} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] min-w-[54px] text-center">
                          {item.due}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900">{item.title}</div>
                          <div className="text-[11px] text-slate-400">{item.type}</div>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => navigate("/payroll/admin?tab=compliance")}
                  className="w-full py-2 text-xs font-semibold text-[#0B6FDB] hover:text-[#0958b0] bg-blue-50/60 hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Manage Compliance & Challans
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center text-rose-500 border border-rose-200">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
          <p className="text-sm font-semibold">{error || "Failed to load dashboard data."}</p>
        </div>
      )}
    </div>
  );
};

export default PayrollDashboard;
