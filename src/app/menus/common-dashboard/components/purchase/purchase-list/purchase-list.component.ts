import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { CreatePurchaseComponent } from '../create-purchase/create-purchase.component';
import { DynamicDrawerService } from 'src/app/shared/services/dynamic-drawer.service';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { ConformationService } from 'src/app/shared/services/conformation.service';
import { PurchaseService } from 'src/app/menus/common-dashboard/service/purchase/purchase.service';
import { ProductService } from 'src/app/menus/common-dashboard/service/product/product.service';
import { Purchase } from 'src/app/menus/common-dashboard/models/purchase';
import { Product } from '../../../models/product';

interface PurchaseRow extends Purchase {
  itemCount: number;
  totalValue: number;
}

@Component({
  selector: 'app-purchase-list',
  templateUrl: './purchase-list.component.html',
  styleUrls: ['./purchase-list.component.css'],
})
export class PurchaseListComponent implements OnInit, OnDestroy {
  filterForm!: FormGroup;
  filteredRows: PurchaseRow[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private _dds: DynamicDrawerService,
    private alert: AlertifyService,
    private _confirmSrv: ConformationService,
    private purchaseService: PurchaseService,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({ search: [''] });

    this.productService.load().pipe(takeUntil(this.destroy$)).subscribe();

    combineLatest([
      this.purchaseService.purchases$,
      this.filterForm.get('search')!.valueChanges.pipe(startWith('')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([purchases, searchValue]) => {
        const rows: PurchaseRow[] = purchases.map((p) => ({
          ...p,
          itemCount: p.items.length,
          totalValue: p.items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0),
        }));

        const search = (searchValue || '').toLowerCase().trim();
        this.filteredRows = search
          ? rows.filter(
              (r) =>
                r.supplierName.toLowerCase().includes(search) ||
                r.poNumber.toLowerCase().includes(search),
            )
          : rows;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  statusColor(status: string): string {
    switch (status) {
      case 'received':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'blue';
    }
  }

  openCreateDrawer(): void {
    const drawerRef = this._dds.openDrawer(
      CreatePurchaseComponent,
      {},
      { nzTitle: 'New Purchase', nzWidth: '640px' },
    );

    drawerRef.afterClose.subscribe((result: any) => {
      if (result?.['success']) {
        this.purchaseService.create(result['data']);
        this.alert.showSuccess('Purchase saved as draft');
      }
    });
  }

  receivePurchase(row: PurchaseRow): void {
    this._confirmSrv.deleteConfirm(() => {
      this.purchaseService.received(row.id);
      this.alert.showSuccess('Purchase received — stock updated');
    });
  }

  cancelPurchase(row: PurchaseRow): void {
    this._confirmSrv.deleteConfirm(() => {
      this.purchaseService.cancel(row.id);
      this.alert.showSuccess('Purchase cancelled');
    });
  }
}
