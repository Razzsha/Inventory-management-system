import { Routes, RouterModule } from '@angular/router';
import { VerticalLayoutDashboardComponent } from 'src/app/layout/components/vertical-layout-dashboard/vertical-layout-dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { CategoriesListComponent } from './components/items/component/categories/categories-list/categories-list.component';
import { CommonLoginComponent } from './components/common-login/common-login.component';

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
    ],
  },
];

export const CommonDashboardRoutes = RouterModule.forChild(routes);
