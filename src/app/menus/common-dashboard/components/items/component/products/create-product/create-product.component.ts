import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { ProductyFormResult } from 'src/app/menus/common-dashboard/models/ProductyFormResult';
import { Product } from 'src/app/menus/common-dashboard/models/product';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css'],
})
export class CreateProductComponent implements OnInit {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() product?: Product;
  @Input() defaultCategoryId?: number | null;

  form!: FormGroup;
  submitting = false;

  categoryOptions = [
    { label: 'Cold Drinks', value: 1 },
    { label: 'Snacks', value: 2 },
    { label: 'Dairy', value: 3 },
  ];

  typeOptions = [
    { label: 'Unit', value: 'unit' },
    { label: 'Weight', value: 'weight' },
  ];

  constructor(
    private fb: FormBuilder,
    private drawerRef: NzDrawerRef<ProductyFormResult>,
  ) {}

  ngOnInit(): void {
    const categoryId =
      this.product?.categoryId ?? this.defaultCategoryId ?? null;

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
      price: [
        this.product?.price ?? null,
        [Validators.required, Validators.min(0)],
      ],
      status: [this.product?.status ?? true],
    });
  }

  get selectedCategoryLabel(): string {
    const id = this.form?.get('categoryId')?.value;
    return this.categoryOptions.find((c) => c.value === id)?.label ?? '';
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
