import {NgModule} from "@angular/core";
import {MyMaterialModule} from "../material.module";
import {CommonModule} from "@angular/common";
import {FlexLayoutModule} from "@angular/flex-layout";

import {AdminRoutingModule} from "./admin-routing.module";
import {CreateOrderComponent} from "./create-order/create-order.component";
import {AccountDetailsComponent} from "./account-details/account-details.component";
import {EditPriceComponent} from "./edit-price/edit-price.component";
import {OrderDetailsComponent} from "./order-details/order-details.component";
import {OrdersTableComponent} from "./orders-table/orders-table.component";
import {PageNotFoundComponent} from "./page-not-found/page-not-found.component";
import {CompartmentsComponent} from "./compartments/compartments.component";
import {ArchiveComponent} from "./archive/archive.component";
import {TrucksTableComponent} from "./trucks-table/trucks-table.component";
import {TruckDetailsComponent} from "./truck-details/truck-details.component";
import {AdminComponent} from "./admin/admin.component";

import {ConfirmDialogComponent} from "./confirm-dialog/confirm-dialog.component";
// MAT Fixer
import {BatchTrucksComponent} from "./batch-trucks/batch-trucks.component";
import {CompanyMembersComponent} from "./admin/pages/company-members/company-members.component";

import {UserManagementComponent} from "./admin/pages/user-management/user-management.component";
import {SendMsgComponent} from "./send-msg/send-msg.component";

import {MatTableModule} from "@angular/material/table";
import {CdkTableModule} from "@angular/cdk/table";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule, MatNativeDateModule, MatPaginatorModule, MatSelectModule, MatSortModule} from "@angular/material";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

import {MatDatepickerModule} from "@angular/material/datepicker";
import {CustomerManagementComponent} from "./admin/pages/customer-management/customer-management.component";
import {SmsLogsComponent} from "./admin/pages/sms-logs/sms-logs.component";
import {MatExpansionModule} from "@angular/material/expansion";
import {MapsComponent} from "./maps/maps.component";
import {AgmCoreModule} from "@agm/core";
import {PipeModuleModule} from "../pipe-module/pipe-module.module";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {LoginComponent} from "./login/login.component";
import {SharedModule} from "./shared/shared.module";
import {MatTreeModule} from "@angular/material/tree";
import {MatCheckboxModule} from "@angular/material/checkbox";
// Layout
import {LayoutComponent} from "./layout/layout.component";
// Header
import {AppHeaderComponent} from "./layout/header/header.component";
// Sidenav
import {AppSidenavComponent} from "./layout/sidenav/sidenav.component";
import {ToggleOffcanvasNavDirective} from "./layout/sidenav/toggle-offcanvas-nav.directive";
import {AutoCloseMobileNavDirective} from "./layout/sidenav/auto-close-mobile-nav.directive";
import {AppSidenavMenuComponent} from "./layout/sidenav/sidenav-menu/sidenav-menu.component";
import {AccordionNavDirective} from "./layout/sidenav/sidenav-menu/accordion-nav.directive";
import {AppendSubmenuIconDirective} from "./layout/sidenav/sidenav-menu/append-submenu-icon.directive";
import {HighlightActiveItemsDirective} from "./layout/sidenav/sidenav-menu/highlight-active-items.directive";
// Customizer
import {AppCustomizerComponent} from "./layout/customizer/customizer.component";
import {ToggleQuickviewDirective} from "./layout/customizer/toggle-quickview.directive";
// Layout
import {AppFooterComponent} from "./layout/footer/footer.component";
import {FamilyChatComponent} from "./layout/family-chat/family-chat.component";
import {SupportChatComponent} from "./layout/support-chat/support-chat.component";
import {PrivateChatComponent} from "./layout/private-chat/private-chat.component";
// Pages
// Sub modules
import {LayoutModule} from "./layout/layout.module";
import {LayoutService} from "./layout/layout.service";
import {UsersGuard} from "./guards/users.guard";
import {EntriesSelectorComponent} from "./entries-selector/entries-selector.component";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {PreloaderDirective} from "./layout/preloader.directive";
import {PaymentsComponent} from "./admin/pages/payments/payments.component";
import {ReasonComponent} from "./reason/reason.component";
import {ColumnsCustomizerComponent} from "./columns-customizer/columns-customizer.component";
import {DepotManagementComponent} from "./admin/pages/depot-management/depot-management.component";

import {MatProgressBarModule} from "@angular/material/progress-bar";
import {Ng5SliderModule} from "ng5-slider";
import {MatChipsModule} from "@angular/material/chips";
import {FcmService} from "./services/fcm.service";
import {AdminService} from "./services/core/admin.service";
import {OrdersService} from "./services/orders.service";
import {PricesService} from "./services/prices.service";
import {OmcManagementComponent} from "./admin/pages/omc-management/omc-management.component";
import {EntriesComponent} from "./admin/pages/entries/entries.component";
import {NgxEchartsModule} from "ngx-echarts";
import {SatDatepickerModule, SatNativeDateModule} from "saturn-datepicker";
import {CalendarRangesComponent} from "./dashboard/calendar-ranges/calendar-ranges.component";
import {ConfirmDepotComponent} from "./create-order/components/confirm-depot/confirm-depot.component";
import {StatsComponent} from "./dashboard/stats/stats.component";
import {UserLevelsComponent} from "./admin/pages/user-levels/user-levels.component";
import {ConfigComponent} from "./admin/pages/config/config.component";
import {AdminRolesComponent} from "./admin/pages/admin-roles/admin-roles.component";
import {AdminLevelsComponent} from "./admin/pages/admin-levels/admin-levels.component";
import {CreateComponent} from "./admin/pages/payments/create/create.component";
import {AseComponent} from "./admin/pages/ase/ase.component";
import {CalculationsComponent} from "./create-order/components/calculations/calculations.component";
import {ContactFormComponent} from "./create-order/components/contact-form/contact-form.component";
import {PriceComparisonComponent} from "./price-comparison/price-comparison.component";
import { TransferComponent } from './admin/pages/entries/dialogs/transfer/transfer.component';


@NgModule({

  imports: [
    CommonModule,
    MyMaterialModule,
    FlexLayoutModule,
    AdminRoutingModule,
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
      apiKey: "AIzaSyD73FGSNb0x-4dXOTksPjtl4RwowhzYqSs",
      libraries: ["places"]
    }),
    SatDatepickerModule,
    SatNativeDateModule
  ],
  declarations: [
    // AdminComponentMain,
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
    PageNotFoundComponent,
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
  providers: [UsersGuard,
    LayoutService,
    AdminService,
    OrdersService,
    PricesService,
    FcmService],
  entryComponents: [ConfirmDialogComponent,
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
    TransferComponent]
})
export class AdminModule {

}
