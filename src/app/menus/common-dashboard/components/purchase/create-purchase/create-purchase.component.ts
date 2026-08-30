import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzDrawerComponent } from 'ng-zorro-antd/drawer';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs';
import { Product } from '../../../models/product';
import { ProductService } from '../../../service/product/product.service';
import { PurchaseFormResult } from '../../../models/purchaseFormResult';

@Component({
  selector: 'app-create-purchase',
  templateUrl: './create-purchase.component.html',
  styleUrls: ['./create-purchase.component.css']
})
export class CreatePurchaseComponent implements OnInit {

  form!: FormGroup;
  submitting = false;
  products: Product[] = [];

  private destroy$ = new Subject<void>();

  constructor(
     private fb: FormBuilder,
    private drawerRef: NzDrawerComponent<PurchaseFormResult>,
    private productService: ProductService,
  ) { }

   ngOnInit(): void {
    this.form = this.fb.group({
      supplierName: ['', [Validators.required]],
      poNumber: ['', [Validators.required]],
      items: this.fb.array([this.createLineItem()]),
    });

    this.productService.load().pipe(takeUntil(this.destroy$)).subscribe();
    this.productService.products$.pipe(takeUntil(this.destroy$)).subscribe((products) => {
      this.products = products;
    });
  }
   ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

   get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

   private createLineItem(): FormGroup {
    return this.fb.group({
      productId: [null, [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitCost: [null, [Validators.required, Validators.min(0)]],
    });
  }

  addLineItem(): void {
    this.items.push(this.createLineItem());
  }

   removeLineItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

   lineTotal(index: number): number {
    const line = this.items.at(index).value;
    return (line.quantity || 0) * (line.unitCost || 0);
  }

get grandTotal(): number {
    return this.items.controls.reduce((sum: number, _, i) => sum + this.lineTotal(i), 0);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    setTimeout(() => {
      this.submitting = false;
      this.drawerRef.close({ success: true, data: this.form.value });
    }, 200);
  }

  cancel(): void {
    this.drawerRef.close();
  }
}
