import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {HomeComponent} from "./home/home.component";
import {FrontendRoutingModule} from "./frontend-routing.module";

import {FrontLoadComponent} from "./front-load/front-load.component";
import {FrontCompartmentsComponent} from "./front-compartments/front-compartments.component";
import {MyMaterialModule} from "../material.module";
import {TermsComponent} from './terms/terms.component';

@NgModule({
  imports: [
    MyMaterialModule,
    CommonModule,
    FrontendRoutingModule
  ],
  declarations: [HomeComponent, FrontLoadComponent, FrontCompartmentsComponent, TermsComponent]
})
export class FrontendModule {
}
