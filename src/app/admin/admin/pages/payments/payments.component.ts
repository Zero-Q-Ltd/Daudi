import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {AngularFireFunctions} from "@angular/fire/functions";
import {AdminService} from "../../../services/core/admin.service";
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from "@angular/material";
import {PaymentsService} from "../../../services/payments.service";
import {CustomerManagementComponent} from "../customer-management/customer-management.component";
import {DaudiCustomer} from "../../../../models/Daudi/customer/Customer";
import {takeUntil} from "rxjs/operators";
import {ReplaySubject} from "rxjs";
import {EquityBulk} from "../../../../models/ipn/EquityBulk";

@Component({
    selector: "app-payments",
    templateUrl: "./payments.component.html",
    styleUrls: ["./payments.component.scss"]
})
export class PaymentsComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ["bank", "mode", "bankref", "amount", "name", "phone"];
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
    @ViewChild(MatSort, {static: true}) sort: MatSort;
    unprocesseddatasource = new MatTableDataSource<EquityBulk>();
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    constructor(
        private functions: AngularFireFunctions,
        private adminservice: AdminService,
        private payments: PaymentsService,
        private dialog: MatDialog) {
        this.payments.unprocessedpayments.pipe(takeUntil(this.comopnentDestroyed)).subscribe(value => {
            this.unprocesseddatasource.data = value;
        });
    }

    ngOnInit() {
        this.unprocesseddatasource.paginator = this.paginator;
        this.unprocesseddatasource.sort = this.sort;
    }

    ngOnDestroy(): void {
        this.comopnentDestroyed.next(true);
        this.comopnentDestroyed.complete();
    }

    attachpayment(payment: EquityBulk) {
        const dialogRef = this.dialog.open(CustomerManagementComponent, {
            width: "80%",
            data: "Attach"
        });
        dialogRef.afterClosed().pipe(takeUntil(this.comopnentDestroyed)).subscribe((result: Array<DaudiCustomer> | null) => {
            if (result) {
                payment.billNumber = result[0].Id;
                payment.daudiFields.status = 48;
                payment.daudiFields.approvedby = this.adminservice.createuserobject();
                this.functions.httpsCallable("ipnCallable")(payment)
                    .pipe(takeUntil(this.comopnentDestroyed))
                    .subscribe(res => {
                        console.log(res);
                    });
            }

        });


    }
}
