import { SaleLineItem } from './sale';

export interface SaleFormResult {
  success: boolean;
  data?: {
    customerName: string;
    invoiceNumber: string;
    items: SaleLineItem[];
  };
}
