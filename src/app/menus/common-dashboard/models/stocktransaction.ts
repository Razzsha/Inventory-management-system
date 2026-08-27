export type StockTransactionType =
  | 'purchase'
  | 'sale'
  | 'adjustment'
  | 'return'
  | 'transfer';

export interface Stocktransaction {
  id: number;
  productId: number;
  type: StockTransactionType;
  quantity: number;
  reference?: string;
  note?: string;
  createdAt: string;
}
