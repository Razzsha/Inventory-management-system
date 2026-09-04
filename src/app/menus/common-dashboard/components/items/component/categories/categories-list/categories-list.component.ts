import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  TemplateRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
// import * as $ from 'jquery';
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
import { CategoryService } from 'src/app/menus/common-dashboard/service/category/category.service';
declare var $: any;

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.css'],
})
export class CategoriesListComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  filterFormStructure!: FormGroup;

  data: Category[] = [];
  loading = false;
  total = 0;
  pageSize = 10;
  pageIndex = 1;
  templates: { [key: string]: TemplateRef<any> } = {};

  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;
  @ViewChild('titleTpl', { static: true }) titleTpl!: TemplateRef<any>;

  // NEW: pqGrid container ref
  @ViewChild('pqGridContainer', { static: true })
  pqGridContainer!: ElementRef<HTMLDivElement>;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private _dds: DynamicDrawerService,
    private alert: AlertifyService,
    private router: Router,
    private _confirmSrv: ConformationService,
    private categoryService: CategoryService,
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

  private allCategories: Category[] = [];

  ngOnInit(): void {
    this.filterFormStructure = this.fb.group({
      search: [''],
    });

    this.templates = {
      isActive: this.statusTpl,
      actions: this.actionsTpl,
      name: this.titleTpl,
    };

    combineLatest([
      this.categoryService.categories$,
      this.filterFormStructure.get('search')!.valueChanges.pipe(startWith('')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([categories, searchValue]) => {
        this.allCategories = categories;
        this.pageIndex = 1;
        this.applyFilter(searchValue);
      });
  }

  // NEW: init pqGrid once view is ready
  ngAfterViewInit(): void {
    $(this.pqGridContainer.nativeElement).pqGrid({
      width: '100%',
      height: 420,
      colModel: [
        { title: 'SN', dataIndx: 'sn', width: 60, align: 'center' },
        { title: 'Category Name', dataIndx: 'name', width: 200 },
        { title: 'Description', dataIndx: 'description', width: 260 },
        { title: 'Status', dataIndx: 'isActive', width: 100, align: 'center' },
      ],
      dataModel: { data: this.data },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyFilter(searchValue?: string): void {
    const search = (
      searchValue ??
      this.filterFormStructure.get('search')!.value ??
      ''
    )
      .toString()
      .toLowerCase()
      .trim();

    const filtered = search
      ? this.allCategories.filter(
          (c) =>
            c.name.toLowerCase().includes(search) ||
            c.description.toLowerCase().includes(search),
        )
      : this.allCategories;

    this.total = filtered.length;

    const start = (this.pageIndex - 1) * this.pageSize;
    this.data = filtered.slice(start, start + this.pageSize).map((c, i) => ({
      ...c,
      sn: start + i + 1,
    })) as any;

    // NEW: push updated data into pqGrid
    ($(this.pqGridContainer.nativeElement).pqGrid as any)(
      'option',
      'dataModel.data',
      this.data,
    );
    ($(this.pqGridContainer.nativeElement).pqGrid as any)('refreshDataAndView');
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
        this.categoryService.create(result['data']);
        this.alert.showSuccess('Category created successfully');
      }
    });
  }

  addProd(row: Category): void {
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
        this.categoryService.update(row.id, result['data']);
        this.alert.showSuccess('Category updated successfully');
      }
    });
  }

  deleteCategory(row: Category): void {
    this._confirmSrv.deleteConfirm(() => {
      this.categoryService.delete(row.id);
      this.alert.showSuccess('Category deleted successfully');
    });
  }
}
