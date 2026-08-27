import { StockTransactionType } from "./stocktransaction";

export interface StockAdjustmentFormResult {
  success: boolean;
  data?: {
    type: StockTransactionType;
    quantity: number;
    reference?: string;
    note?: string;
  };
}
