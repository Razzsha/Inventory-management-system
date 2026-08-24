import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CommonLoginService } from 'src/app/menus/common-dashboard/service/common-login/common-login.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(CommonLoginService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/']);
};
