/**
 * Enum types derived from the GraphQL schema
 */
export enum OrgType {
  HOTEL = 'HOTEL',
  GOVERNMENT = 'GOVERNMENT',
  NGO = 'NGO',
  CBO = 'CBO',
  PRIVATE = 'PRIVATE',
  BUSINESS = 'BUSINESS',
}

export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  BUSINESS = 'BUSINESS',
}

// --- Nested Types ---

/**
 * Represents a Normalized User object, as populated and processed by normalizeUser.
 * Fields match the 'id name email phone role' select statement in the resolvers.
 */
export interface NormalizedUser {
  id: string; // Transformed from id
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

/**
 * Represents a Normalized Invoice object, as populated and processed by normalizeInvoice.
 * Fields match the 'id invoiceNumber amount status' select statement.
 */
export interface NormalizedInvoice {
  id: string; // Transformed from id
  invoiceNumber?: string;
  amount?: number;
  status?: string;
}

/**
 * Represents a Normalized Event object, as populated and processed by normalizeEvent.
 * Fields match the 'id title description status' select statement.
 */
export interface NormalizedEvent {
  id: string; // Transformed from id
  title?: string;
  description?: string;
  status?: string;
}

/**
 * Represents a Normalized Payment object, as populated and processed by normalizePayment.
 * Fields match the 'id amount status method' select statement.
 */
export interface NormalizedPayment {
  id: string; // Transformed from id
  amount?: number;
  status?: string;
  method?: string;
}

// --- Primary Organization Type ---

/**
 * Represents the Organization object after full normalization (as returned by normalizeOrg).
 * This structure reflects the data passed to the GraphQL client.
 */
export interface Organization {
  // Base Model Fields
  id: string; // The transformed id
  name: string;
  email: string;
  orgLegalDocuments: string;
  isBlocked: boolean;
  orgType: OrgType;
  subscriptionTier: SubscriptionTier;
  maxEvents: number;
  maxParticipants: number;
  nextBillingDate: string; // Dates are often stringified/Date objects
  createdAt: string;
  updatedAt: string;

  // Populated and Normalized Fields (Arrays may contain nulls if filter/map logic fails)
  createdBy: NormalizedUser | null;
  users: NormalizedUser[];
  admins: NormalizedUser[];
  invoices: (NormalizedInvoice | null)[];
  events: (NormalizedEvent | null)[];
  payments: (NormalizedPayment | null)[];

  // Note: billingAccount is in the GraphQL schema but not populated/normalized in the provided resolver
  // If it were, its type (e.g., NormalizedBillingAccount) would be added here.
}

/**
 * Type for the paginated result wrapper used by organizationsPaginated query.
 */
export interface PaginatedOrganizations {
  data: Organization[];
  total: number;
}