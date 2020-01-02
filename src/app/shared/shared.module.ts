import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CommonPipe } from "./pipes/common.pipe";
import { AttachIdPipe } from "./pipes/attach-id.pipe";

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [AttachIdPipe],
  declarations: [CommonPipe, AttachIdPipe]
})
export class SharedModule {
}
