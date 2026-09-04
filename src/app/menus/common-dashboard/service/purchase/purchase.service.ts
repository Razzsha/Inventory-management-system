import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Purchase, PurchaseLineIem } from '../../models/purchase';
import { StocktransactionService } from '../stock-transaction/stocktransaction.service';

const STORAGE_KEY = 'inventorypilot-purchases';

@Injectable({
  providedIn: 'root',
})
export class PurchaseService {
  update(id: any, updated: any) {
    throw new Error('Method not implemented.');
  }
  private nextId = 1;
  private purchaseSubject = new BehaviorSubject<Purchase[]>(this.loadFromStorage());
  purchases$ = this.purchaseSubject.asObservable();

  constructor(private txnService: StocktransactionService) {
    this.nextId = Math.max(0, ...this.purchaseSubject.value.map((p) => p.id)) + 1;
  }

  getSnapshot(): Purchase[] {
    return this.purchaseSubject.value;
  }

  create(data: {
    supplierName: string;
    poNumber: string;
    items: PurchaseLineIem[];
  }): Purchase {
    const newPurchase: Purchase = {
      id: this.nextId++,
      supplierName: data.supplierName,
      poNumber: data.poNumber,
      items: data.items,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    this.set([newPurchase, ...this.purchaseSubject.value]);
    return newPurchase;
  }

  received(id: number): void {
    const purchase = this.purchaseSubject.value.find((p) => p.id === id);
    if (!purchase || purchase.status !== 'draft') return;

    purchase.items.forEach((item) => {
      this.txnService.record(
        item.productId,
        'purchase',
        item.quantity,
        purchase.poNumber,
        `Received from ${purchase.supplierName}`,
      );
    });
    this.set(
      this.purchaseSubject.value.map((p) =>
        p.id === id ? { ...p, status: 'received' } : p,
      ),
    );
  }

  cancel(id: number): void {
    this.set(
      this.purchaseSubject.value.map((p) =>
        p.id === id && p.status === 'draft' ? { ...p, status: 'cancelled' } : p,
      ),
    );
  }

  delete(id: number): void {
    this.set(this.purchaseSubject.value.filter((p) => p.id !== id));
  }

  private set(purchases: Purchase[]): void {
    this.purchaseSubject.next(purchases);
    this.persist(purchases);
  }

  private persist(purchases: Purchase[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
    } catch (err) {
      console.error('[PurchaseService] Failed to persist to localStorage', err);
    }
  }

  private loadFromStorage(): Purchase[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Purchase[]) : [];
    } catch (err) {
      console.error('[PurchaseService] Failed to read localStorage', err);
      return [];
    }
  }
}
