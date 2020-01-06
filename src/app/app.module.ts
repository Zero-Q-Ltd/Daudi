import { ApplicationRef, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MyMaterialModule } from "./material.module"; // MaterialModule
// angular fire imports
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireAuth, AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireDatabase } from "@angular/fire/database";
import { AngularFireFunctionsModule } from "@angular/fire/functions";
import { AngularFireMessagingModule } from "@angular/fire/messaging";
import { AngularFireModule } from "@angular/fire";

import { AuthGuard } from "./guards/auth.guard"; // auth guards
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
// hmr
import { createNewHosts, removeNgStyles } from "@angularclass/hmr";
import { FlexLayoutModule } from "@angular/flex-layout";
// table
import { TextMaskModule } from "angular2-text-mask"; // for input mask
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { PipeModuleModule } from "./pipe-module/pipe-module.module";

import { NotificationComponent } from "./shared/components/notification/notification.component";
import { AttachId } from "./shared/pipes/attach-id.pipe";
// import { AgmCoreModule } from '@agm/core';
// Custom Error handler and Logging Service
// import { ErrorHandler } from '@angular/core';
// import { MyErrorHandler } from './my-error-handler';
// Components

const firebaseConfig = {
  apiKey: "AIzaSyD6abjtAtMf2kK7YEtgpyKqT_EPkHqjYXo",
  authDomain: "daudi-4.firebaseapp.com",
  databaseURL: "https://daudi-4.firebaseio.com",
  projectId: "daudi-4",
  storageBucket: "daudi-4.appspot.com",
  messagingSenderId: "999511162358",
  appId: "1:999511162358:web:dc46119fc258dca9ec9bd7",
  measurementId: "G-TSVMB3SPF8"
};

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    TextMaskModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FlexLayoutModule,
    MyMaterialModule,
    // Sub modules
    MatProgressSpinnerModule,
    AngularFireModule.initializeApp(firebaseConfig, "EmkayNow"),
    AngularFirestoreModule,
    AngularFireMessagingModule,
    AngularFirestoreModule.enablePersistence(),
    AngularFireAuthModule,
    AngularFireFunctionsModule,
    // AgmCoreModule.forRoot({
    //   apiKey: 'AIzaSyBLs7FSznETgYbDW0E3tR26lKFBzE43iaQ'
    // })
    PipeModuleModule,

  ],
  declarations: [
    AppComponent,
    NotificationComponent,
    // Pages
    PageNotFoundComponent

  ],
  providers: [AngularFireAuth, AngularFireModule, AngularFireDatabase, AuthGuard, AttachId],
  bootstrap: [AppComponent],
  exports: [PipeModuleModule, MyMaterialModule
  ],
  entryComponents: [NotificationComponent]
})

export class AppModule {
  constructor(public appRef: ApplicationRef) {
  }

  hmrOnInit(store) {
    console.log("HMR store", store);
  }

  hmrOnDestroy(store) {
    const cmpLocation = this.appRef.components.map((cmp) => cmp.location.nativeElement);
    // recreate elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // remove styles
    removeNgStyles();
  }

  hmrAfterDestroy(store) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }
}
