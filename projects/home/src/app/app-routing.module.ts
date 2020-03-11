import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "projects/home/src/app/pages/home/home.component";
import { AuthService } from "projects/home/src/app/services/auth.service";

const routes: Routes = [
  { path: "", component: HomeComponent },
  {
    path: "orders/:id",
    loadChildren: () =>
      import("./pages/orders/orders.module").then(m => m.OrdersModule),
    resolve: { _: AuthService }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
