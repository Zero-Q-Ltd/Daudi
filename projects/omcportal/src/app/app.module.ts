import { AgmCoreModule } from "@agm/core";
import { NgModule } from "@angular/core";
import { AngularFireModule } from "@angular/fire";
import { AngularFireAuth, AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireDatabase } from "@angular/fire/database";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireFunctionsModule } from "@angular/fire/functions";
import { AngularFireMessagingModule } from "@angular/fire/messaging";
import { AngularFireStorageModule, BUCKET } from "@angular/fire/storage";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { TextMaskModule } from "angular2-text-mask";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BatchTrucksComponent } from "./components/batch-trucks/batch-trucks.component";
import { ColumnsCustomizerComponent } from "./components/columns-customizer/columns-customizer.component";
import { ConfirmDialogComponent } from "./components/confirm-dialog/confirm-dialog.component";
import { EntriesSelectorComponent } from "./components/entries-selector/entries-selector.component";
import { EntrySelectorComponent } from "./components/entry-selector/entry-selector.component";
import { MapsComponent } from "./components/maps/maps.component";
import { PriceComparisonComponent } from "./components/price-comparison/price-comparison.component";
import { ReasonComponent } from "./components/reason/reason.component";
import { SendMsgComponent } from "./components/send-msg/send-msg.component";
import { UsersGuard } from "./guards/users.guard";
import { AppCustomizerComponent } from "./layout/customizer/customizer.component";
import { ToggleQuickviewDirective } from "./layout/customizer/toggle-quickview.directive";
import { FamilyChatComponent } from "./layout/family-chat/family-chat.component";
import { AppFooterComponent } from "./layout/footer/footer.component";
import { AppHeaderComponent } from "./layout/header/header.component";
import { LayoutComponent } from "./layout/layout.component";
import { LayoutService } from "./layout/layout.service";
import { PreloaderDirective } from "./layout/preloader.directive";
import { PrivateChatComponent } from "./layout/private-chat/private-chat.component";
import { AutoCloseMobileNavDirective } from "./layout/sidenav/auto-close-mobile-nav.directive";
import { AccordionNavDirective } from "./layout/sidenav/sidenav-menu/accordion-nav.directive";
import { AppendSubmenuIconDirective } from "./layout/sidenav/sidenav-menu/append-submenu-icon.directive";
import { HighlightActiveItemsDirective } from "./layout/sidenav/sidenav-menu/highlight-active-items.directive";
import { AppSidenavMenuComponent } from "./layout/sidenav/sidenav-menu/sidenav-menu.component";
import { AppSidenavComponent } from "./layout/sidenav/sidenav.component";
import { ToggleOffcanvasNavDirective } from "./layout/sidenav/toggle-offcanvas-nav.directive";
import { SupportChatComponent } from "./layout/support-chat/support-chat.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { AccountDetailsComponent } from "./pages/account-details/account-details.component";
import { TransferComponent } from "./pages/admin/pages/ase/dialogs/transfer/transfer.component";
import { ArchiveComponent } from "./pages/archive/archive.component";
import { CalculationsComponent } from "./pages/create-order/components/calculations/calculations.component";
import { ConfirmDepotComponent } from "./pages/create-order/components/confirm-depot/confirm-depot.component";
import { ContactFormComponent } from "./pages/create-order/components/contact-form/contact-form.component";
import { CreateOrderComponent } from "./pages/create-order/create-order.component";
import { CalendarRangesComponent } from "./pages/dashboard/calendar-ranges/calendar-ranges.component";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { StatsComponent } from "./pages/dashboard/stats/stats.component";
import { EditPriceComponent } from "./pages/edit-price/edit-price.component";
import { LoginComponent } from "./pages/login/login.component";
import { CompartmentsComponent } from "./pages/orders-table/components/compartments/compartments.component";
import { EntryAssignComponent } from "./pages/orders-table/components/entry-assign/entry-assign.component";
import { OrderDetailsComponent } from "./pages/orders-table/components/order-details/order-details.component";
import { TruckDetailsComponent } from "./pages/orders-table/components/truck-details/truck-details.component";
import { OrdersTableComponent } from "./pages/orders-table/orders-table.component";
import { TrucksTableComponent } from "./pages/trucks-table/trucks-table.component";
import { PipeModuleModule } from "./pipe-module/pipe-module.module";
import { AdminService } from "./services/core/admin.service";
import { FcmService } from "./services/fcm.service";
import { OrdersService } from "./services/orders.service";
import { PricesService } from "./services/prices.service";
import { NotificationComponent } from "./shared/components/notification/notification.component";
import { SharedModule } from "./shared/shared.module";
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ResultsTableComponent } from './pages/archive/results-table/results-table.component';

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
    // Sub modules
    MatProgressSpinnerModule,
    AngularFireModule.initializeApp(firebaseConfig, "EmkayNow"),
    AngularFirestoreModule,
    AngularFireMessagingModule,
    AngularFirestoreModule.enablePersistence(),
    AngularFireAuthModule,
    AngularFireFunctionsModule,
    AngularFireStorageModule,

    AgmCoreModule.forRoot({
      apiKey: "AIzaSyD73FGSNb0x-4dXOTksPjtl4RwowhzYqSs",
      libraries: ["places"]
    }),
    SatDatepickerModule,
    SatNativeDateModule,
    MatDatepickerModule,
    SharedModule
  ],
  declarations: [
    AppComponent,
    NotificationComponent,
    // Pages
    PageNotFoundComponent,
    // Layout
    LayoutComponent,
    // Header
    AppHeaderComponent,
    // Sidenav
    AppSidenavComponent,
    ToggleOffcanvasNavDirective,
    AutoCloseMobileNavDirective,
    AppSidenavMenuComponent,
    AccordionNavDirective,
    AppendSubmenuIconDirective,
    HighlightActiveItemsDirective,
    // Customizer
    AppCustomizerComponent,
    ToggleQuickviewDirective,
    // Layout
    PreloaderDirective,

    AppFooterComponent,
    FamilyChatComponent,
    SupportChatComponent,
    PrivateChatComponent,
    // PagesComponent,
    CreateOrderComponent,
    AccountDetailsComponent,
    EditPriceComponent,
    OrderDetailsComponent,
    OrdersTableComponent,
    // PageNotFoundComponent,
    CompartmentsComponent,
    TrucksTableComponent,
    TruckDetailsComponent,
    ConfirmDialogComponent,
    ArchiveComponent,
    BatchTrucksComponent,
    SendMsgComponent,
    MapsComponent,
    DashboardComponent,
    LoginComponent,
    EntriesSelectorComponent,
    ReasonComponent,
    ColumnsCustomizerComponent,
    CalendarRangesComponent,
    ConfirmDepotComponent,
    StatsComponent,
    CalculationsComponent,
    ContactFormComponent,
    PriceComparisonComponent,
    TransferComponent,
    EntrySelectorComponent,
    EntryAssignComponent,
    ResultsTableComponent
  ],
  providers: [
    AngularFireAuth,
    AngularFireModule,
    AngularFireDatabase,
    UsersGuard,
    LayoutService,
    AdminService,
    OrdersService,
    PricesService,
    FcmService,
    { provide: BUCKET, useValue: "daudi-4.appspot.com" }
  ],
  bootstrap: [AppComponent],
  exports: [PipeModuleModule, SharedModule, EntrySelectorComponent, ResultsTableComponent],
  entryComponents: [
    NotificationComponent,
    ConfirmDialogComponent,
    BatchTrucksComponent,
    SendMsgComponent,
    MapsComponent,
    EntriesSelectorComponent,
    ReasonComponent,
    ColumnsCustomizerComponent,
    ConfirmDepotComponent,
    CompartmentsComponent,
    CalendarRangesComponent,
    TransferComponent,
    EntrySelectorComponent,
    EntryAssignComponent
  ]
})
export class AppModule { }
