import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonLoginComponent } from './menus/common-dashboard/components/common-login/common-login.component';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: CommonLoginComponent },

  {
    path: 'common',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./menus/common-dashboard/common-dashboard.module').then(
        (m) => m.CommonDashboardModule,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
