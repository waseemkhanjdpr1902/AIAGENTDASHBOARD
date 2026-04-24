export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  plan: 'free' | 'pro' | 'practitioner';
  aiUsageCount: number;
  lastUsageReset: string;
  businessName?: string;
  businessGstin?: string;
}

export interface InvoiceItem {
  description: string;
  hsnSac?: string;
  quantity: number;
  rate: number;
  amount: number;
  gstRate: number;
}

export interface Invoice {
  id?: string;
  userId: string;
  invoiceNumber: string;
  date: string;
  businessName: string;
  businessGstin: string;
  businessState: string;
  clientName: string;
  clientGstin: string;
  clientState: string;
  items: InvoiceItem[];
  totalAmount: number;
  totalGst: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  grandTotal: number;
}

export interface AIUsageLog {
  id?: string;
  userId: string;
  tool: string;
  timestamp: string;
  prompt: string;
}
