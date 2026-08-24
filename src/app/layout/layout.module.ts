import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgZorroSharedModule } from '../shared/modules/ng-zorro-shared.module';
import { VerticalLayoutDashboardComponent } from './components/vertical-layout-dashboard/vertical-layout-dashboard.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgZorroSharedModule
  ],
   declarations: [
    VerticalLayoutDashboardComponent
   ],
   exports: [
    VerticalLayoutDashboardComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LayoutModule {}
