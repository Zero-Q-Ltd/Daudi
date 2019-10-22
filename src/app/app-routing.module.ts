import {RouterModule, Routes} from "@angular/router";

import {PageNotFoundComponent} from "./page-not-found/page-not-found.component";

const AppRoutes: Routes = [
  {
    path: "",
    loadChildren: "app/frontend/frontend.module#FrontendModule"
  },
  {
    path: "terms",
    redirectTo: "/app/frontend/terms", pathMatch: "full"
  },
  {
    path: "dashboard",
    redirectTo: "/admin", pathMatch: "full"
  },
  {path: "sales", redirectTo: "/home/sales"},
  {path: "price", redirectTo: "/admin/edit-price"},
  {
    path: "admin",
    loadChildren: "app/admin/admin.module#AdminModule"
  },
  {
    path: "family",
    loadChildren: "app/family/family.module#FamilyModule"
  },

  {path: "**", component: PageNotFoundComponent}

];

export const AppRoutingModule = RouterModule.forRoot(AppRoutes);
