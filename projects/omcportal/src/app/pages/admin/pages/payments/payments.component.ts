import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AngularFireFunctions } from "@angular/fire/functions";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { DaudiPayment } from "app/models/payment/DaudiPayment";
import { AdminService } from "app/services/core/admin.service";
import { PaymentsService } from "app/services/payments.service";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { DaudiCustomer } from "../../../../models/Daudi/customer/Customer";
import { CreatePaymentComponent } from "../../components/create-payment/create-payment.component";
import { CustomerManagementComponent } from "../customer-management/customer-management.component";

@Component({
  selector: "app-payments",
  templateUrl: "./payments.component.html",
  styleUrls: ["./payments.component.scss"]
})
export class PaymentsComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    "bank",
    "mode",
    "bankref",
    "amount",
    "name",
    "phone"
  ];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  unprocesseddatasource = new MatTableDataSource<DaudiPayment>();
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  saving: false;
  constructor(
    private functions: AngularFireFunctions,
    private adminservice: AdminService,
    private payments: PaymentsService,
    private dialog: MatDialog
  ) {
    this.payments.unprocessedpayments
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe(value => {
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

  attachpayment(payment: DaudiPayment) {
    const dialogRef = this.dialog.open(CustomerManagementComponent, {
      width: "80%",
      data: "Attach"
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe((result: DaudiCustomer[] | null) => {
        if (result) {
          payment.transaction.billNumber = result[0].Id;
          payment.daudiFields.status = 48;
          payment.daudiFields.approvedby = this.adminservice.createUserObject();
          this.functions
            .httpsCallable("ipnCallable")(payment)
            .pipe(takeUntil(this.comopnentDestroyed))
            .toPromise()
            .then(res => {
              console.log(res);
            })
            .catch(e => {});
        }
      });
  }

  addPayment() {
    this.dialog.open(CreatePaymentComponent, {
      width: "80%",
      data: "Attach"
    });
  }
}
