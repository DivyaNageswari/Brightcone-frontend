export interface TaxDeclaration {
  id: string
  employee_id: string
  employee_name: string
  department: string
  financial_year: string
  tax_regime: 'Old' | 'New'
  status: 'Draft' | 'Submitted' | 'Verified' | 'Rejected'
  section_80c: number
  section_80d: number
  section_80ccd_nps: number
  section_24_home_loan: number
  hra_annual_rent: number
  hra_landlord_pan?: string
  hra_landlord_name?: string
  hra_rental_address?: string
  section_80e_education_loan: number
  section_80g_donations: number
  other_exemptions: number
  total_declared: number
  total_verified: number
  proof_attachments_count: number
  rejection_reason?: string
  verification_notes?: string
  submitted_at?: string
  verified_at?: string
  created_at: string
  updated_at: string
}

export interface TaxDeclarationSummary {
  total_declarations: number
  pending_verification: number
  verified_count: number
  rejected_count: number
  draft_count: number
  total_declared_amount: number
  total_verified_amount: number
  old_regime_count: number
  new_regime_count: number
}
