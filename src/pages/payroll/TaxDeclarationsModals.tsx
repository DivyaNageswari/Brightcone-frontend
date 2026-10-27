import React, { useState } from 'react'
import type { TaxDeclaration } from './tax-declarations-types'

export interface CreateTaxDeclarationPayload {
  employee_id: string
  employee_name: string
  department: string
  tax_regime: 'Old' | 'New'
  financial_year: string
  section_80c: number
  section_80d: number
  section_80ccd_nps: number
  section_24_home_loan: number
  hra_annual_rent: number
  status: 'Submitted'
}

export const NewTaxDeclarationModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onCreate: (payload: CreateTaxDeclarationPayload) => void
}> = ({ isOpen, onClose, onCreate }) => {
  const [newEmpId, setNewEmpId] = useState('')
  const [newEmpName, setNewEmpName] = useState('')
  const [newDept, setNewDept] = useState('Engineering')
  const [newRegime, setNewRegime] = useState<'Old' | 'New'>('Old')
  const [new80c, setNew80c] = useState(150000)
  const [new80d, setNew80d] = useState(25000)
  const [newNps, setNewNps] = useState(50000)
  const [newHomeLoan, setNewHomeLoan] = useState(0)
  const [newHra, setNewHra] = useState(0)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate({
      employee_id: newEmpId || 'BC-1015',
      employee_name: newEmpName || 'New Employee',
      department: newDept,
      tax_regime: newRegime,
      financial_year: 'FY 2026-27',
      section_80c: newRegime === 'Old' ? new80c : 0,
      section_80d: newRegime === 'Old' ? new80d : 0,
      section_80ccd_nps: newRegime === 'Old' ? newNps : 0,
      section_24_home_loan: newRegime === 'Old' ? newHomeLoan : 0,
      hra_annual_rent: newRegime === 'Old' ? newHra : 0,
      status: 'Submitted',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#10192A] border border-slate-200 dark:border-[#1E2D4A] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Tax Declaration (FY 2026-27)</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Employee ID</label>
              <input
                type="text"
                required
                placeholder="BC-1015"
                value={newEmpId}
                onChange={(e) => setNewEmpId(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Employee Name</label>
              <input
                type="text"
                required
                placeholder="Divya Kulkarni"
                value={newEmpName}
                onChange={(e) => setNewEmpName(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Department</label>
              <select
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              >
                <option value="Engineering">Engineering</option>
                <option value="People Ops">People Ops</option>
                <option value="Operations">Operations</option>
                <option value="Product">Product</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tax Regime</label>
              <select
                value={newRegime}
                onChange={(e) => setNewRegime(e.target.value as 'Old' | 'New')}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              >
                <option value="Old">Old Regime (With Exemptions)</option>
                <option value="New">New Regime (Section 115BAC)</option>
              </select>
            </div>
          </div>

          {newRegime === 'Old' && (
            <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Deductions (₹)</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500">Sec 80C (PPF, ELSS, EPF)</label>
                  <input
                    type="number"
                    max={150000}
                    value={new80c}
                    onChange={(e) => setNew80c(Number(e.target.value))}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">Sec 80D (Health Insurance)</label>
                  <input
                    type="number"
                    value={new80d}
                    onChange={(e) => setNew80d(Number(e.target.value))}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">Sec 80CCD NPS (Max 50k)</label>
                  <input
                    type="number"
                    max={50000}
                    value={newNps}
                    onChange={(e) => setNewNps(Number(e.target.value))}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">Sec 24 Home Loan Interest</label>
                  <input
                    type="number"
                    max={200000}
                    value={newHomeLoan}
                    onChange={(e) => setNewHomeLoan(Number(e.target.value))}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] text-slate-500">Annual Rent Paid (HRA Exemption)</label>
                  <input
                    type="number"
                    value={newHra}
                    onChange={(e) => setNewHra(Number(e.target.value))}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
            >
              Submit Declaration
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const RejectTaxDeclarationModal: React.FC<{
  isOpen: boolean
  declaration: TaxDeclaration | null
  onClose: () => void
  onConfirm: (reason: string) => void
}> = ({ isOpen, declaration, onClose, onConfirm }) => {
  const [rejectReason, setRejectReason] = useState('')

  if (!isOpen || !declaration) return null

  const handleReject = () => {
    onConfirm(rejectReason || 'Incomplete investment proof submitted.')
    setRejectReason('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#10192A] border border-slate-200 dark:border-[#1E2D4A] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Reject Declaration ({declaration.employee_name})
        </h2>
        <p className="text-xs text-slate-500">
          Please state the reason for rejection (e.g. invalid receipt, PAN mismatch).
        </p>
        <textarea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Enter reason..."
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
        />
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  )
}
