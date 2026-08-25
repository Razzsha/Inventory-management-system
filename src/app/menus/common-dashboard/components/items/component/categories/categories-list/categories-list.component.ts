import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CreateCategoriesComponent } from '../create-categories/create-categories.component';
import { DynamicDrawerService } from 'src/app/shared/services/dynamic-drawer.service';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import {
  TableColumn,
  TableQueryEvent,
} from '../../../../table/reusable-table-new/reusable-table-new.component';
import { ConformationService } from 'src/app/shared/services/conformation.service';
import { Router } from '@angular/router';
import { Category } from 'src/app/menus/common-dashboard/models/category';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.css'],
})
export class CategoriesListComponent implements OnInit {
  filterFormStructure!: FormGroup;

  private nextId = 5;

  data: Category[] = [];
  loading = false;
  total = 0;
  pageSize = 10;
  pageIndex = 1;
  templates: { [key: string]: TemplateRef<any> } = {};

  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;
  @ViewChild('titleTpl', { static: true }) titleTpl!: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private _dds: DynamicDrawerService,
    private alert: AlertifyService,
    private router: Router,
    private _confirmSrv: ConformationService,
  ) {}

  columns: TableColumn[] = [
    { key: 'sn', title: 'SN', width: '60px', exportable: false },
    { key: 'name', title: 'Category Name' },
    { key: 'description', title: 'Description', ellipsis: true },
    { key: 'isActive', title: 'Status', align: 'center', template: undefined },
    {
      key: 'actions',
      title: 'Action',
      width: '100px',
      exportable: false,
      align: 'center',
    },
  ];

  private allData: Category[] = [
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

  ngOnInit(): void {
    this.filterFormStructure = this.fb.group({
      search: [''],
    });

    this.templates = {
      isActive: this.statusTpl,
      actions: this.actionsTpl,
      name: this.titleTpl,
    };

    this.filterFormStructure.get('search')!.valueChanges.subscribe(() => {
      this.pageIndex = 1;
      this.applyFilter();
    });

    this.applyFilter();
  }

  private applyFilter(): void {
    const search = (this.filterFormStructure.get('search')!.value || '')
      .toString()
      .toLowerCase()
      .trim();

    const filtered = search
      ? this.allData.filter(
          (c) =>
            c.name.toLowerCase().includes(search) ||
            c.description.toLowerCase().includes(search),
        )
      : this.allData;

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
      CreateCategoriesComponent,
      { mode: 'create' },
      { nzTitle: 'Create Category', nzWidth: '480px' },
    );

    drawerRef.afterClose.subscribe((result: any) => {
      if (result?.['success']) {
        const newCategory: Category = {
          id: this.nextId++,
          name: result['data'].name,
          description: result['data'].description,
          isActive: result['data'].isActive,
        };
        this.allData.unshift(newCategory);
        this.alert.showSuccess('Category created successfully');
        this.applyFilter();
      }
    });
  }

  addProd(row: any): void {
    this.router.navigate(['/common/products'], {
      queryParams: { categoryId: row.id, categoryName: row.name },
    });
  }

  openEditDrawer(row: Category): void {
    const drawerRef = this._dds.openDrawer(
      CreateCategoriesComponent,
      { mode: 'edit', category: row },
      { nzTitle: 'Edit Category', nzWidth: '480px' },
    );

    drawerRef.afterClose.subscribe((result: any) => {
      if (result?.['success']) {
        const idx = this.allData.findIndex((c) => c.id === row.id);
        if (idx > -1) {
          this.allData[idx] = { ...this.allData[idx], ...result['data'] };
        }
        this.alert.showSuccess('Category updated successfully');
        this.applyFilter();
      }
    });
  }

  deleteCategory(row: Category): void {
    this._confirmSrv.deleteConfirm(() => {
      this.allData = this.allData.filter((c) => c.id !== row.id);
      this.alert.showSuccess('Category deleted successfully');
      this.applyFilter();
    });
  }
}
