import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./pages/home/home.component";
import { AngularFireAuth, AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireMessagingModule } from "@angular/fire/messaging";
import { AngularFireFunctionsModule } from "@angular/fire/functions";

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
  declarations: [AppComponent, HomeComponent],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(firebaseConfig, "EmkayNow"),
    AngularFirestoreModule,
    AngularFireMessagingModule,
    AngularFirestoreModule.enablePersistence(),
    AngularFireAuthModule,
    AngularFireFunctionsModule,
    AppRoutingModule
  ],
  providers: [AngularFireAuth],
  bootstrap: [AppComponent]
})
export class AppModule {}
