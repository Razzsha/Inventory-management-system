import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CommonLoginService } from 'src/app/menus/common-dashboard/service/common-login/common-login.service';
import { AlertifyService } from 'src/app/shared/services/alertify.service';

@Component({
  selector: 'app-vertical-layout-dashboard',
  templateUrl: './vertical-layout-dashboard.component.html',
  styleUrls: ['./vertical-layout-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class VerticalLayoutDashboardComponent implements OnInit {
  isCollapsed = false;

  constructor(
    private router: Router,
    private _ls: CommonLoginService,
    private alert: AlertifyService,
  ) {}

  ngOnInit(): void {}

  logout(): void {
    this.alert.showSuccess('Logged out Successfully');
    this.router.navigate(['/']);
  }
}
