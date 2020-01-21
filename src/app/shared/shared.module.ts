import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CommonPipe } from "./pipes/common.pipe";
import { SlimScrollDirective } from "./slim-scroll.directive";

@NgModule({
    imports: [
        CommonModule,
        SlimScrollDirective

    ],
    exports:
        [SlimScrollDirective]
    ,
    providers: [],
    declarations: [CommonPipe]
})
export class SharedModule {
}
