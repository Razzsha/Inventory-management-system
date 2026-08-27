export interface Inventoryitem {
  productId: number;
  quantityOnHand: number;
  reorderLevel: number;
  isLowStock: boolean;
  lastUpdated: string | null;
}
