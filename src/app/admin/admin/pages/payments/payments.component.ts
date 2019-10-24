import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AngularFireFunctions } from "@angular/fire/functions";
import { ipnmodel } from "../../../../models/universal";
import { AdminsService } from "../../../services/core/admins.service";
import { NotificationService } from "../../../../shared/services/notification.service";
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from "@angular/material";
import { PaymentsService } from "../../../services/payments.service";
import { CustomerManagementComponent } from "../customer-management/customer-management.component";
import { Customer } from "../../../../models/Customer";
import { takeUntil } from "rxjs/operators";
import { ReplaySubject } from "rxjs";

@Component({
  selector: "app-payments",
  templateUrl: "./payments.component.html",
  styleUrls: ["./payments.component.scss"]
})
export class PaymentsComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ["bank", "mode", "bankref", "amount", "name", "phone"];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  unprocesseddatasource = new MatTableDataSource<ipnmodel>();
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(private functions: AngularFireFunctions,
    private adminservice: AdminsService,
    private notification: NotificationService,
    private payments: PaymentsService,
    private admins: AdminsService,
    private dialog: MatDialog) {
    payments.unprocessedpayments.pipe(takeUntil(this.comopnentDestroyed)).subscribe(value => {
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

  attachpayment(payment: ipnmodel) {
    const dialogRef = this.dialog.open(CustomerManagementComponent, {
      width: "80%",
      data: "Attach"
    });
    dialogRef.afterClosed().pipe(takeUntil(this.comopnentDestroyed)).subscribe((result: Array<Customer> | null) => {
      if (result) {
        payment.billNumber = result[0].Id;
        payment.daudiFields.status = 48;
        payment.daudiFields.approvedby = this.adminservice.createuserobject();
        this.functions.httpsCallable(payment.daudiFields.sandbox ? "ipnsandboxcallable" : "ipnprodcallable")(payment).pipe(takeUntil(this.comopnentDestroyed)).subscribe(res => {
          console.log(res);
        });
      }

    });


  }
}
