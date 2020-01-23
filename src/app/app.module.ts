import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AgmCoreModule } from '@agm/core';
import { LayoutModule } from '@angular/cdk/layout';
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuth, AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatExpansionModule,
  MatInputModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatSortModule,
  MatTableModule,
  MatTreeModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TextMaskModule } from 'angular2-text-mask';
import { Ng5SliderModule } from 'ng5-slider';
import { NgxEchartsModule } from 'ngx-echarts';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BatchTrucksComponent } from './components/batch-trucks/batch-trucks.component';
import { ColumnsCustomizerComponent } from './components/columns-customizer/columns-customizer.component';
import { CompartmentsComponent } from './components/compartments/compartments.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { EntriesSelectorComponent } from './components/entries-selector/entries-selector.component';
import { MapsComponent } from './components/maps/maps.component';
import { OrderDetailsComponent } from './components/order-details/order-details.component';
import { PriceComparisonComponent } from './components/price-comparison/price-comparison.component';
import { ReasonComponent } from './components/reason/reason.component';
import { SendMsgComponent } from './components/send-msg/send-msg.component';
import { TruckDetailsComponent } from './components/truck-details/truck-details.component';
import { UsersGuard } from './guards/users.guard';
import { AppCustomizerComponent } from './layout/customizer/customizer.component';
import { ToggleQuickviewDirective } from './layout/customizer/toggle-quickview.directive';
import { FamilyChatComponent } from './layout/family-chat/family-chat.component';
import { AppFooterComponent } from './layout/footer/footer.component';
import { AppHeaderComponent } from './layout/header/header.component';
import { LayoutComponent } from './layout/layout.component';
import { LayoutService } from './layout/layout.service';
import { PreloaderDirective } from './layout/preloader.directive';
import { PrivateChatComponent } from './layout/private-chat/private-chat.component';
import { AutoCloseMobileNavDirective } from './layout/sidenav/auto-close-mobile-nav.directive';
import { AccordionNavDirective } from './layout/sidenav/sidenav-menu/accordion-nav.directive';
import { AppendSubmenuIconDirective } from './layout/sidenav/sidenav-menu/append-submenu-icon.directive';
import { HighlightActiveItemsDirective } from './layout/sidenav/sidenav-menu/highlight-active-items.directive';
import { AppSidenavMenuComponent } from './layout/sidenav/sidenav-menu/sidenav-menu.component';
import { AppSidenavComponent } from './layout/sidenav/sidenav.component';
import { ToggleOffcanvasNavDirective } from './layout/sidenav/toggle-offcanvas-nav.directive';
import { SupportChatComponent } from './layout/support-chat/support-chat.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AccountDetailsComponent } from './pages/account-details/account-details.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AdminLevelsComponent } from './pages/admin/pages/admin-levels/admin-levels.component';
import { AdminRolesComponent } from './pages/admin/pages/admin-roles/admin-roles.component';
import { AseComponent } from './pages/admin/pages/ase/ase.component';
import { TransferComponent } from './pages/admin/pages/ase/dialogs/transfer/transfer.component';
import { CompanyMembersComponent } from './pages/admin/pages/company-members/company-members.component';
import { ConfigComponent } from './pages/admin/pages/config/config.component';
import { CustomerManagementComponent } from './pages/admin/pages/customer-management/customer-management.component';
import { DepotManagementComponent } from './pages/admin/pages/depot-management/depot-management.component';
import { EntriesComponent } from './pages/admin/pages/entries/entries.component';
import { OmcManagementComponent } from './pages/admin/pages/omc-management/omc-management.component';
import { CreateComponent } from './pages/admin/pages/payments/create/create.component';
import { PaymentsComponent } from './pages/admin/pages/payments/payments.component';
import { SmsLogsComponent } from './pages/admin/pages/sms-logs/sms-logs.component';
import { UserLevelsComponent } from './pages/admin/pages/user-levels/user-levels.component';
import { UserManagementComponent } from './pages/admin/pages/user-management/user-management.component';
import { ArchiveComponent } from './pages/archive/archive.component';
import { CalculationsComponent } from './pages/create-order/components/calculations/calculations.component';
import { ConfirmDepotComponent } from './pages/create-order/components/confirm-depot/confirm-depot.component';
import { ContactFormComponent } from './pages/create-order/components/contact-form/contact-form.component';
import { CreateOrderComponent } from './pages/create-order/create-order.component';
import { CalendarRangesComponent } from './pages/dashboard/calendar-ranges/calendar-ranges.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { StatsComponent } from './pages/dashboard/stats/stats.component';
import { EditPriceComponent } from './pages/edit-price/edit-price.component';
import { LoginComponent } from './pages/login/login.component';
import { OrdersTableComponent } from './pages/orders-table/orders-table.component';
import { TrucksTableComponent } from './pages/trucks-table/trucks-table.component';
import { PipeModuleModule } from './pipe-module/pipe-module.module';
import { AdminService } from './services/core/admin.service';
import { FcmService } from './services/fcm.service';
import { OrdersService } from './services/orders.service';
import { PricesService } from './services/prices.service';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { SharedModule } from './shared/shared.module';

