export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'blocked';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  planId: string;
  credits: number;
  status: UserStatus;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  initialCredits: number;
  active: boolean;
  order: number;
  createdAt: string;
}

export interface Generation {
  id: string;
  userId: string;
  prompt: string;
  imageUrl: string;
  creditsConsumed: number;
  createdAt: string;
}

export interface ManualPayment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  creditsReleased: number;
  method: string;
  status: string;
  observations: string;
  confirmedByAdmin: string;
  createdAt: string;
}
