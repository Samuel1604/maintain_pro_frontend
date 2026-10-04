export type AssignmentSort = 'proximity' | 'rating' | 'experience'

export type AssignmentPath = 'internal' | 'vendor' | 'independent'

/** Vendor portal account owner (default role on vendor signup) */
export interface VendorManagerProfile {
  id: string
  name: string
  email: string
  phone?: string
  vendorId: string
}

export interface VendorTechnicianProfile {
  id: string
  name: string
  vendorId: string
  rating: number
  yearsExperience: number
  completedJobs: number
  specialties: string[]
  distanceKm?: number | null
  available: boolean
}

export interface VendorAssignmentOption {
  vendorId: string
  vendorName: string
  rating: number
  completedJobs: number
  distanceKm?: number | null
  serviceCategories: string[]
  categoryMatch: boolean
  manager: VendorManagerProfile
  technicians: VendorTechnicianProfile[]
}

/** Independent technician — receives job offers and accepts/rejects with reason */
export interface IndependentTechnicianOption {
  id: string
  name: string
  email: string
  rating: number
  yearsExperience: number
  completedJobs: number
  specialties: string[]
  distanceKm?: number | null
  availability: 'available' | 'busy'
}

export interface AssignmentOptionsResult {
  vendors: VendorAssignmentOption[]
  independents: IndependentTechnicianOption[]
}
