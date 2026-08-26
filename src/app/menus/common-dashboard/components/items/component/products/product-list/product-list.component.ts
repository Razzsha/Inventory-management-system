import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CreateProductComponent } from '../create-product/create-product.component';
import { DynamicDrawerService } from 'src/app/shared/services/dynamic-drawer.service';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import {
  TableColumn,
  TableQueryEvent,
} from '../../../../table/reusable-table-new/reusable-table-new.component';
import { ConformationService } from 'src/app/shared/services/conformation.service';
import { Product } from 'src/app/menus/common-dashboard/models/product';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit, AfterViewInit {
  filterFormStructure!: FormGroup;

  private nextId = 5;

  data: Product[] = [];
  loading = false;
  total = 0;
  pageSize = 10;
  pageIndex = 1;
  templates: { [key: string]: TemplateRef<any> } = {};

  /** Comes from the route, e.g. /products/category/2 */
  selectedCategoryId: number | null = null;

  @ViewChild('actionTpl', { static: true }) actionTpl!: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private _dds: DynamicDrawerService,
    private alert: AlertifyService,
    private route: ActivatedRoute,
    private _confirmSrv: ConformationService,
  ) {}

  columns: TableColumn[] = [
    { key: 'sn', title: 'SN' },
    { key: 'sku', title: 'Sku' },
    { key: 'name', title: 'Product Name' },
    { key: 'categoryId', title: 'Category' },
    { key: 'type', title: 'Type' },
    { key: 'price', title: 'price' },
    {
      key: 'actions',
      title: 'Action',
      width: '100px',
      exportable: false,
      align: 'center',
    },
  ];

  private allData: Product[] = [
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
  ];

  ngOnInit(): void {
    this.filterFormStructure = this.fb.group({
      search: [''],
    });

    this.filterFormStructure.get('search')!.valueChanges.subscribe(() => {
      this.pageIndex = 1;
      this.applyFilter();
    });

    // Option B: category comes from the route param and updates whenever it changes.
    this.route.paramMap.subscribe((params) => {
      const catId = params.get('categoryId');
      this.selectedCategoryId = catId ? Number(catId) : null;
      this.pageIndex = 1;
      this.applyFilter();
    });
  }

  ngAfterViewInit(): void {
    this.templates = { actions: this.actionTpl };
  }

  private applyFilter(): void {
    const search = (this.filterFormStructure.get('search')!.value || '')
      .toString()
      .toLowerCase()
      .trim();

    let filtered = this.selectedCategoryId != null
      ? this.allData.filter((c) => c.categoryId === this.selectedCategoryId)
      : this.allData;

    filtered = search
      ? filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(search) ||
            (c.description ?? '').toLowerCase().includes(search),
        )
      : filtered;

    this.total = filtered.length;

    const start = (this.pageIndex - 1) * this.pageSize;
    this.data = filtered.slice(start, start + this.pageSize).map((c, i) => ({
      ...c,
      sn: start + i + 1,
    })) as any;
  }

  onQueryParamsChange(event: TableQueryEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyFilter();
  }

  openCreateDrawer(): void {
    const drawerRef = this._dds.openDrawer(
      CreateProductComponent,
      { mode: 'create', defaultCategoryId: this.selectedCategoryId },
      { nzTitle: 'Create Product', nzWidth: '480px' },
    );

    drawerRef.afterClose.subscribe((result: any) => {
      if (result?.['success']) {
        const newProduct: Product = {
          id: this.nextId++,
          name: result['data'].name,
          sku: result['data'].sku,
          categoryId: result['data'].categoryId,
          type: result['data'].type,
          description: result['data'].description,
          price: result['data'].price,
          status: result['data'].status,
        };
        this.allData.unshift(newProduct);
        this.alert.showSuccess('Product created successfully');
        this.applyFilter();
      }
    });
  }

  openEditDrawer(row: Product): void {
    const drawerRef = this._dds.openDrawer(
      CreateProductComponent,
      { mode: 'edit', product: row, defaultCategoryId: this.selectedCategoryId },
      { nzTitle: 'Edit Product', nzWidth: '480px' },
    );

    drawerRef.afterClose.subscribe((result: any) => {
      if (result?.['success']) {
        const idx = this.allData.findIndex((c) => c.id === row.id);
        if (idx > -1) {
          this.allData[idx] = { ...this.allData[idx], ...result['data'] };
        }
        this.alert.showSuccess('Product updated successfully');
        this.applyFilter();
      }
    });
  }

  deleteCategory(row: Product): void {
    this._confirmSrv.deleteConfirm(() => {
      this.allData = this.allData.filter((c) => c.id !== row.id);
      this.alert.showSuccess('Product deleted successfully');
      this.applyFilter();
    });
  }
}
