import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators,
  AbstractControl, ValidationErrors
 } from '@angular/forms';
import { Subject, take } from 'rxjs';
import { takeUntil } from 'rxjs';
import { Product } from '../../../models/product';
import { ProductService } from '../../../service/product/product.service';
import { InventoryService } from '../../../service/inventory/inventory.service';
import { SaleService } from '../../../service/sales/sale.service';
import { SaleFormResult } from '../../../models/saleFormResult';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { th_TH } from 'ng-zorro-antd/i18n';

@Component({
  selector: 'app-create-sale',
  templateUrl: './create-sale.component.html',
  styleUrls: ['./create-sale.component.css']
})
export class CreateSaleComponent implements OnInit {

  form!: FormGroup;
  submitting = false;
  products: Product[] = [];

  stockByProductId: Record<number, number> = {};
  reservedByProductId: Record<number, number> = {};

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder,
    private drawerRef: NzDrawerRef<SaleFormResult>,
    private productService: ProductService,
    private inventoryService: InventoryService,
    private saleService: SaleService) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      customerName: ['', [Validators.required]],
      invoiceNumber: ['', [Validators.required]],
      items: this.fb.array([this.createLineItem()]),
    });

    this.productService.load().pipe(takeUntil(this.destroy$)).subscribe();

    this.productService.products$.pipe(takeUntil(this.destroy$)).subscribe((products) => {
      this.products = products;
    });

    this.inventoryService.inventoryItems$.pipe(takeUntil(this.destroy$)).subscribe((items) => {
      this.stockByProductId = {};
      items.forEach((i) => {
        this.stockByProductId[i.productId] = (this.stockByProductId[i.productId] ?? 0) + i.quantityOnHand;
      });
      this.items.controls.forEach((c) => c.get('quantity')!.updateValueAndValidity());
    });

    this.saleService.reservedByProductId$.pipe(takeUntil(this.destroy$)).subscribe((reserved) => {
      this.reservedByProductId = reserved;
      this.items.controls.forEach((c) => c.get('quantity')!.updateValueAndValidity());
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

   private stockValidator = (control: AbstractControl): ValidationErrors | null => {
    const group = control.parent;
    if (!group) return null;
    const productId = group.get('productId')?.value;
    const quantity = control.value;
    if (!productId || !quantity) return null;

    const onHand = this.stockByProductId[productId] ?? 0;
    const reserved = this.reservedByProductId[productId] ?? 0;
    const available = onHand - reserved;
    return quantity > available ? { exceedsStock: available } : null;
  };
  private createLineItem(): FormGroup {
    const group = this.fb.group({
      productId: [null, [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [null, [Validators.required, Validators.min(0)]],
    });
    group.get('quantity')!.addValidators(this.stockValidator);
    group.get('productId')!.valueChanges.subscribe(() => {
      group.get('quantity')!.updateValueAndValidity();
    });
    return group;
  }
   availableStock(index: number): number | null {
    const productId = this.items.at(index).get('productId')!.value;
    if (!productId) return null;
    const onHand = this.stockByProductId[productId] ?? 0;
    const reserved = this.reservedByProductId[productId] ?? 0;
    return onHand - reserved;
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
    return (line.quantity || 0) * (line.unitPrice || 0);
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
