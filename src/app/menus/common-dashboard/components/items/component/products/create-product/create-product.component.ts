import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductyFormResult } from 'src/app/menus/common-dashboard/models/ProductyFormResult';
import { Product } from 'src/app/menus/common-dashboard/models/product';
import { ItemGroup } from 'src/app/menus/common-dashboard/models/ItemGroup';
import { ItemgroupService } from 'src/app/menus/common-dashboard/service/item-group/itemgroup.service';
import { DatastoreService } from 'src/app/menus/common-dashboard/service/data-store/datastore.service';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css'],
})
export class CreateProductComponent implements OnInit, OnDestroy {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() product?: Product;
  @Input() defaultCategoryId?: number | null;

  form!: FormGroup;
  submitting = false;

  groups: ItemGroup[] = [];
  categoryOptions: { label: string; value: number }[] = [];

  typeOptions = [
    { label: 'Unit', value: 'unit' },
    { label: 'Weight', value: 'weight' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private drawerRef: NzDrawerRef<ProductyFormResult>,
    private groupService: ItemgroupService,
    private store: DatastoreService,
  ) {}

  ngOnInit(): void {
  const categoryId = this.product?.categoryId ?? this.defaultCategoryId ?? null;
  const existingReorderLevel = this.product
    ? this.store.getReorderLevel(this.product.id)
    : 0;

  this.form = this.fb.group({
    name: [this.product?.name ?? '', [Validators.required]],
    sku: [this.product?.sku ?? '', [Validators.required]],
    categoryId: [
      {
        value: categoryId,
        disabled: this.mode === 'create' && this.defaultCategoryId != null,
      },
      [Validators.required],
    ],
    type: [this.product?.type ?? null, [Validators.required]],
    description: [this.product?.description ?? ''],
    price: [this.product?.price ?? null, [Validators.required, Validators.min(0)]],
    reorderLevel: [existingReorderLevel, [Validators.required, Validators.min(0)]], // NEW
    status: [this.product?.status ?? true],
  });

  this.groupService.groups$.pipe(takeUntil(this.destroy$)).subscribe((groups) => {
    this.groups = groups;
    this.categoryOptions = groups.map((g) => ({ label: g.name, value: g.id }));
  });
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get selectedCategoryLabel(): string {
    const id = this.form?.get('categoryId')?.value;
    return this.groups.find((g) => g.id === id)?.name ?? '';
  }

  submit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsDirty());
      return;
    }

    this.submitting = true;

    const value = this.form.getRawValue();

    setTimeout(() => {
      this.submitting = false;
      this.drawerRef.close({ success: true, data: value });
    }, 200);
  }

  cancel(): void {
    this.drawerRef.close();
  }
}
