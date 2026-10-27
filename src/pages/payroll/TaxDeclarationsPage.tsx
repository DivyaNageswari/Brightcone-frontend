import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Search, CheckCircle, XCircle, Plus } from 'lucide-react'
import type { TaxDeclaration, TaxDeclarationSummary } from './tax-declarations-types'
import { INITIAL_TAX_DECLARATIONS, INITIAL_TAX_SUMMARY } from './tax-declarations-data'
import {
  NewTaxDeclarationModal,
  RejectTaxDeclarationModal,
  type CreateTaxDeclarationPayload,
} from './TaxDeclarationsModals'

export const TaxDeclarationsPage: React.FC = () => {
  const [declarations, setDeclarations] = useState<TaxDeclaration[]>([])
  const [summary, setSummary] = useState<TaxDeclarationSummary | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [regimeFilter, setRegimeFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDecl, setSelectedDecl] = useState<TaxDeclaration | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)

  const fetchDeclarations = async () => {
    try {
      const res = await axios.get<TaxDeclaration[]>('/api/tax-declarations')
      setDeclarations(res.data)
    } catch {
      setDeclarations(INITIAL_TAX_DECLARATIONS)
    }

    try {
      const summaryRes = await axios.get<TaxDeclarationSummary>('/api/tax-declarations/summary')
      setSummary(summaryRes.data)
    } catch {
      setSummary(INITIAL_TAX_SUMMARY)
    }
  }

  useEffect(() => {
    fetchDeclarations()
  }, [])

  const handleVerify = async (id: string) => {
    try {
      await axios.post(`/api/tax-declarations/${id}/verify`, {
        verification_notes: 'Verified and approved by Finance.',
      })
      fetchDeclarations()
    } catch {
      setDeclarations((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, status: 'Verified', total_verified: d.total_declared } : d,
        ),
      )
    }
  }

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedDecl) return
    try {
      await axios.post(`/api/tax-declarations/${selectedDecl.id}/reject`, {
        reason,
      })
      fetchDeclarations()
    } catch {
      setDeclarations((prev) =>
        prev.map((d) =>
          d.id === selectedDecl.id ? { ...d, status: 'Rejected', rejection_reason: reason } : d,
        ),
      )
    }
    setRejectModalOpen(false)
    setSelectedDecl(null)
  }

  const handleCreate = async (payload: CreateTaxDeclarationPayload) => {
    try {
      await axios.post('/api/tax-declarations', payload)
      fetchDeclarations()
    } catch {
      const newD: TaxDeclaration = {
        id: `TD-2026-${Date.now().toString().slice(-4)}`,
        employee_id: payload.employee_id,
        employee_name: payload.employee_name,
        department: payload.department,
        financial_year: payload.financial_year,
        tax_regime: payload.tax_regime,
        status: 'Submitted',
        section_80c: payload.section_80c,
        section_80d: payload.section_80d,
        section_80ccd_nps: payload.section_80ccd_nps,
        section_24_home_loan: payload.section_24_home_loan,
        hra_annual_rent: payload.hra_annual_rent,
        section_80e_education_loan: 0,
        section_80g_donations: 0,
        other_exemptions: 0,
        total_declared:
          payload.section_80c +
          payload.section_80d +
          payload.section_80ccd_nps +
          payload.section_24_home_loan +
          payload.hra_annual_rent,
        total_verified: 0,
        proof_attachments_count: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setDeclarations((prev) => [newD, ...prev])
    }
    setModalOpen(false)
  }

  const filtered = declarations.filter((d) => {
    const matchesSearch =
      d.employee_name.toLowerCase().includes(search.toLowerCase()) ||
      d.employee_id.toLowerCase().includes(search.toLowerCase()) ||
      d.department.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter
    const matchesRegime = regimeFilter === 'All' || d.tax_regime === regimeFilter
    return matchesSearch && matchesStatus && matchesRegime
  })

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative rounded-2xl border border-emerald-700/30 bg-gradient-to-r from-[#042d22] via-[#064736] to-[#02261d] p-6 lg:p-8 shadow-xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
                INCOME TAX & COMPLIANCE
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Tax Declarations (Form 12BB)
            </h1>
            <p className="text-slate-300 text-sm lg:text-base mt-1.5 max-w-xl">
              FY 2026-27 Investment declarations, Section 80C/80D deductions and regime election.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={17} />
              <span>New Declaration</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Declarations
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {summary?.total_declarations ?? declarations.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {summary?.old_regime_count ?? 0} Old Regime • {summary?.new_regime_count ?? 0} New Regime
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Pending Verification
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {summary?.pending_verification ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Awaiting HR/Finance review</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Total Declared
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ₹{(summary?.total_declared_amount ?? 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">Under Section 80C, 80D, HRA</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Verified Amount
          </div>
          <div className="text-2xl font-black text-emerald-500 mt-1">
            ₹{(summary?.total_verified_amount ?? 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">Deducted from taxable CTC</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A]">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted (Pending)</option>
            <option value="Verified">Verified</option>
            <option value="Draft">Draft</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={regimeFilter}
            onChange={(e) => setRegimeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="All">All Regimes</option>
            <option value="Old">Old Regime</option>
            <option value="New">New Regime</option>
          </select>
        </div>
      </div>

      {/* Declarations Table */}
      <div className="rounded-2xl bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-3">Regime</th>
                <th className="py-3 px-3">80C (Max 1.5L)</th>
                <th className="py-3 px-3">80D (Health)</th>
                <th className="py-3 px-3">HRA Rent</th>
                <th className="py-3 px-3">Total Declared</th>
                <th className="py-3 px-3">Verified</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{d.employee_name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {d.employee_id} • {d.department}
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.tax_regime === 'New'
                          ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                      }`}
                    >
                      {d.tax_regime}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-medium">₹{d.section_80c.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-3 font-medium">₹{d.section_80d.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-3 font-medium">₹{d.hra_annual_rent.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                    ₹{d.total_declared.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{d.total_verified.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        d.status === 'Verified'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : d.status === 'Submitted'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          : d.status === 'Rejected'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {d.status !== 'Verified' && (
                        <button
                          onClick={() => handleVerify(d.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle size={13} />
                          <span>Verify</span>
                        </button>
                      )}
                      {d.status !== 'Rejected' && d.status !== 'Verified' && (
                        <button
                          onClick={() => {
                            setSelectedDecl(d)
                            setRejectModalOpen(true)
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950/80 dark:hover:bg-rose-900 dark:text-rose-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <XCircle size={13} />
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Declaration Modal */}
      <NewTaxDeclarationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />

      {/* Reject Modal */}
      <RejectTaxDeclarationModal
        isOpen={rejectModalOpen}
        declaration={selectedDecl}
        onClose={() => {
          setRejectModalOpen(false)
          setSelectedDecl(null)
        }}
        onConfirm={handleRejectConfirm}
      />
    </div>
  )
}

export default TaxDeclarationsPage
