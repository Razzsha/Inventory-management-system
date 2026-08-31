export type SaleStatus = 'draft' | 'completed' | 'cancelled';
export interface SaleLineItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface Sale {
   id: number;
  customerName: string;
  invoiceNumber: string;
  items: SaleLineItem[];
  status: SaleStatus;
  createdAt: string;
}
