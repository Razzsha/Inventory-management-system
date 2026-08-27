import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { Product } from 'src/app/menus/common-dashboard/models/product';
import { ProductService } from '../../service/product/product.service';
import { ItemgroupService } from '../../service/item-group/itemgroup.service';
import { InventoryService } from '../../service/inventory/inventory.service';

interface DashboardRow extends Product {
  categoryName: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  filterForm!: FormGroup;

  items: DashboardRow[] = [];
  filteredItems: DashboardRow[] = [];

  totalItems = 0;
  totalCategories = 0;
  lowStockCount = 0;
  totalInventoryValue = 0;

  categoryBreakdown: { name: string; count: number; percent: number }[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private groupService: ItemgroupService,
    private inventoryService: InventoryService,
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({ search: [''] });

    this.inventoryService.load().pipe(takeUntil(this.destroy$)).subscribe();
    combineLatest([
      this.productService.products$,
      this.groupService.groups$,
      this.inventoryService.inventoryItems$,
      this.filterForm.get('search')!.valueChanges.pipe(startWith('')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([products, groups, inventoryItems, searchValue]) => {
        this.items = products.map((p) => ({
          ...p,
          categoryName:
            groups.find((g) => g.id === p.categoryId)?.name ?? 'Uncategorized',
        }));

        const search = (searchValue || '').toLowerCase().trim();
        this.filteredItems = search
          ? this.items.filter(
              (item) =>
                item.name.toLowerCase().includes(search) ||
                item.sku.toLowerCase().includes(search) ||
                item.categoryName.toLowerCase().includes(search),
            )
          : this.items;
        this.totalItems = this.items.length;
        this.totalCategories = groups.length;
        this.lowStockCount = inventoryItems.filter((i) => i.isLowStock).length;
        this.totalInventoryValue = inventoryItems.reduce((sum, inv) => {
          const product = products.find((p) => p.id === inv.productId);
          return sum + inv.quantityOnHand * (product?.price ?? 0);
        }, 0);

        this.categoryBreakdown = groups.map((g) => {
          const count = this.items.filter((i) => i.categoryId === g.id).length;
          return {
            name: g.name,
            count,
            percent: this.totalItems
              ? Math.round((count / this.totalItems) * 100)
              : 0,
          };
        });
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
