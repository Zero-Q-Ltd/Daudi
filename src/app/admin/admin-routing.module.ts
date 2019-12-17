import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminComponent } from "./admin/admin.component";
import { CreateOrderComponent } from "./create-order/create-order.component";
import { AccountDetailsComponent } from "./account-details/account-details.component";
import { EditPriceComponent } from "./edit-price/edit-price.component";
import { OrderDetailsComponent } from "./order-details/order-details.component";
import { OrdersTableComponent } from "./orders-table/orders-table.component";
import { CompartmentsComponent } from "./compartments/compartments.component";
import { TrucksTableComponent } from "./trucks-table/trucks-table.component";
import { TruckDetailsComponent } from "./truck-details/truck-details.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ArchiveComponent } from "./archive/archive.component";
import { LoginComponent } from "./login/login.component";
import { LayoutComponent } from "./layout/layout.component";
import { UsersGuard } from "./guards/users.guard";
import { PricechangerGuard } from "./guards/pricechanger.guard";
import { RouteData, RouteDataClass } from "../models/Daudi/navigation/RouteData";

// /**
//  * This has been created separately so as to take advantage of linting features
//  * the map key is the route name
//  */
// const routedatamap: Map<string, RouteData> = new Map<string, RouteData>([
//   ["", {
//     description: "Dashboard copmponent that displays sales stats, Root page loaded by default",
//     configurable: true,
//   }
//   ],
// ]);
const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    canActivate: [UsersGuard],
    data: new RouteDataClass({
      description: "Main layout that load all the other components",
      configurable: true,
    }).data,
    children: [
      {
        path: "",
        data: new RouteDataClass({
          description: "Dashboard copmponent that displays sales stats, Root page loaded by default",
          configurable: true,
        }).data,
        component: DashboardComponent
      },
      {
        path: "create-order",
        data: new RouteDataClass({
          description: "Order creation",
          configurable: true,
        }),
        component: CreateOrderComponent
      },
      {
        path: "approve-order/:id",
        data: new RouteDataClass({
          description: "Order approval",
          configurable: true,

        }),
        component: CreateOrderComponent
      },
      {
        path: "edit-price",
        data: new RouteDataClass({
          description: "Price change page",
          configurable: true,

        }),
        component: EditPriceComponent
      },
      {
        path: "orders-table/:stage",
        data: new RouteDataClass({
          description: "Orders table with the respective stage as a mandatory parameter",
          configurable: true,

        }),
        component: OrdersTableComponent
      },
      {
        path: "trucks-table/:stage",
        data: new RouteDataClass({
          description: "Trucks table with the respective stage as a mandatory parameter",
          configurable: true,

        }),
        component: TrucksTableComponent
      },

      {
        path: "page-not-found",
        data: new RouteDataClass({
          description: "Dashboard copmponent that displays sales stats",
          configurable: false,

        }),
        component: PageNotFoundComponent
      },
      {
        path: "superadmin",
        data: new RouteDataClass({
          description: "Super-Admin Module",
          configurable: true,

        }),
        component: AdminComponent
      },
      {
        path: "archive",
        data: new RouteDataClass({
          description: "Search page for ALL orders",
          configurable: true,

        }),
        component: ArchiveComponent
      },
    ]
  },
  {
    path: "login",
    data: new RouteDataClass({
      description: "Default login page",
      configurable: false,

    }),
    component: LoginComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
