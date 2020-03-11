import {RouterModule, Routes} from '@angular/router';

import {LayoutComponent} from './layout.component';
// import { DashboardComponent } from '../dashboard/dashboard.component';
// import { AuthGuard } from '../../guards/auth.guard'; //service

const routes: Routes = [
  {
    path: 'app',
    component: LayoutComponent,
    // canActivate: [UsersGuard],

    // canActivate: [AuthGuard, isAdminGuard],
    children: [
      // { path: 'dashboard', component: DashboardComponent },
      // { path: 'page', loadChildren: '../pages/pages.module#PagesModule' },
      // { path: 'chart', loadChildren: '../charts/charts.module#ChartsModule' },
    ]
  }
];

export const LayoutRoutingModule = RouterModule.forChild(routes);
