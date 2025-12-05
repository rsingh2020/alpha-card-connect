export interface Card {
  id: string;
  user_id: string;
  name: string;
  issuer: string;
  network: string;
  last_four?: string;
  balance: number;
  credit_limit: number;
  annual_fee: number;
  reward_type: string;
  reward_balance: number;
  reward_rates: Record<string, number>;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  card_id?: string;
  merchant: string;
  category: string;
  amount: number;
  rewards_earned: number;
  transaction_date: string;
  created_at: string;
}

export interface Offer {
  id: string;
  user_id: string;
  card_id?: string;
  merchant: string;
  description?: string;
  multiplier: number;
  reward_rate: number;
  expires_at?: string;
  is_activated: boolean;
  created_at: string;
}

export interface Benefit {
  id: string;
  user_id: string;
  card_id?: string;
  name: string;
  description?: string;
  reward_amount: number;
  progress: number;
  target: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export type SpendingCategory = 'Dining' | 'Travel' | 'Groceries' | 'Gas' | 'Entertainment' | 'Other';

export const SPENDING_CATEGORIES: SpendingCategory[] = ['Dining', 'Travel', 'Groceries', 'Gas', 'Entertainment', 'Other'];

export const CATEGORY_COLORS: Record<SpendingCategory, string> = {
  Dining: '#F59E0B',
  Travel: '#3B82F6',
  Groceries: '#10B981',
  Gas: '#EF4444',
  Entertainment: '#8B5CF6',
  Other: '#6B7280',
};
