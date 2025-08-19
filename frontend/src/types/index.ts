// User types
export interface User {
  id: number;
  wallet: string;
  role: UserRole;
  kycStatus: KycStatus; // Changed from kyc_status
  name: string | null;
  email: string | null;
  reputation: number;
  createdAt: string; // Changed from created_at
}

export enum UserRole {
  USER = 'USER',
  VERIFIER = 'VERIFIER',
  ADMIN = 'ADMIN',
}

export enum KycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Sector types
export interface Sector {
  id: number;
  name: string;
  description: string;
  createdAt: string; // Changed from created_at
}

// Contribution types
export interface Contribution {
  id: number;
  title: string;
  description: string;
  status: ContributionStatus;
  userId: number; // Changed from user_id
  user: User;
  sectorId: number; // Changed from sector_id
  sector: Sector;
  evidenceUrl: string; // Changed from evidence_url
  feedback: string | null;
  blockchainTx: string | null; // Changed from blockchain_tx
  createdAt: string; // Changed from created_at
  updatedAt: string; // Changed from updated_at
}

export enum ContributionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Impact types
export interface Impact {
  id: number;
  title: string;
  description: string;
  metrics: string;
  isVerified: boolean;
  contributionId: number;
  contribution: Contribution;
  evidenceUrl: string;
  feedback: string | null;
  blockchainTx: string | null;
  createdAt: string;
  updatedAt: string;
  value: number;
  tokensAwarded: number;
}

// Marketplace types
export interface MarketplaceItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null; // Changed from image_url
  active: boolean;
  createdAt: string; // Changed from created_at
  updatedAt: string; // Changed from updated_at
  quantity: number; // Add this missing property
}

// Purchase types
export interface Purchase {
  id: number;
  userId: number; // Changed from user_id
  user: User;
  itemId: number; // Changed from item_id
  item: MarketplaceItem;
  blockchainTx: string; // Changed from blockchain_tx
  createdAt: string; // Changed from created_at
  purchaseDate: string; // Add this missing property
  price: number; // Add this missing property
  redeemCode: string | null; // Add this missing property
}

// Form types
export interface ContributionFormData {
  title: string;
  description: string;
  sectorId: number;
  evidenceFile?: File;
  evidenceUrl?: string;
  imageUrl?: string;
}

export interface ImpactFormData {
  title: string;
  description: string;
  metrics: string;
  contributionId: number; // Changed from contribution_id
  evidenceFile?: File; // Changed from evidence_file
}

// Marketplace item form data
export interface MarketplaceItemFormData {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  active?: boolean;
  imageFile?: File;
  category?: string;
  expirationDate?: string;
}