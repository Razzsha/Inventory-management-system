export type ReturnDirection = 'from-customer' | 'to-supplier';

export interface ReturnLineItem {
  productId: number;
  quantity: number;
}

export interface StockReturn {
  id: number;
  direction: ReturnDirection;
  reference: string; 
  reason: string;
  items: ReturnLineItem[];
  createdAt: string;
}
