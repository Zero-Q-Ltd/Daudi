import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {CommonPipe} from "./pipes/common.pipe";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [CommonPipe]
})
export class SharedModule {
}
