import {Component, OnInit} from '@angular/core';
import {APPCONFIG} from '../../config';

@Component({
  selector: 'my-app-sidenav',
  styles: [`.nav-img {
      height: 40px;
  }`],
  templateUrl: './sidenav.component.html'
})

export class AppSidenavComponent implements OnInit {
  AppConfig;
  sales: boolean = false;

  constructor() {

  }

  ngOnInit() {
    this.AppConfig = APPCONFIG;
  }

  toggleCollapsedNav() {
    this.AppConfig.navCollapsed = !this.AppConfig.navCollapsed;
  }
}
