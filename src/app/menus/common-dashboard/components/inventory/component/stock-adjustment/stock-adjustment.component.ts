import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { StockTransactionType } from 'src/app/menus/common-dashboard/models/stocktransaction';
import { StockAdjustmentFormResult } from 'src/app/menus/common-dashboard/models/StockAdjustmentFormResult';

interface TypeConfig {
  label: string;
  direction: 'in' | 'out' | 'user-choice';
  referenceLabel: string;
  referenceRequired: boolean;
  noteRequired: boolean;
}

@Component({
  // selector: 'app-stock-adjustment',
  templateUrl: './stock-adjustment.component.html',
  styleUrls: ['./stock-adjustment.component.css'],
})
export class StockAdjustmentComponent implements OnInit {
  @Input() productName = '';
  @Input() currentQuantity = 0;

  form!: FormGroup;
  submitting = false;

  typeOptions: { label: string; value: StockTransactionType }[] = [
    { label: 'Purchase (stock in)', value: 'purchase' },
    { label: 'Sale (stock out)', value: 'sale' },
    { label: 'Return (stock in)', value: 'return' },
    { label: 'Transfer', value: 'transfer' },
    { label: 'Adjustment / Correction', value: 'adjustment' },
  ];

  directionOptions = [
    { label: 'Stock In (+)', value: 'in' },
    { label: 'Stock Out (−)', value: 'out' },
  ];
  private typeConfig: Record<StockTransactionType, TypeConfig> = {
    purchase: {
      label: 'Purchase',
      direction: 'in',
      referenceLabel: 'PO Number',
      referenceRequired: true,
      noteRequired: false,
    },
    sale: {
      label: 'Sale',
      direction: 'out',
      referenceLabel: 'Invoice Number',
      referenceRequired: true,
      noteRequired: false,
    },
    return: {
      label: 'Return',
      direction: 'in',
      referenceLabel: 'Original Invoice / RMA Number',
      referenceRequired: true,
      noteRequired: false,
    },
    transfer: {
      label: 'Transfer',
      direction: 'user-choice',
      referenceLabel: 'Transfer Reference (e.g. warehouse or branch)',
      referenceRequired: true,
      noteRequired: false,
    },
    adjustment: {
      label: 'Adjustment / Correction',
      direction: 'user-choice',
      referenceLabel: 'Reference (optional)',
      referenceRequired: false,
      noteRequired: true,
    },
  };
  constructor(
    private fb: FormBuilder,
    private drawerRef: NzDrawerRef<StockAdjustmentFormResult>,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      type: ['adjustment', [Validators.required]],
      direction: ['in'],
      amount: [null, [Validators.required, Validators.min(1)]],
      reference: [''],
      note: [''],
    });

    this.form
      .get('type')!
      .valueChanges.subscribe((type: StockTransactionType) => {
        this.applyTypeRules(type);
      });
    this.applyTypeRules(this.form.get('type')!.value);
  }

  get config(): TypeConfig {
    return this.typeConfig[
      this.form.get('type')!.value as StockTransactionType
    ];
  }

  get needsDirectionPicker(): boolean {
    return this.config.direction === 'user-choice';
  }

  get effectiveDirection(): 'in' | 'out' {
    return this.config.direction === 'user-choice'
      ? this.form.get('direction')!.value
      : this.config.direction;
  }

   get resultingQuantity(): number {
    const amount = this.form?.get('amount')?.value || 0;
    const signedAmount = this.effectiveDirection === 'out' ? -amount : amount;
    return this.currentQuantity + signedAmount;
  }

  private applyTypeRules(type: StockTransactionType): void {
    const cfg = this.typeConfig[type];
    const referenceCtrl = this.form.get('reference')!;
    const noteCtrl = this.form.get('note')!;

    referenceCtrl.setValidators(
      cfg.referenceRequired ? [Validators.required] : [],
    );
    noteCtrl.setValidators(cfg.noteRequired ? [Validators.required] : []);
    referenceCtrl.updateValueAndValidity();
    noteCtrl.updateValueAndValidity();

    if (cfg.direction !== 'user-choice') {
      this.form.get('direction')!.setValue(cfg.direction, { emitEvent: false });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsDirty());
      return;
    }

    const { type, amount, reference, note } = this.form.value;
    const direction = this.effectiveDirection;
    const signedQuantity = direction === 'out' ? -amount : amount;

    if (direction === 'out' && this.currentQuantity + signedQuantity < 0) {
      this.form.get('amount')!.setErrors({ exceedsStock: true });
      return;
    }
    this.submitting = true;
    setTimeout(() => {
      this.submitting = false;
      this.drawerRef.close({
        success: true,
        data: { type, quantity: signedQuantity, reference, note },
      });
    }, 200);
  }

  cancel(): void {
    this.drawerRef.close();
  }
}
