import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { CreateSaleComponent } from '../create-sale/create-sale.component';
import { DynamicDrawerService } from 'src/app/shared/services/dynamic-drawer.service';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { ConformationService } from 'src/app/shared/services/conformation.service';
import { SaleService } from '../../../service/sales/sale.service';
import { Sale } from 'src/app/menus/common-dashboard/models/sale';

interface SaleRow extends Sale {
  itemCount: number;
  totalValue: number;
}

@Component({
  selector: 'app-sale-list',
  templateUrl: './sale-list.component.html',
  styleUrls: ['./sale-list.component.css'],
})
export class SaleListComponent implements OnInit, OnDestroy {
  filterForm!: FormGroup;
  filteredRows: SaleRow[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private _dds: DynamicDrawerService,
    private alert: AlertifyService,
    private _confirmSrv: ConformationService,
    private saleService: SaleService,
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({ search: [''] });

    combineLatest([
  this.saleService.sale$,
  this.filterForm.get('search')!.valueChanges.pipe(startWith('')),
])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([sales, searchValue]) => {
        const rows: SaleRow[] = sales.map((s) => ({
          ...s,
          itemCount: s.items.length,
          totalValue: s.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
        }));

        const search = (searchValue || '').toLowerCase().trim();
        this.filteredRows = search
          ? rows.filter(
              (r) =>
                r.customerName.toLowerCase().includes(search) ||
                r.invoiceNumber.toLowerCase().includes(search),
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
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'blue';
    }
  }

  openCreateDrawer(): void {
    const drawerRef = this._dds.openDrawer(
      CreateSaleComponent,
      {},
      { nzTitle: 'New Sale', nzWidth: '680px' },
    );

    drawerRef.afterClose.subscribe((result: any) => {
      if (result?.['success']) {
        this.saleService.create(result['data']);
        this.alert.showSuccess('Sale saved as draft');
      }
    });
  }

  completeSale(row: SaleRow): void {
    this._confirmSrv.deleteConfirm(() => {
      const success = this.saleService.complete(row.id);
      if (success) {
        this.alert.showSuccess('Sale completed — stock updated');
      } else {
        this.alert.showError('Cannot complete — stock is no longer sufficient for one or more items');
      }
    });
  }

  cancelSale(row: SaleRow): void {
    this._confirmSrv.deleteConfirm(() => {
      this.saleService.cancel(row.id);
      this.alert.showSuccess('Sale cancelled');
    });
  }
}
