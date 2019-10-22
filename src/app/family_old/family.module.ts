import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {FamilyRoutingModule} from "./family-routing.module";
import {FamilyProfileComponent} from "./family-profile/family-profile.component";
import {FamilyHistoryComponent} from "./family-history/family-history.component";
import {FamilyDiscountComponent} from "./family-discount/family-discount.component";
import {FamilyLoginComponent} from "./family-login/family-login.component";
import {FamilyMembersComponent} from "./family-members/family-members.component";
import {EmkayFamilyComponent} from "./emkay-family/emkay-family.component";
import {MyMaterialModule} from "../material.module";

@NgModule({
  imports: [
    CommonModule,
    FamilyRoutingModule,
    MyMaterialModule
  ],
  declarations: [FamilyProfileComponent, FamilyHistoryComponent, FamilyDiscountComponent, FamilyLoginComponent, FamilyMembersComponent, EmkayFamilyComponent]
})
export class FamilyModule {
}
