import { Injectable, Injector } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
@Injectable({
  providedIn: 'root',
})
export class ConformationService {
  private modalService!: NzModalService;
  constructor(private injector: Injector ) {}

  private get modal(): NzModalService {
    if (!this.modalService) {
      this.modalService = this.injector.get(NzModalService);
    }
    return this.modalService;
  }

  deleteConfirm(funcToCall: () => void): void {
    this.modal.confirm({
      nzTitle: 'Confirm',
      nzContent: 'Are you sure you want to delete?',
      nzOkText: 'OK',
      nzOkType: 'primary',
      nzCancelText: 'Cancel',

      nzOnOk: () => {
        funcToCall();
      },

      nzOnCancel: () => {
        console.log('User canceled the action');
      },
    });
  }
}
