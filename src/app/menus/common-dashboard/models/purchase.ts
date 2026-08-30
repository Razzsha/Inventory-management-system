export type PurchaseStatus = 'draft' | 'received' | 'cancelled';

export interface PurchaseLineIem {
  productId: number;
  quantity: number;
  unitCost: number;
}


export interface Purchase {
id: number;
supplierName: string;
poNumber: string;
items: PurchaseLineIem[];
status: 'draft' | 'received' | 'cancelled';
createdAt: string;
}
