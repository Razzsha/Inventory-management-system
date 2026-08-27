import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonDashboardRoutes } from './common-dashboard.routing';
import { HomeComponent } from './components/home/home.component';
import { CommonLoginComponent } from './components/common-login/common-login.component';
import { ReusableTableNewComponent } from './components/table/reusable-table-new/reusable-table-new.component';
import { CreateCategoriesComponent } from './components/items/component/categories/create-categories/create-categories.component';
import { CategoriesListComponent } from './components/items/component/categories/categories-list/categories-list.component';
import { CreateProductComponent } from './components/items/component/products/create-product/create-product.component';
import { ProductListComponent } from './components/items/component/products/product-list/product-list.component';
import { CreateItemGrpComponent } from './components/items/component/items-group/create-item-grp/create-item-grp.component';
import { GrpItemListComponent } from './components/items/component/items-group/grp-item-list/grp-item-list.component';
import { PriceListComponent } from './components/items/component/price-list/price-list/price-list.component';
import { InventoryListComponent } from './components/inventory/component/inventory-list/inventory-list.component';
import { StockAdjustmentComponent } from './components/inventory/component/stock-adjustment/stock-adjustment.component';
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
    CategoriesListComponent,
    CreateProductComponent,
    ProductListComponent,
    CreateItemGrpComponent,
    GrpItemListComponent,
    PriceListComponent,
    InventoryListComponent,
    StockAdjustmentComponent
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
