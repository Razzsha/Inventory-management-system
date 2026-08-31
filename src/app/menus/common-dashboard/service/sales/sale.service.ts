import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs';
import { Sale, SaleLineItem } from '../../models/sale';
import { StocktransactionService } from '../stock-transaction/stocktransaction.service';
import { InventoryService } from '../inventory/inventory.service';

const STORAGE_KEY = 'inventorypilot-sale';

@Injectable({
  providedIn: 'root',
})
export class SaleService {

  private nextId = 1;
  private salesSubject = new BehaviorSubject<Sale[]>(this.loadFromStorage());
  sale$ = this.salesSubject.asObservable();

  reservedByProductId$: Observable<Record<number, number>> = this.sale$.pipe(
    map((sales) => {
      const reserved: Record<number, number> = {};
      sales
        .filter((s) => s.status === 'draft')
        .forEach((s) =>
          s.items.forEach((item) => {
            reserved[item.productId] =
              (reserved[item.productId] ?? 0) + item.quantity;
          }),
        );
      return reserved;
    }),
  );

  constructor(
    private txnService: StocktransactionService,
    private inventoryService: InventoryService,
  ) {
    this.nextId = Math.max(0, ...this.salesSubject.value.map((s) => s.id)) + 1;
  }

  getSnapshot(): Sale[] {
    return this.salesSubject.value;
  }

  create(data: {
    customerName: string;
    invoiceNumber: string;
    items: SaleLineItem[];
  }): Sale {
    const newSale: Sale = {
      id: this.nextId++,
      customerName: data.customerName,
      invoiceNumber: data.invoiceNumber,
      items: data.items,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    this.set([newSale, ...this.salesSubject.value]);
    return newSale;
  }

  complete(id: number): boolean {
    const sale = this.salesSubject.value.find((s) => s.id === id);
    if (!sale || sale.status !== 'draft') return false;

    const currentStock = this.inventoryService.getSnapshot();
    const insufficientItem = sale.items.find((item) => {
      const available =
        currentStock.find((i) => i.productId === item.productId)
          ?.quantityOnHand ?? 0;
      return item.quantity > available;
    });
    if (insufficientItem) return false;

    sale.items.forEach((item) => {
      this.txnService.record(
        item.productId,
        'sale',
        -item.quantity,
        sale.invoiceNumber,
        `Sold to ${sale.customerName}`,
      );
    });

    this.set(
      this.salesSubject.value.map((s) =>
        s.id === id ? { ...s, status: 'completed' } : s,
      ),
    );
    return true;
  }

  cancel(id: number): void {
    this.set(
      this.salesSubject.value.map((s) =>
        s.id === id && s.status === 'draft' ? { ...s, status: 'cancelled' } : s,
      ),
    );
  }

  delete(id: number): void {
    this.set(this.salesSubject.value.filter((s) => s.id !== id));
  }

  private set(sales: Sale[]): void {
    this.salesSubject.next(sales);
    this.persist(sales);
  }

  private persist(sales: Sale[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
    } catch (err) {
      console.error('[SaleService] Failed to persist to localStorage', err);
    }
  }
  private loadFromStorage(): Sale[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Sale[]) : [];
    } catch (err) {
      console.error('[SaleService] Failed to read localStorage', err);
      return [];
    }
  }
}
