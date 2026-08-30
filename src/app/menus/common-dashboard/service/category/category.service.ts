import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Category } from 'src/app/menus/common-dashboard/models/category';

const STORAGE_KEY = 'inventorypilot-categories';

const SEED_CATEGORIES: Category[] = [
  { id: 1, name: 'Cold Drinks', description: 'Soft drinks', isActive: true },
  { id: 2, name: 'Water', description: 'Drinking water', isActive: true },
  { id: 3, name: 'Juice', description: 'Fruit juice', isActive: true },
  {
    id: 4,
    name: 'Energy Drinks',
    description: 'Energy boosters',
    isActive: true,
  },
];

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private nextId = 1;
  private categoriesSubject = new BehaviorSubject<Category[]>(
    this.loadFromStorage(),
  );
  categories$ = this.categoriesSubject.asObservable();

  constructor() {
    const current = this.categoriesSubject.value;
    this.nextId = Math.max(0, ...current.map((c) => c.id)) + 1;
  }

  getSnapshot(): Category[] {
    return this.categoriesSubject.value;
  }

  getById(id: number): Category | undefined {
    return this.categoriesSubject.value.find((c) => c.id === id);
  }

  create(data: Omit<Category, 'id'>): Category {
    const newCategory: Category = { ...data, id: this.nextId++ };
    this.set([newCategory, ...this.categoriesSubject.value]);
    return newCategory;
  }

  update(id: number, changes: Partial<Category>): void {
    this.set(
      this.categoriesSubject.value.map((c) =>
        c.id === id ? { ...c, ...changes } : c,
      ),
    );
  }

  delete(id: number): void {
    this.set(this.categoriesSubject.value.filter((c) => c.id !== id));
  }

  private set(categories: Category[]): void {
    this.categoriesSubject.next(categories);
    this.persist(categories);
  }

  private persist(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch (err) {
      console.error('[CategoryService] Failed to persist to localStorage', err);
    }
  }

  private loadFromStorage(): Category[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Category[]) : SEED_CATEGORIES;
    } catch (err) {
      console.error('[CategoryService] Failed to read localStorage', err);
      return SEED_CATEGORIES;
    }
  }
}
