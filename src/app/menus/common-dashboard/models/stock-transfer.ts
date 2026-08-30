export interface TransferLineItem {
  productId: number;
  quantity: number;
}

export interface StockTransfer {
  id: number;
  fromLocation: string;
  toLocation: string;
  items: TransferLineItem[];
  createdAt: string;
}
