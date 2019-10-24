import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { FrontendRoutingModule } from "./frontend-routing.module";
import { MyMaterialModule } from "../material.module";
import { TermsComponent } from "./terms/terms.component";

@NgModule({
  imports: [
    MyMaterialModule,
    CommonModule,
    FrontendRoutingModule
  ],
  declarations: [
    TermsComponent
  ]
})
export class FrontendModule {
}
