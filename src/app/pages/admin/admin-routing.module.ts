import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminComponent } from "./admin.component";
import { AseComponent } from "./pages/ase/ase.component";
import { CompanyManagementComponent } from "./pages/company-management/company-management.component";
import { CustomerManagementComponent } from "./pages/customer-management/customer-management.component";
import { DepotManagementComponent } from "./pages/depot-management/depot-management.component";
import { EntriesComponent } from "./pages/entries/entries.component";
import { PaymentsComponent } from "./pages/payments/payments.component";
import { SmsLogsComponent } from "./pages/sms-logs/sms-logs.component";
import { NavLinks } from './admin-routes';


const routes: Routes = [
  {
    path: "",
    component: AdminComponent,
    children: NavLinks
      .map(t => {
        const tt = { ...t };
        tt.path = t.path.split("|")[0];
        return tt;
      })
      .concat([{
        path: "",
        redirectTo: "entries",
        pathMatch: "full",
      }])
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
