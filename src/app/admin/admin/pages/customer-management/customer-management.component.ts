import { SelectionModel } from "@angular/cdk/collections";
import { Component, Inject, OnDestroy, OnInit, Optional, ViewChild } from "@angular/core";
import { AngularFireFunctions } from "@angular/fire/functions";
import { MatDialog, MatDialogRef, MatPaginator, MatSnackBar, MatSort, MatTableDataSource, MAT_DIALOG_DATA } from "@angular/material";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { CompanySync } from "../../../../models/Cloud/CompanySync";
import { SyncRequest } from "../../../../models/Cloud/Sync";
import { DaudiCustomer } from "../../../../models/Daudi/customer/Customer";
import { SMS } from "../../../../models/Daudi/sms/sms";
import { MyTimestamp } from "../../../../models/firestore/firestoreTypes";
import { NotificationService } from "../../../../shared/services/notification.service";
import { SendMsgComponent } from "../../../send-msg/send-msg.component";
import { AdminService } from "../../../services/core/admin.service";
import { CoreService } from "../../../services/core/core.service";
import { CustomerService } from "../../../services/customers.service";
import { CompanyMembersComponent } from "../company-members/company-members.component";


@Component({
  selector: "customer-management",
  templateUrl: "./customer-management.component.html",
  styleUrls: ["./customer-management.component.scss"]
})

export class CustomerManagementComponent implements OnInit, OnDestroy {

  dialogProperties: object = {};
  displayedColumns: string[] = ["select", "QbId", "name", "email", "phone", "krapin", "balance"];
  companiesdatasource = new MatTableDataSource<DaudiCustomer>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  creatingsync = false;
  selection = new SelectionModel<DaudiCustomer>(true, []);
  loadingcompanies = true;
  savingcompany = false;

  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private notification: NotificationService,
    private adminservice: AdminService,
    private customerservice: CustomerService,
    private functions: AngularFireFunctions,
    private core: CoreService,
    @Optional() public dialogRef: MatDialogRef<CustomerManagementComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public purpose: "SMS" | "Attach") {
    this.core.activedepot
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe(depotvata => {
        this.companiesdatasource.data = [];
        this.loadingcompanies = true;
        if (depotvata.depot.Id) {
          if (purpose) {
            switch (purpose) {
              case "Attach": {
                /**
                 * disable mutiselect and channge the buttontext
                 */
                this.selection = new SelectionModel<DaudiCustomer>(false, []);
              }
            }
          }
          this.core.loadingcustomers
            .pipe(takeUntil(this.comopnentDestroyed))
            .subscribe(value => {
              this.loadingcompanies = value;
            });
          this.core.customers
            .pipe(takeUntil(this.comopnentDestroyed))
            .subscribe(data => {
              this.companiesdatasource.data = data;
            });
        }
      });

  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.comopnentDestroyed.complete();
  }

  ngOnInit() {
    this.companiesdatasource.paginator = this.paginator;
    this.companiesdatasource.sort = this.sort;
  }

  openMembers(id: string) {
    console.log(id);
    this.dialog.open(CompanyMembersComponent, {
      role: "dialog",
      data: id,
      height: "auto"
      // width: '100%%',

    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.companiesdatasource.data.length;
    return numSelected === numRows;
  }

  submitcompanies() {
    if (!this.purpose || this.purpose === "SMS") {
      const sms: Array<SMS> = this.selection.selected.map(company => {
        const sms: SMS = {
          Id: null,
          company: {
            QbId: company.QbId,
            Id: company.Id,
            name: company.name,
            krapin: company.krapin
          },
          contact: company.contact,
          type: {
            reason: null,
            origin: "custom" as "custom"
          },
          greeting: "Jambo",
          msg: null,
          status: {
            delivered: false,
            sent: false
          },
          timestamp: MyTimestamp.now()
        };
        return sms;
      });
      this.dialog.open(SendMsgComponent, {
        role: "dialog",
        data: sms,
        height: "auto"
      });
    } else {
      this.dialogRef.close(this.selection.selected);
    }
    // this.dialog.open(SendMsgComponent);
  }


  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.companiesdatasource.data.forEach(row => this.selection.select(row));
  }

  syncdb() {
    this.creatingsync = true;

    const req: SyncRequest = {
      time: MyTimestamp.now(),
      synctype: ["Customer"]
    };
    const syncObject: CompanySync = {
      config: this.core.config.value,
      environment: this.core.environment.value,
      omc: this.core.currentOmc.value,
      sync: req
    };
    const sync = this.functions.httpsCallable("requestsync")(syncObject)
      .pipe(takeUntil(this.comopnentDestroyed))
      .toPromise();
    sync.then(res => {
      this.creatingsync = false;
      this.notification.notify({
        alert_type: "success",
        title: "Success",
        body: "Companies Synchronized"
      });
    }).catch(e => {
      this.creatingsync = false;
      this.notification.notify({
        alert_type: "error",
        title: "Error",
        body: "Sync failed, please try again later"
      });
      /**
       * @todo send the error to the database
       */
    });

  }

  openOrders(id: string) {
    console.log(id);
  }

  approvecompany(company: DaudiCustomer) {
    this.savingcompany = true;
    this.customerservice.verifykra(company.krapin, this.core.currentOmc.value.Id)
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          company.kraverified = {
            status: true,
            user: this.adminservice.createuserobject()
          };
          this.customerservice.updateCustomer(company, this.core.currentOmc.value.Id).then(() => {
            this.savingcompany = false;
          });
        } else {
          this.savingcompany = false;
          this.notification.notify({
            alert_type: "error",
            title: "Error",
            body: "Duplicate KRA pin"
          });
        }
      });
  }

  filtercompanies(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.companiesdatasource.filter = filterValue;
  }

  approve(company: DaudiCustomer) {
    // console.log(company)
    if (company.kraverified.status === undefined) {
      company.kraverified = {
        status: true,
        user: this.adminservice.createuserobject()
      };
    } else {
      company.kraverified.status = !company.kraverified;
    }
    // company.verifiedByUid = this.authService.getUser().uid;
    // company.verifiedByUser = this.authService.getUser().displayName;
    // update company
    // this.updateCompanies(company.$key, company)
    this.snackBar.open("Company details updated!", "Emkay Now ", { duration: 4000 });

  }

  saveChanges(company: DaudiCustomer) {
    console.log(company);
    // update company
    // this.updateCompanies(company.$key, company)
    this.snackBar.open("Company details updated!", "Emkay Now ", { duration: 4000 });
  }
}
