import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs';
import { Inventoryitem } from '../../models/inventoryitem';
import { DatastoreService } from '../data-store/datastore.service';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  inventoryItems$: Observable<Inventoryitem[]> = combineLatest([
    this.store.products$,
    this.store.transaction$,
    this.store.recorderLevel$,
  ]).pipe(
    map(([products, transactions, reorderLevels]) =>
      products.map((product): Inventoryitem => {
        const productTxns = transactions.filter(
          (t) => t.productId === product.id,
        );

        const quantityOnHand = productTxns.reduce(
          (sum, t) => sum + t.quantity,
          0,
        );

        const lastUpdated = productTxns.length
          ? productTxns
              .map((t) => t.createdAt)
              .sort()
              .reverse()[0]
          : null;

        const reorderLevel = reorderLevels[String(product.id)] ?? 0;

        return {
          productId: product.id,
          quantityOnHand,
          reorderLevel,
          isLowStock: quantityOnHand <= reorderLevel,
          lastUpdated,
        };
      }),
    ),
  );

  constructor(private store: DatastoreService) {}

  load() {
    return this.store.load();
  }
}
