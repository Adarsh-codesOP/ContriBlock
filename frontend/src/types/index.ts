// User types
export interface User {
  id: number;
  wallet: string;
  role: UserRole;
  kyc_status: KycStatus;
  name: string | null;
  email: string | null;
  reputation: number;
  created_at: string;
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
  created_at: string;
}

// Contribution types
export interface Contribution {
  id: number;
  title: string;
  description: string;
  status: ContributionStatus;
  user_id: number;
  user: User;
  sector_id: number;
  sector: Sector;
  evidence_url: string;
  feedback: string | null;
  blockchain_tx: string | null;
  created_at: string;
  updated_at: string;
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
  is_verified: boolean;
  contribution_id: number;
  contribution: Contribution;
  evidence_url: string;
  feedback: string | null;
  blockchain_tx: string | null;
  created_at: string;
  updated_at: string;
}

// Marketplace types
export interface MarketplaceItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: number;
  user_id: number;
  user: User;
  item_id: number;
  item: MarketplaceItem;
  blockchain_tx: string;
  created_at: string;
}

// Form types
export interface ContributionFormData {
  title: string;
  description: string;
  sector_id: number;
  evidence_file?: File;
}

export interface ImpactFormData {
  title: string;
  description: string;
  metrics: string;
  contribution_id: number;
  evidence_file?: File;
}

export interface MarketplaceItemFormData {
  name: string;
  description: string;
  price: number;
  image_url?: string;
  active: boolean;
}