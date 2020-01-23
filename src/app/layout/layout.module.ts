import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {LayoutRoutingModule} from './layout-routing.module';

@NgModule({
  imports: [
    LayoutRoutingModule,
    SharedModule
    // MyMaterialModule,
  ],
  declarations: []
})

export class LayoutModule {
}
