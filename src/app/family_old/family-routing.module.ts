import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {FamilyProfileComponent} from "./family-profile/family-profile.component";
import {FamilyHistoryComponent} from "./family-history/family-history.component";
import {FamilyDiscountComponent} from "./family-discount/family-discount.component";
import {FamilyLoginComponent} from "./family-login/family-login.component";
import {FamilyMembersComponent} from "./family-members/family-members.component";

const routes: Routes = [
  {path: "family_old-profile", component: FamilyProfileComponent},
  {path: "family_old-history", component: FamilyHistoryComponent},
  {path: "family_old-discount", component: FamilyDiscountComponent},
  {path: "family_old-login", component: FamilyLoginComponent},
  {path: "family_old-members", component: FamilyMembersComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FamilyRoutingModule {
}
