import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';

export interface CategoryFormResult {
  success: boolean;
  data?: {
    name: string;
    description: string;
    isActive: boolean;
  };
}

@Component({
  selector: 'app-create-categories',
  templateUrl: './create-categories.component.html',
  styleUrls: ['./create-categories.component.css'],
})
export class CreateCategoriesComponent implements OnInit {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() category?: { name: string; description: string; isActive: boolean };

  form!: FormGroup;
  submitting = false;

  constructor(private fb: FormBuilder, private drawerRef: NzDrawerRef<CategoryFormResult>) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.category?.name ?? '', [Validators.required, Validators.maxLength(100)]],
      description: [this.category?.description ?? '', [Validators.maxLength(500)]],
      isActive: [this.category?.isActive ?? true],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsDirty());
      return;
    }

    this.submitting = true;
    // static-data mode: no API call, just hand data back to parent
    setTimeout(() => {
      this.submitting = false;
      this.drawerRef.close({ success: true, data: this.form.value });
    }, 200);
  }

  cancel(): void {
    this.drawerRef.close();
  }
}
