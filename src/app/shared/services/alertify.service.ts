import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import Swal from 'sweetalert2';
@Injectable({
  providedIn: 'root',
})
export class AlertifyService {
  [x: string]: any;
  constructor(private notification: NzNotificationService) {}

  private baseOptions = {
    nzDuration: 3000,
    nzPlacement: 'topRight' as const,
    nzClass: 'custom-notification',
  };

  showSuccess(message: string): void {
    this.notification.success('Success', message, {
      ...this.baseOptions,
      nzClass: 'custom-success-notification custom-notification',
    });
  }

  showError(message: string): void {
    this.notification.error('Error', message, {
      ...this.baseOptions,
      nzClass: 'custom-error-notification custom-notification',
    });
  }

  showInfo(message: string): void {
    this.notification.info('Information', message, {
      ...this.baseOptions,
      nzClass: 'custom-info-notification custom-notification',
    });
  }

  showWarning(message: string): void {
    this.notification.warning('Warning', message, {
      ...this.baseOptions,
      nzClass: 'custom-warning-notification custom-notification',
    });
  }

  showInputAlert(
    title: string,
    placeholder: string,
    confirmButtonText: string
  ): Promise<string | null> {
    return Swal.fire({
      title: title,
      input: 'textarea', // Use textarea for input
      inputPlaceholder: placeholder,
      allowOutsideClick: false,
      inputAttributes: {
        'aria-label': placeholder,
      },
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      preConfirm: (inputValue: any) => {
        if (!inputValue) {
          Swal.showValidationMessage('This field cannot be empty!');
          return false; // Prevents the dialog from closing if input is empty
        }
        return inputValue; // Return the input value when it's valid
      },
    }).then((result) => {
      // Returns the input value if confirmed, or null if canceled
      if (result.isConfirmed) {
        return result.value; // This is the entered input value
      }
      return null; // If canceled, return null
    });
  }
}
