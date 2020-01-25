import {AgmCoreModule} from '@agm/core';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SharedModule} from 'app/shared/shared.module';
import {AdminRoutingModule} from './admin-routing.module';
import {AdminComponent} from './admin.component';
import {CreatePaymentComponent} from './components/create-payment/create-payment.component';
import {AdminLevelsComponent} from './pages/admin-levels/admin-levels.component';
import {AdminRolesComponent} from './pages/admin-roles/admin-roles.component';
import {AseComponent} from './pages/ase/ase.component';
import {CompanyMembersComponent} from './pages/company-members/company-members.component';
import {ConfigComponent} from './pages/config/config.component';
import {CustomerManagementComponent} from './pages/customer-management/customer-management.component';
import {DepotManagementComponent} from './pages/depot-management/depot-management.component';
import {EntriesComponent} from './pages/entries/entries.component';
import {OmcManagementComponent} from './pages/omc-management/omc-management.component';
import {PaymentsComponent} from './pages/payments/payments.component';
import {SmsLogsComponent} from './pages/sms-logs/sms-logs.component';
import {UserLevelsComponent} from './pages/user-levels/user-levels.component';
import {UserManagementComponent} from './pages/user-management/user-management.component';
import { CompanyManagementComponent } from './pages/company-management/company-management.component';

@NgModule({
  declarations: [
    AdminComponent,
    EntriesComponent,
    AdminLevelsComponent,
    AdminRolesComponent,
    AseComponent,
    CompanyMembersComponent,
    ConfigComponent,
    CustomerManagementComponent,
    DepotManagementComponent,
    OmcManagementComponent,
    PaymentsComponent,
    SmsLogsComponent,
    UserLevelsComponent,
    UserManagementComponent,
    CreatePaymentComponent,
    CompanyManagementComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    AgmCoreModule
  ],
  entryComponents: [
    CustomerManagementComponent,
    CompanyMembersComponent,
    CreatePaymentComponent,

  ]
})
export class AdminModule {
}
