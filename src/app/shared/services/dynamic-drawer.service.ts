import { Injectable } from '@angular/core';
import { NzDrawerService, NzDrawerRef } from 'ng-zorro-antd/drawer';
@Injectable({
  providedIn: 'root',
})
export class DynamicDrawerService {
  constructor(private drawerService: NzDrawerService) {}

  openDrawer(component: any, data: any = {}, options: any = {}): NzDrawerRef {
    const drawerRef = this.drawerService.create({
      nzTitle: options.nzTitle || 'Drawer',
      nzContent: component,
      nzWidth: options.nzWidth || '1200px',
      // nzWidth: options.nzWidth || this.getResponsiveWidth(),

      nzClosable: options.nzClosable !== false,
      nzMaskClosable: options.nzMaskClosable !== false,
      nzFooter: options.nzFooter || null,
      nzContentParams: data,
      nzMask: options.nzMask ?? false,
    });

    return drawerRef;
  }

  // private getResponsiveWidth(): string {
  //   const screenWidth = window.innerWidth;
  //   if (screenWidth <= 576) return '100%';
  //   if (screenWidth <= 992) return '90%';
  //   return '1200px'; // desktop ko lagi chai
  // }
}
