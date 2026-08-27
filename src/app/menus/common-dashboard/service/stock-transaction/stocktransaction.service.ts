import { Injectable } from '@angular/core';
import {
  Stocktransaction,
  StockTransactionType,
} from '../../models/stocktransaction';
import { DatastoreService } from '../data-store/datastore.service';

@Injectable({
  providedIn: 'root',
})
export class StocktransactionService {
  transactions$ = this.store.transaction$;

  constructor(private store: DatastoreService) {}

  load() {
    return this.store.load();
  }

  forProduct(productId: number): Stocktransaction[] {
    return this.store
      .getTransactionsSnapshot()
      .filter((t) => t.productId === productId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  record(
    productId: number,
    type: StockTransactionType,
    quantity: number,
    reference?: string,
    note?: string,
  ): Stocktransaction {
    return this.store.addTransaction({
      productId,
      type,
      quantity,
      reference,
      note,
    });
  }
}
