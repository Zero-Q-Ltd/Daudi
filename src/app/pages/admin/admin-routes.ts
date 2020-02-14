import { Routes } from "@angular/router";

import { EntriesComponent } from "./pages/entries/entries.component";

import { AseComponent } from "./pages/ase/ase.component";

import { DepotManagementComponent } from "./pages/depot-management/depot-management.component";

import { CompanyManagementComponent } from "./pages/company-management/company-management.component";

import { CustomerManagementComponent } from "./pages/customer-management/customer-management.component";

import { SmsLogsComponent } from "./pages/sms-logs/sms-logs.component";

import { PaymentsComponent } from "./pages/payments/payments.component";

/**
 * These routes are used within the admin tab navigation
 * In order to maintain consistence and a single source of truth, all info is stored in this const
 * The url is devided into 2 parts, the path and the title to be displayed in the Tab
 * This gives flexibility whenever we add new elements
 */
export const NavLinks: Routes = [
    {
        path: "entries|Entries|stars",
        component: EntriesComponent,
    },
    {
        path: "stock|Stock|stars",
        component: AseComponent
    },
    {
        path: "depot-management|Depot Management|stars",
        component: DepotManagementComponent
    },
    {
        path: "company-management|Company Management|stars",
        component: CompanyManagementComponent
    },
    {
        path: "customer-management|Customer Management|stars",
        component: CustomerManagementComponent
    },
    {
        path: "sms-logs|SMS Logs|stars",
        component: SmsLogsComponent
    },
    {
        path: "payments|Payments|stars",
        component: PaymentsComponent
    },

];
