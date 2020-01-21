import { RouterModule, Routes } from "@angular/router";

import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { LayoutComponent } from "./layout/layout.component";
import { UsersGuard } from "./guards/users.guard";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { CreateOrderComponent } from "./pages/create-order/create-order.component";
import { EditPriceComponent } from "./pages/edit-price/edit-price.component";
import { OrdersTableComponent } from "./pages/orders-table/orders-table.component";
import { TrucksTableComponent } from "./pages/trucks-table/trucks-table.component";
import { AdminComponent } from "./pages/admin/admin.component";
import { ArchiveComponent } from "./pages/archive/archive.component";
import { LoginComponent } from "./pages/login/login.component";
import { RouteDataClass } from "./models/Daudi/navigation/RouteData";

const AppRoutes: Routes = [
    {
        path: "terms",
        redirectTo: "./frontend/terms", pathMatch: "full"
    },
    {
        path: "",
        component: LayoutComponent,
        canActivate: [UsersGuard],
        children: [
            {
                path: "",
                component: DashboardComponent
            },
            {
                path: "create-order",
                component: CreateOrderComponent
            },
            {
                path: "approve-order/:id",
                component: CreateOrderComponent
            },
            {
                path: "edit-price",
                component: EditPriceComponent
            },
            {
                path: "orders-table/:stage",
                component: OrdersTableComponent
            },
            {
                path: "trucks-table/:stage",
                component: TrucksTableComponent
            },

            {
                path: "page-not-found",
                component: PageNotFoundComponent
            },
            {
                path: "superadmin",
                component: AdminComponent
            },
            {
                path: "archive",
                component: ArchiveComponent
            },
        ]
    },
    {
        path: "login",
        component: LoginComponent
    },

    { path: "**", component: PageNotFoundComponent }

];

export const AppRoutingModule = RouterModule.forRoot(AppRoutes);

