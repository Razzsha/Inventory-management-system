import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { ProductService } from 'src/app/menus/common-dashboard/service/product/product.service';
import { ItemgroupService } from 'src/app/menus/common-dashboard/service/item-group/itemgroup.service';
import { InventoryService } from 'src/app/menus/common-dashboard/service/inventory/inventory.service';
import { StocktransactionService } from 'src/app/menus/common-dashboard/service/stock-transaction/stocktransaction.service';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { DynamicDrawerService } from 'src/app/shared/services/dynamic-drawer.service';
import { StockAdjustmentComponent } from '../stock-adjustment/stock-adjustment.component';

interface InventoryRow {
  productId: number;
  name: string;
  sku: string;
  categoryName: string;
  price: number;
  quantityOnHand: number;
  reorderLevel: number;
  isLowStock: boolean;
}

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.css'],
})
export class InventoryListComponent implements OnInit, OnDestroy {
  filterForm!: FormGroup;

  rows: InventoryRow[] = [];
  filteredRows: InventoryRow[] = [];

  totalStockValue = 0;
  lowStockCount = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private groupService: ItemgroupService,
    private inventoryService: InventoryService,
    private txnService: StocktransactionService,
    private alert: AlertifyService,
    private _dds: DynamicDrawerService,
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
        this.rows = products.map((product): InventoryRow => {
          const inv = inventoryItems.find((i) => i.productId === product.id);
          return {
            productId: product.id,
            name: product.name,
            sku: product.sku,
            categoryName:
              groups.find((g) => g.id === product.categoryId)?.name ?? 'Uncategorized',
            price: product.price,
            quantityOnHand: inv?.quantityOnHand ?? 0,
            reorderLevel: inv?.reorderLevel ?? 0,
            isLowStock: inv?.isLowStock ?? false,
          };
        });

        this.totalStockValue = this.rows.reduce((sum, r) => sum + r.quantityOnHand * r.price, 0);
        this.lowStockCount = this.rows.filter((r) => r.isLowStock).length;

        const search = (searchValue || '').toLowerCase().trim();
        this.filteredRows = search
          ? this.rows.filter(
              (r) =>
                r.name.toLowerCase().includes(search) ||
                r.sku.toLowerCase().includes(search) ||
                r.categoryName.toLowerCase().includes(search),
            )
          : this.rows;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openAdjustmentDrawer(row: InventoryRow): void {
    const drawerRef = this._dds.openDrawer(
      StockAdjustmentComponent,
      { productName: row.name, currentQuantity: row.quantityOnHand },
      { nzTitle: 'Record Stock Transaction', nzWidth: '440px' },
    );

    drawerRef.afterClose.subscribe((result: any) => {
      if (result?.['success']) {
        this.txnService.record(
          row.productId,
          result['data'].type,
          result['data'].quantity,
          result['data'].reference,
          result['data'].note,
        );
        this.alert.showSuccess('Transaction recorded successfully');
      }
    });
  }
}
