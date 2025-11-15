export interface Transaction {
  _id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  type: 'deposit' | 'withdrawal' | 'transfer';
  description: string;
  createdAt: string;
  updatedAt: string;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    position: string;
  };
  company: {
    _id: string;
    name: string;
    industry: string;
    country: string;
  };
}

export interface TransactionFilters {
  createdAt?: string;
  email?: string;
  companyName?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface TransactionResponse {
  data: Transaction[];
  pagination: PaginationInfo;
  executionTime: number;
}