const firebaseConfig = {
  apiKey: 'AIzaSyD6abjtAtMf2kK7YEtgpyKqT_EPkHqjYXo',
  authDomain: 'daudi-4.firebaseapp.com',
  databaseURL: 'https://daudi-4.firebaseio.com',
  projectId: 'daudi-4',
  storageBucket: 'daudi-4.appspot.com',
  messagingSenderId: '999511162358',
  appId: '1:999511162358:web:dc46119fc258dca9ec9bd7',
  measurementId: 'G-TSVMB3SPF8'
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
    AngularFireModule.initializeApp(firebaseConfig, 'EmkayNow'),
    AngularFirestoreModule,
    AngularFireMessagingModule,
    AngularFirestoreModule.enablePersistence(),
    AngularFireAuthModule,
    AngularFireFunctionsModule,

    PipeModuleModule,
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    CdkTableModule,
    MatTreeModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatProgressBarModule,
    PipeModuleModule,
    SharedModule,
    LayoutModule,
    Ng5SliderModule,
    MatChipsModule,
    MatInputModule,
    MatSelectModule,
    NgxEchartsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD73FGSNb0x-4dXOTksPjtl4RwowhzYqSs',
      libraries: ['places']
    }),
    SatDatepickerModule,
    SatNativeDateModule
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
    AdminComponent,
    ConfirmDialogComponent,
    ArchiveComponent,
    BatchTrucksComponent,
    UserManagementComponent,
    SendMsgComponent,
    CustomerManagementComponent,
    CompanyMembersComponent,
    SmsLogsComponent,
    MapsComponent,
    DashboardComponent,
    LoginComponent,
    EntriesSelectorComponent,
    PaymentsComponent,
    ReasonComponent,
    ColumnsCustomizerComponent,
    DepotManagementComponent,
    OmcManagementComponent,
    EntriesComponent,
    CalendarRangesComponent,
    ConfirmDepotComponent,
    StatsComponent,
    UserLevelsComponent,
    ConfigComponent,
    AdminRolesComponent,
    AdminLevelsComponent,
    CreateComponent,
    AseComponent,
    CalculationsComponent,
    ContactFormComponent,
    PriceComparisonComponent,
    TransferComponent,

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
    FcmService],
  bootstrap: [AppComponent],
  exports: [
    PipeModuleModule,
    SharedModule,
  ],
  entryComponents: [
    NotificationComponent,
    ConfirmDialogComponent,
    BatchTrucksComponent,
    SendMsgComponent,
    CompanyMembersComponent,
    MapsComponent,
    EntriesSelectorComponent,
    ReasonComponent,
    ColumnsCustomizerComponent,
    CustomerManagementComponent,
    ConfirmDepotComponent,
    CompartmentsComponent,
    CalendarRangesComponent,
    TransferComponent
  ]
})
export class AppModule { }
