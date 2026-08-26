import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Product } from 'src/app/menus/common-dashboard/models/product';
import { ItemGroup } from 'src/app/menus/common-dashboard/models/ItemGroup';

interface PriceGroup {
  id: number;
  name: string;
  products: Product[];
  totalValue: number;
}

@Component({
  selector: 'app-price-list',
  templateUrl: './price-list.component.html',
  styleUrls: ['./price-list.component.css'],
})
export class PriceListComponent implements OnInit {
  filterFormStructure!: FormGroup;

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
      status: true,
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

  priceGroups: PriceGroup[] = [];
  grandTotal = 0;

  expandedGroupIds = new Set<number>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filterFormStructure = this.fb.group({
      search: [''],
    });

    this.filterFormStructure.get('search')!.valueChanges.subscribe(() => {
      this.buildPriceGroups();
    });

    this.groups.forEach((g) => this.expandedGroupIds.add(g.id));

    this.buildPriceGroups();
  }

  private buildPriceGroups(): void {
    const search = (this.filterFormStructure.get('search')!.value || '')
      .toString()
      .toLowerCase()
      .trim();

    const matches = (p: Product) =>
      !search ||
      p.name.toLowerCase().includes(search) ||
      p.sku.toLowerCase().includes(search);

    this.priceGroups = this.groups
      .map((group) => {
        const products = this.allProducts
          .filter((p) => p.categoryId === group.id && matches(p))
          .sort((a, b) => a.name.localeCompare(b.name));

        return {
          id: group.id,
          name: group.name,
          products,
          totalValue: products.reduce((sum, p) => sum + p.price, 0),
        };
      })
      .filter((g) => g.products.length > 0 || !search);

    this.grandTotal = this.priceGroups.reduce((sum, g) => sum + g.totalValue, 0);
  }

  toggleExpand(groupId: number): void {
    if (this.expandedGroupIds.has(groupId)) {
      this.expandedGroupIds.delete(groupId);
    } else {
      this.expandedGroupIds.add(groupId);
    }
  }

  isExpanded(groupId: number): boolean {
    return this.expandedGroupIds.has(groupId);
  }
}
