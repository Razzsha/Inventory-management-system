import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonDashboardRoutes } from './common-dashboard.routing';
import { HomeComponent } from './components/home/home.component';
import { CommonLoginComponent } from './components/common-login/common-login.component';
import { ReusableTableNewComponent } from './components/table/reusable-table-new/reusable-table-new.component';
import { CreateCategoriesComponent } from './components/items/component/categories/create-categories/create-categories.component';
import { CategoriesListComponent } from './components/items/component/categories/categories-list/categories-list.component';
import { LayoutModule } from 'src/app/layout/layout.module';
import { NgZorroSharedModule } from 'src/app/shared/modules/ng-zorro-shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NzTimelineModule } from "ng-zorro-antd/timeline";

@NgModule({
  declarations: [
    HomeComponent,
    CommonLoginComponent,
    ReusableTableNewComponent,
    CreateCategoriesComponent,
    CategoriesListComponent
  ],
  imports: [
    CommonModule,
    CommonDashboardRoutes,
    LayoutModule,
    NgZorroSharedModule,
    ReactiveFormsModule,
    NzTimelineModule
],

})
export class CommonDashboardModule { }
