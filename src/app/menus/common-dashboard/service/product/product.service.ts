import { Injectable } from '@angular/core';
import { Product } from '../../models/product';
import { DatastoreService } from '../data-store/datastore.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  products$ = this.store.products$;

  constructor(private store: DatastoreService) {}

  load() {
    return this.store.load();
  }

  getById(id: number): Product | undefined {
    return this.store.getProductsSnapshot().find((p) => p.id === id);
  }

  create(product: Omit<Product, 'id'>): Product {
    return this.store.addProduct(product);
  }

  update(id: number, changes: Partial<Product>): void {
    this.store.updateProduct(id, changes);
  }

  delete(id: number): void {
    this.store.deleteProduct(id);
  }
}
