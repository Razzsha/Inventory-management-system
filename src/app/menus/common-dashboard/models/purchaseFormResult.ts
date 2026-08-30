import { PurchaseLineIem } from "./purchase";

export interface PurchaseFormResult {
  success: boolean;
  data?: {
    supplierName: string;
    poNumber: string;
    items: PurchaseLineIem[];
  }
}
