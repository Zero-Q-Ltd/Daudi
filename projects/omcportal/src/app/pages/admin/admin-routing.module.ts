import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NavLinks } from "./admin-routes";
import { AdminComponent } from "./admin.component";

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
