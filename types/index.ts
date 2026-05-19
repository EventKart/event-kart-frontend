// Domain types — derived directly from backend GraphQL schemas.

export type Role = 'USER' | 'VENDOR' | 'ADMIN';
export type AuthProvider = 'PHONE' | 'GOOGLE';

export interface User {
  id: string;
  phoneNumber?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  address?: string | null;
  role: Role;
  authProvider: AuthProvider;
  isVerified: boolean;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
}

export function isProfileComplete(user: User | null | undefined): boolean {
  if (!user) return false;
  return Boolean(user.firstName?.trim() && user.lastName?.trim());
}

export type VendorType =
  | 'VENUE'
  | 'CATERER'
  | 'DECORATOR'
  | 'PRIEST'
  | 'PHOTOGRAPHER'
  | 'BAND'
  | 'MAKEUP_ARTIST'
  | 'MEHENDI_ARTIST';

export type VendorState =
  | 'DRAFT'
  | 'DOCS_PENDING'
  | 'UNDER_REVIEW'
  | 'AUDIT_SCHEDULED'
  | 'ACTIVE'
  | 'SUSPENDED';

export interface VendorDocuments {
  aadhar: string;
  additionalDocs?: Record<string, string[]>;
}

export interface Vendor {
  id: string;
  type: VendorType;
  state: VendorState;
  name: string;
  contactNumber: string;
  email: string;
  documents: VendorDocuments;
  attributes?: Record<string, unknown>;
}

export interface VendorInput {
  type: VendorType;
  state?: VendorState;
  documents: VendorDocuments;
  name: string;
  contactNumber: string;
  email: string;
  attributes?: Record<string, unknown>;
}

export interface Invitation {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date?: string;
  location?: string;
}

export interface InvitationInput {
  title: string;
  description?: string;
  date?: string;
  location?: string;
}

export interface InvitationStats {
  invitationId: string;
  totalSent: number;
  totalYes: number;
  totalNo: number;
  totalMaybe: number;
  totalNotRsvped: number;
}

export type RSVPStatus = 'YES' | 'NO' | 'MAYBE' | 'NOT_RSVPED';

export type VendorAttributeFieldType = 'STRING' | 'INTEGER' | 'BOOLEAN';

export interface VendorAttributeField {
  key: string;
  type: VendorAttributeFieldType;
  required: boolean;
  label: string;
}

export interface Media {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  ownerId: string;
  mediaType: 'PORTFOLIO' | 'EVENT' | 'INVITATION' | 'TEMPLATE';
  tags: string[];
  fileUrl: string;
  thumbnailUrl: string;
  uploadedAt: string;
}
