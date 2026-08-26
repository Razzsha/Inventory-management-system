import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { ItemGroup } from 'src/app/menus/common-dashboard/models/ItemGroup';
import { ItemGroupFormResult } from 'src/app/menus/common-dashboard/models/ItemGroupFormResult';

@Component({
  selector: 'app-create-item-grp',
  templateUrl: './create-item-grp.component.html',
  styleUrls: ['./create-item-grp.component.css'],
})
export class CreateItemGrpComponent implements OnInit {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() group?: ItemGroup;

  form!: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private drawerRef: NzDrawerRef<ItemGroupFormResult>,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.group?.name ?? '', [Validators.required]],
      description: [this.group?.description ?? ''],
      status: [this.group?.status ?? true],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsDirty());
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
