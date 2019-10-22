import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {FrontLoadComponent} from "./front-load/front-load.component";
import {FrontCompartmentsComponent} from "./front-compartments/front-compartments.component";
import {HomeComponent} from "./home/home.component";
import {TermsComponent} from "./terms/terms.component";

const routes: Routes = [{path: "front-load", component: FrontLoadComponent},
  {path: "front-compartments", component: FrontCompartmentsComponent},
  {path: "home", component: HomeComponent},
  {path: "terms", component: TermsComponent},
  {path: "", component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrontendRoutingModule {
}
