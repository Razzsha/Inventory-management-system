import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, share } from 'rxjs';
import { shareReplay, tap } from 'rxjs';
import { Product } from '../../models/product';
import { ItemGroup } from '../../models/ItemGroup';
import { Stocktransaction } from '../../models/stocktransaction';

interface RawDataFile {
  groups: ItemGroup[];
  products: Product[];
  stockTransactions: Stocktransaction[];
  reorderLevels: Record<string, number>;
}

@Injectable({
  providedIn: 'root',
})
export class DatastoreService {
  private loaded$?: Observable<RawDataFile>;

  private groupsSubject = new BehaviorSubject<ItemGroup[]>([]);
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private transactionsSubject = new BehaviorSubject<Stocktransaction[]>([]);
  private reorderLevelSubject = new BehaviorSubject<Record<string, number>>({});

  groups$ = this.groupsSubject.asObservable();
  products$ = this.productsSubject.asObservable();
  transaction$ = this.transactionsSubject.asObservable();
  recorderLevel$ = this.reorderLevelSubject.asObservable();

  private nextProductId = 1;
  private nextgroupId = 1;
  private nextTransactionId = 1;

  constructor(private http: HttpClient) {}

  load(): Observable<RawDataFile> {
    if (!this.loaded$) {
      this.loaded$ = this.http.get<RawDataFile>('assets/data/data.json').pipe(
        tap((data) => {
          this.groupsSubject.next(data.groups);
          this.productsSubject.next(data.products);
          this.transactionsSubject.next(data.stockTransactions);
          this.reorderLevelSubject.next(data.reorderLevels);

          this.nextgroupId = Math.max(0, ...data.groups.map((g) => g.id)) + 1;
          this.nextProductId =
            Math.max(0, ...data.products.map((p) => p.id)) + 1;
          this.nextTransactionId =
            Math.max(0, ...data.stockTransactions.map((t) => t.id)) + 1;
        }),
        shareReplay(1),
      );
    }
    return this.loaded$;
  }

  getProductsSnapshot(): Product[] {
    return this.productsSubject.value;
  }

   addProduct(product: Omit<Product, 'id'>): Product {
    const newProduct: Product = { ...product, id: this.nextProductId++ };
    this.productsSubject.next([newProduct, ...this.productsSubject.value]);
    return newProduct;
  }

  updateProduct(id: number, changes: Partial<Product>): void {
    this.productsSubject.next(
      this.productsSubject.value.map((p) => (p.id === id ? { ...p, ...changes } : p)),
    );
  }

  deleteProduct(id: number): void {
    this.productsSubject.next(this.productsSubject.value.filter((p) => p.id !== id));
  }

  getGroupsSnapshot(): ItemGroup[] {
    return this.groupsSubject.value;
  }

   addGroup(group: Omit<ItemGroup, 'id'>): ItemGroup {
    const newGroup: ItemGroup = { ...group, id: this.nextgroupId++ };
    this.groupsSubject.next([newGroup, ...this.groupsSubject.value]);
    return newGroup;
  }

  updateGroup(id: number, changes: Partial<ItemGroup>): void {
    this.groupsSubject.next(
      this.groupsSubject.value.map((g) => (g.id === id ? { ...g, ...changes } : g)),
    );
  }

  deleteGroup(id: number): void {
    this.groupsSubject.next(this.groupsSubject.value.filter((g) => g.id !== id));
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
    return newTxn;
  }

   getReorderLevel(productId: number): number {
    return this.reorderLevelSubject.value[String(productId)] ?? 0;
  }

  setReorderLevel(productId: number, level: number): void {
    this.reorderLevelSubject.next({
      ...this.reorderLevelSubject.value,
      [String(productId)]: level,
    });
  }
}
