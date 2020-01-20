import {NgModule} from "@angular/core";
import {TermsComponent} from "./terms/terms.component";
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {path: "terms", component: TermsComponent},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FrontendRoutingModule {
}
