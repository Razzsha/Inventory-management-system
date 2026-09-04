import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
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

declare var $: any;

interface PurchaseRow extends Purchase {
  itemCount: number;
  totalValue: number;
}

@Component({
  selector: 'app-purchase-list',
  templateUrl: './purchase-list.component.html',
  styleUrls: ['./purchase-list.component.css'],
})
export class PurchaseListComponent implements OnInit, AfterViewInit, OnDestroy {
  filterForm!: FormGroup;
  filteredRows: PurchaseRow[] = [];

  @ViewChild('pqGridContainer', { static: true }) pqGridContainer!: ElementRef<HTMLDivElement>;
  private gridInitialized = false;

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

        this.refreshPqGrid();
      });
  }

  ngAfterViewInit(): void {
    this.initPqGrid();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyPqGrid();
  }

  private destroyPqGrid(): void {
    const $el = $(this.pqGridContainer.nativeElement);
    if (!$el.length) return;

    try {
      if ($el.pqGrid('instance')) {
        $el.pqGrid('destroy');
      }
    } catch {
      // No instance attached — nothing to destroy.
    }
    this.gridInitialized = false;
  }

  private initPqGrid(): void {
    if (this.gridInitialized) {
      return;
    }

    // Defensive: make sure nothing stale is already attached to this
    // container before we build a new grid on top of it.
    this.destroyPqGrid();
    this.gridInitialized = true;

    const self = this;

    ($(this.pqGridContainer.nativeElement) as any).pqGrid({
      width: '100%',
      height: 460,
      selectionModel: { type: 'row' },
      editModel: {
        saveKey: 13,        // Enter saves the cell being edited
        clicksToEdit: 2,    // double-click a cell to start editing
      },
      colModel: [
        { title: 'PO Number', dataIndx: 'poNumber', width: 130, editable: false },
        { title: 'Supplier', dataIndx: 'supplierName', width: 160, editable: true },
        {
          title: 'Items',
          dataIndx: 'itemCount',
          width: 80,
          align: 'right',
          dataType: 'integer',
          editable: false,
        },
        {
          title: 'Total',
          dataIndx: 'totalValue',
          width: 120,
          align: 'right',
          editable: false,
          render: (ui: any) => 'Rs. ' + Number(ui.rowData.totalValue).toFixed(2),
        },
        {
          title: 'Status',
          dataIndx: 'status',
          width: 110,
          editable: true,
          editor: {
            type: 'select',
            options: {
              listData: [
                { value: 'draft', label: 'draft' },
                { value: 'received', label: 'received' },
                { value: 'cancelled', label: 'cancelled' },
              ],
            },
          },
          render: (ui: any) => {
            const color =
              ui.rowData.status === 'received' ? '#52c41a' :
              ui.rowData.status === 'cancelled' ? '#f5222d' : '#1890ff';
            return `<span style="padding:2px 8px;border-radius:4px;color:#fff;background:${color}">${ui.rowData.status}</span>`;
          },
        },
        {
          title: 'Date',
          dataIndx: 'createdAt',
          width: 130,
          editable: false,
          render: (ui: any) =>
            new Date(ui.rowData.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
        },
        {
          title: 'Action',
          dataIndx: 'actions',
          width: 100,
          align: 'center',
          sortable: false,
          editable: false,
          render: (ui: any) => {
            if (ui.rowData.status !== 'draft') {
              return '';
            }
            return `
              <button class="pq-receive-btn" data-id="${ui.rowData.id}" style="border:none;background:transparent;cursor:pointer;color:#52c41a" title="Mark as Received">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </button>
              <button class="pq-cancel-btn" data-id="${ui.rowData.id}" style="border:none;background:transparent;cursor:pointer;color:#f5222d" title="Cancel">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </button>
            `;
          },
        },
      ],
      dataModel: { data: this.filteredRows },

      // fires after a cell edit is committed (Enter key or blur)
      dataChange: (evt: any, ui: any) => {
        const updated = ui.rowData;
        self.purchaseService.update(updated.id, updated);
        self.alert.showSuccess('Purchase updated');
      },

      click: (evt: any) => {
        const target = $(evt.target).closest('button');
        if (!target.length) {
          return;
        }
        const id = target.data('id');
        const row = self.filteredRows.find((r) => r.id === id);
        if (!row) {
          return;
        }
        if (target.hasClass('pq-receive-btn')) {
          self.receivePurchase(row);
        } else if (target.hasClass('pq-cancel-btn')) {
          self.cancelPurchase(row);
        }
      },
    });
  }

  private refreshPqGrid(): void {
    if (!this.gridInitialized) {
      return;
    }
    ($(this.pqGridContainer.nativeElement) as any).pqGrid('option', 'dataModel.data', this.filteredRows);
    ($(this.pqGridContainer.nativeElement) as any).pqGrid('refreshDataAndView');
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
