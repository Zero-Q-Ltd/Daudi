import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {BatchesPipe} from "./batches.pipe";
import {FormatOrdersPipe, MaptoArrayPipe} from "./common.pipe";
import {CountdownPipe} from "./countdown.pipe";
import {GetomcPipe} from "./getomc.pipe";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [MaptoArrayPipe, FormatOrdersPipe, BatchesPipe, CountdownPipe, GetomcPipe],
  exports: [MaptoArrayPipe, FormatOrdersPipe, BatchesPipe, GetomcPipe]
})
export class PipeModuleModule {
}
