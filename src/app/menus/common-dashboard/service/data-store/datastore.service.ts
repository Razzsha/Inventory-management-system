import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { Product } from '../../models/product';
import { ItemGroup } from '../../models/ItemGroup';
import { Stocktransaction } from '../../models/stocktransaction';

interface RawDataFile {
  groups: ItemGroup[];
  products: Product[];
  stockTransactions: Stocktransaction[];
  reorderLevels: Record<string, number>;
}

const STORAGE_KEY = 'inventorypilot-datastore';

@Injectable({ providedIn: 'root' })
export class DatastoreService {
  private loaded$?: Observable<RawDataFile>;

  private groupsSubject = new BehaviorSubject<ItemGroup[]>([]);
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private transactionsSubject = new BehaviorSubject<Stocktransaction[]>([]);
  private reorderLevelsSubject = new BehaviorSubject<Record<string, number>>({});

  groups$ = this.groupsSubject.asObservable();
  products$ = this.productsSubject.asObservable();
  transactions$ = this.transactionsSubject.asObservable();
  reorderLevels$ = this.reorderLevelsSubject.asObservable();

  private nextProductId = 1;
  private nextGroupId = 1;
  private nextTransactionId = 1;

  constructor(private http: HttpClient) {}

  load(): Observable<RawDataFile> {
    if (!this.loaded$) {
      const cached = this.loadFromStorage();

      if (cached) {
        console.log('[DatastoreService] Loaded from localStorage', cached);
        this.hydrate(cached);
        this.loaded$ = new BehaviorSubject(cached).asObservable().pipe(shareReplay(1));
      } else {
        console.log('[DatastoreService] No localStorage data — fetching data.json');
        this.loaded$ = this.http.get<RawDataFile>('assets/data/data.json').pipe(
          tap((data) => {
            this.hydrate(data);
            this.persist();
          }),
          shareReplay(1),
        );
      }
    }
    return this.loaded$;
  }

  private hydrate(data: RawDataFile): void {
    this.groupsSubject.next(data.groups);
    this.productsSubject.next(data.products);
    this.transactionsSubject.next(data.stockTransactions);
    this.reorderLevelsSubject.next(data.reorderLevels);

    this.nextGroupId = Math.max(0, ...data.groups.map((g) => g.id)) + 1;
    this.nextProductId = Math.max(0, ...data.products.map((p) => p.id)) + 1;
    this.nextTransactionId = Math.max(0, ...data.stockTransactions.map((t) => t.id)) + 1;
  }

  private persist(): void {
    try {
      const snapshot: RawDataFile = {
        groups: this.groupsSubject.value,
        products: this.productsSubject.value,
        stockTransactions: this.transactionsSubject.value,
        reorderLevels: this.reorderLevelsSubject.value,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      console.log('[DatastoreService] Persisted to localStorage', snapshot);
    } catch (err) {
      console.error('[DatastoreService] Failed to persist to localStorage', err);
    }
  }

  private loadFromStorage(): RawDataFile | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as RawDataFile) : null;
    } catch (err) {
      console.error('[DatastoreService] Failed to read localStorage', err);
      return null;
    }
  }

  // ---- Products ----
  getProductsSnapshot(): Product[] {
    return this.productsSubject.value;
  }

  addProduct(product: Omit<Product, 'id'>): Product {
    const newProduct: Product = { ...product, id: this.nextProductId++ };
    this.productsSubject.next([newProduct, ...this.productsSubject.value]);
    this.persist();
    return newProduct;
  }

  updateProduct(id: number, changes: Partial<Product>): void {
    this.productsSubject.next(
      this.productsSubject.value.map((p) => (p.id === id ? { ...p, ...changes } : p)),
    );
    this.persist();
  }

  deleteProduct(id: number): void {
    this.productsSubject.next(this.productsSubject.value.filter((p) => p.id !== id));
    this.persist();
  }

  // ---- Item Groups ----
  getGroupsSnapshot(): ItemGroup[] {
    return this.groupsSubject.value;
  }

  addGroup(group: Omit<ItemGroup, 'id'>): ItemGroup {
    const newGroup: ItemGroup = { ...group, id: this.nextGroupId++ };
    this.groupsSubject.next([newGroup, ...this.groupsSubject.value]);
    this.persist();
    return newGroup;
  }

  updateGroup(id: number, changes: Partial<ItemGroup>): void {
    this.groupsSubject.next(
      this.groupsSubject.value.map((g) => (g.id === id ? { ...g, ...changes } : g)),
    );
    this.persist();
  }

  deleteGroup(id: number): void {
    this.groupsSubject.next(this.groupsSubject.value.filter((g) => g.id !== id));
    this.persist();
  }

  getTransactionsSnapshot(): Stocktransaction[] {
    return this.transactionsSubject.value;
  }

  addTransaction(txn: Omit<Stocktransaction, 'id' | 'createdAt'>): Stocktransaction {
    const newTxn: Stocktransaction = {
      ...txn,
      id: this.nextTransactionId++,
      createdAt: new Date().toISOString(),
    };
    this.transactionsSubject.next([newTxn, ...this.transactionsSubject.value]);
    this.persist();
    return newTxn;
  }

  getReorderLevel(productId: number): number {
    return this.reorderLevelsSubject.value[String(productId)] ?? 0;
  }

  setReorderLevel(productId: number, level: number): void {
    this.reorderLevelsSubject.next({
      ...this.reorderLevelsSubject.value,
      [String(productId)]: level,
    });
    this.persist();
  }
}
