import { Routes, RouterModule } from '@angular/router';
import { VerticalLayoutDashboardComponent } from 'src/app/layout/components/vertical-layout-dashboard/vertical-layout-dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { CategoriesListComponent } from './components/items/component/categories/categories-list/categories-list.component';
import { ProductListComponent } from './components/items/component/products/product-list/product-list.component';
import { GrpItemListComponent } from './components/items/component/items-group/grp-item-list/grp-item-list.component';
import { CommonLoginComponent } from './components/common-login/common-login.component';
import { PriceListComponent } from './components/items/component/price-list/price-list/price-list.component';
import { InventoryListComponent } from './components/inventory/component/inventory-list/inventory-list.component';
import { PurchaseListComponent } from './components/purchase/purchase-list/purchase-list.component';
import { SaleListComponent } from './components/sales/sale-list/sale-list.component';

const routes: Routes = [
  {
    path: 'common-login',
    component: CommonLoginComponent,
  },
  {
    path: '',
    component: VerticalLayoutDashboardComponent,
    children: [
      {
        path: 'common-dashboard',
        component: HomeComponent,
      },
      {
        path: 'categories',
        component: CategoriesListComponent,
      },
      {
        path: 'products',
        component: ProductListComponent,
      },
      {
        path: 'products/category/:categoryId',
        component: ProductListComponent,
      },
      {
        path: 'grpItem',
        component: GrpItemListComponent,
      },
      {
        path: 'price',
        component: PriceListComponent,
      },
      {
        path: 'inventorylist',
        component: InventoryListComponent,
      },
      {
        path: 'purchase',
        component: PurchaseListComponent,
      },
      {
        path: 'sale',
        component: SaleListComponent,
      },

    ],
  },
];

export const CommonDashboardRoutes = RouterModule.forChild(routes);
