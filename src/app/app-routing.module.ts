import { RouterModule, Routes } from "@angular/router";

import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";

const AppRoutes: Routes = [
  {
    path: "",
    loadChildren: "./frontend/frontend.module#FrontendModule"
  },
  {
    path: "terms",
    redirectTo: "./frontend/terms", pathMatch: "full"
  },
  {
    path: "dashboard",
    redirectTo: "/admin", pathMatch: "full"
  },
  { path: "sales", redirectTo: "/home/sales" },
  { path: "price", redirectTo: "/admin/edit-price" },
  {
    path: "admin",
    loadChildren: "./admin/admin.module#AdminModule"
  },
  {
    path: "family",
    loadChildren: "./family/family.module#FamilyModule"
  },

  { path: "**", component: PageNotFoundComponent }

];

export const AppRoutingModule = RouterModule.forRoot(AppRoutes);

