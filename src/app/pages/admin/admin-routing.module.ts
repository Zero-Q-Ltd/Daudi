import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AseComponent } from './pages/ase/ase.component';
import { CompanyManagementComponent } from './pages/company-management/company-management.component';
import { CustomerManagementComponent } from './pages/customer-management/customer-management.component';
import { DepotManagementComponent } from './pages/depot-management/depot-management.component';
import { EntriesComponent } from './pages/entries/entries.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { SmsLogsComponent } from './pages/sms-logs/sms-logs.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'entries',
    pathMatch: 'full'
  },
  {
    path: 'entries',
    component: EntriesComponent
  },
  {
    path: 'stock',
    component: AseComponent
  },
  {
    path: 'depot-management',
    component: DepotManagementComponent
  },
  {
    path: 'company-management',
    component: CompanyManagementComponent
  },
  {
    path: 'customer-management',
    component: CustomerManagementComponent
  },
  {
    path: 'sms-logs',
    component: SmsLogsComponent
  },
  {
    path: 'payments',
    component: PaymentsComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
