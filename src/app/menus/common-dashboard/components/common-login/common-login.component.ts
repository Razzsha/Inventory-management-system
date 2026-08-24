import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonLoginService } from '../../service/common-login/common-login.service';
import { AlertifyService } from 'src/app/shared/services/alertify.service';

@Component({
  selector: 'app-common-login',
  templateUrl: './common-login.component.html',
  styleUrls: ['./common-login.component.css']
})
export class CommonLoginComponent implements OnInit {

  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private loginService: CommonLoginService,
    private router: Router,
    private alert: AlertifyService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.alert.showError('Please enter username and password');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;

    this.loginService.login(username, password).subscribe({
      next: (user) => {
        console.log('Login successful:', user);

        this.isLoading = false;

        this.alert.showSuccess('Login successful');

        this.router.navigate(['/common/common-dashboard']);
      },

      error: (error) => {
        console.error(error);

        this.isLoading = false;

        this.errorMessage = error?.error?.message || error?.message || 'Invalid username or password';

        this.alert.showError(this.errorMessage);
      }
    });
  }
}
