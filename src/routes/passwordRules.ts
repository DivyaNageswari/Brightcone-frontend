import { z } from 'zod'

// Quick feedback in the browser. The server applies the same rules (and a common-password list)
// and is the one that decides.
export const passwordRules = z
  .string()
  .min(12, 'Password must be at least 12 characters long.')
  .refine((p) => new Set(p).size > 1, 'Password must not be a single repeated character.')
