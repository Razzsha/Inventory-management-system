import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Product } from 'src/app/menus/common-dashboard/models/product';
import { ItemGroup } from '../../models/ItemGroup';

interface DashboardRow extends Product {
  categoryName: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  filterForm!: FormGroup;

  // Same mock source used across product-list / item-group-list / price-list.
  // Should move to a shared ProductService + ItemGroupService.
  groups: ItemGroup[] = [
    { id: 1, name: 'Cold Drinks', description: 'Beverages served cold', status: true },
    { id: 2, name: 'Snacks', description: 'Packaged snack items', status: true },
    { id: 3, name: 'Dairy', description: 'Milk and dairy products', status: true },
  ];

  private allProducts: Product[] = [
    {
      id: 1,
      name: 'Coca Cola 250ml',
      sku: 'cd-001',
      categoryId: 1,
      type: 'unit',
      description: 'Coca Cola 250ml bottle',
      price: 100,
      status: true,
    },
    {
      id: 2,
      name: 'Coca Cola 500ml',
      sku: 'cd-002',
      categoryId: 1,
      type: 'unit',
      description: 'Coca Cola 500ml bottle',
      price: 200,
      status: false,
    },
    {
      id: 3,
      name: 'Lays Classic',
      sku: 'sn-001',
      categoryId: 2,
      type: 'unit',
      description: 'Lays classic salted 50g',
      price: 30,
      status: true,
    },
    {
      id: 4,
      name: 'Amul Milk 500ml',
      sku: 'dy-001',
      categoryId: 3,
      type: 'unit',
      description: 'Amul toned milk 500ml',
      price: 35,
      status: true,
    },
  ];

  items: DashboardRow[] = [];
  filteredItems: DashboardRow[] = [];

  totalItems = 0;
  totalCategories = 0;
  inactiveCount = 0;
  totalInventoryValue = 0;

  categoryBreakdown: { name: string; count: number; percent: number }[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.items = this.allProducts.map((p) => ({
      ...p,
      categoryName: this.groups.find((g) => g.id === p.categoryId)?.name ?? 'Uncategorized',
    }));
    this.filteredItems = [...this.items];

    this.computeStats();

    this.filterForm = this.fb.group({
      search: [''],
    });

    this.filterForm.get('search')?.valueChanges.subscribe((value) => {
      const search = (value || '').toLowerCase().trim();

      this.filteredItems = this.items.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.sku.toLowerCase().includes(search) ||
          item.categoryName.toLowerCase().includes(search),
      );
    });
  }

  private computeStats(): void {
    this.totalItems = this.items.length;
    this.totalCategories = this.groups.length;
    this.inactiveCount = this.items.filter((i) => !i.status).length;
    this.totalInventoryValue = this.items.reduce((sum, i) => sum + i.price, 0);

    this.categoryBreakdown = this.groups.map((g) => {
      const count = this.items.filter((i) => i.categoryId === g.id).length;
      return {
        name: g.name,
        count,
        percent: this.totalItems ? Math.round((count / this.totalItems) * 100) : 0,
      };
    });
  }
}
