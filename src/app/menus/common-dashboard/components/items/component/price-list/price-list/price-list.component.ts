import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { Product } from 'src/app/menus/common-dashboard/models/product';
import { ProductService } from 'src/app/menus/common-dashboard/service/product/product.service';
import { ItemgroupService } from 'src/app/menus/common-dashboard/service/item-group/itemgroup.service';
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

  priceGroups: PriceGroup[] = [];
  grandTotal = 0;
  expandedGroupIds = new Set<number>();

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private groupService: ItemgroupService,
  ) {}

  ngOnInit(): void {
    this.filterFormStructure = this.fb.group({ search: [''] });

    this.groupService.load().pipe(takeUntil(this.destroy$)).subscribe();

    combineLatest([
      this.groupService.groups$,
      this.productService.products$,
      this.filterFormStructure.get('search')!.valueChanges.pipe(startWith('')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([groups, products, searchValue]) => {
        const search = (searchValue || '').toLowerCase().trim();
        const matches = (p: Product) =>
          !search ||
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search);

        if (!this.expandedGroupIds.size) {
          groups.forEach((g) => this.expandedGroupIds.add(g.id));
        }
        this.priceGroups = groups
          .map((group) => {
            const groupProducts = products
              .filter((p) => p.categoryId === group.id && matches(p))
              .sort((a, b) => a.name.localeCompare(b.name));

            return {
              id: group.id,
              name: group.name,
              products: groupProducts,
              totalValue: groupProducts.reduce((sum, p) => sum + p.price, 0),
            };
          })
          .filter((g) => g.products.length > 0 || !search);

        this.grandTotal = this.priceGroups.reduce(
          (sum, g) => sum + g.totalValue,
          0,
        );
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleExpand(groupId: number): void {
    this.expandedGroupIds.has(groupId)
      ? this.expandedGroupIds.delete(groupId)
      : this.expandedGroupIds.add(groupId);
  }

  isExpanded(groupId: number): boolean {
    return this.expandedGroupIds.has(groupId);
  }
}
