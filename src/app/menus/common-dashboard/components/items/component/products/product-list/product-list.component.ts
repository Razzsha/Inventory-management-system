import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { CreateProductComponent } from '../../products/create-product/create-product.component';
import { Product } from 'src/app/menus/common-dashboard/models/product';
import { ItemGroup } from 'src/app/menus/common-dashboard/models/ItemGroup';
import { DynamicDrawerService } from 'src/app/shared/services/dynamic-drawer.service';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { ConformationService } from 'src/app/shared/services/conformation.service';
import { ProductService } from 'src/app/menus/common-dashboard/service/product/product.service';
import { ItemgroupService } from 'src/app/menus/common-dashboard/service/item-group/itemgroup.service';
import { DatastoreService } from 'src/app/menus/common-dashboard/service/data-store/datastore.service';

interface CategoryColumn {
  id: number;
  label: string;
  products: Product[];
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit, OnDestroy {
  filterFormStructure!: FormGroup;
  columns: CategoryColumn[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private _dds: DynamicDrawerService,
    private alert: AlertifyService,
    private _confirmSrv: ConformationService,
    private productService: ProductService,
    private groupService: ItemgroupService,
     private store: DatastoreService,
  ) {}

  ngOnInit(): void {
    this.filterFormStructure = this.fb.group({ search: [''] });

    this.productService.load().pipe(takeUntil(this.destroy$)).subscribe();

    combineLatest([
      this.groupService.groups$,
      this.productService.products$,
      this.filterFormStructure.get('search')!.valueChanges.pipe(startWith('')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([groups, product, searchValue]) => {
        const search = (searchValue || '').toLowerCase().trim();
        const matches = (p: Product) =>
          !search ||
          p.name.toLowerCase().includes(search) ||
          (p.description ?? '').toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search);
        this.columns = groups.map((cat) => ({
          id: cat.id,
          label: cat.name,
          products: product.filter((p) => p.categoryId === cat.id && matches(p)),
        }));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

 openCreateDrawer(categoryId: number): void {
  const drawerRef = this._dds.openDrawer(
    CreateProductComponent,
    { mode: 'create', defaultCategoryId: categoryId },
    { nzTitle: 'Create Product', nzWidth: '480px' },
  );
  drawerRef.afterClose.subscribe((result: any) => {
    if (result?.['success']) {
      const newProduct = this.productService.create({
        name: result['data'].name,
        sku: result['data'].sku,
        categoryId: result['data'].categoryId,
        type: result['data'].type,
        description: result['data'].description,
        price: result['data'].price,
        status: result['data'].status,
      });
      this.store.setReorderLevel(newProduct.id, result['data'].reorderLevel); // NEW
      this.alert.showSuccess('Product created successfully');
    }
  });
}

openEditDrawer(row: Product): void {
  const drawerRef = this._dds.openDrawer(
    CreateProductComponent,
    { mode: 'edit', product: row, defaultCategoryId: row.categoryId },
    { nzTitle: 'Edit Product', nzWidth: '480px' },
  );

  drawerRef.afterClose.subscribe((result: any) => {
    if (result?.['success']) {
      this.productService.update(row.id, result['data']);
      this.store.setReorderLevel(row.id, result['data'].reorderLevel); // NEW
      this.alert.showSuccess('Product updated successfully');
    }
  });
}

  deleteProduct(row: Product): void {
    this._confirmSrv.deleteConfirm(() => {
      this.productService.delete(row.id);
      this.alert.showSuccess('Product deleted successfully');
    });
  }
}
