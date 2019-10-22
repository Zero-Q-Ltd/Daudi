import { Component, Inject, OnDestroy, OnInit, Optional, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatPaginator, MatSnackBar, MatSort, MatTableDataSource } from "@angular/material";
import { CompanyMembersComponent } from "../company-members/company-members.component";
import { SendMsgComponent } from "../../../send-msg/send-msg.component";
import { firestore } from "firebase";
import { Customer } from "../../../../models/Customer";
import { syncrequest } from "../../../../models/Sync";
import { SMS } from "../../../../models/sms";
import { NotificationService } from "../../../../shared/services/notification.service";
import { SelectionModel } from "@angular/cdk/collections";
import { AdminsService } from "../../../services/admins.service";
import { CustomerService } from "../../../services/customers.service";
import { DepotsService } from "../../../services/depots.service";
import { AngularFireFunctions } from "@angular/fire/functions";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "customer-management",
  templateUrl: "./customer-management.component.html",
  styleUrls: ["./customer-management.component.scss"]
})

export class CustomerManagementComponent implements OnInit, OnDestroy {

  dialogProperties: object = {};
  displayedColumns: string[] = ["select", "QbId", "name", "email", "phone", "krapin", "balance"];
  companiesdatasource = new MatTableDataSource<Customer>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  creatingsync = false;
  selection = new SelectionModel<Customer>(true, []);
  loadingcompanies = true;
  savingcompany = false;

  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(private snackBar: MatSnackBar, private dialog: MatDialog,
    private depotservice: DepotsService,
    private notification: NotificationService,
    private adminservice: AdminsService,
    private customerservice: CustomerService,
    private functions: AngularFireFunctions,
    @Optional() public dialogRef: MatDialogRef<CustomerManagementComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public purpose: "SMS" | "Attach") {
    depotservice.activedepot.pipe(takeUntil(this.comopnentDestroyed))
      .subscribe(depotvata => {
        this.companiesdatasource.data = [];
        this.loadingcompanies = true;
        if (depotvata.Id) {
          if (purpose) {
            switch (purpose) {
              case "Attach": {
                /**
                 * disable mutiselect and channge the buttontext
                 */
                this.selection = new SelectionModel<Customer>(false, []);
              }
            }
          }
          this.customerservice.loadingcompanies.pipe(takeUntil(this.comopnentDestroyed))
            .subscribe(value => {
              this.loadingcompanies = value;
            });
          customerservice.allcompanies.pipe(takeUntil(this.comopnentDestroyed))
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
      let sms: Array<SMS> = this.selection.selected.map(company => {
        return {
          Id: null,
          company: {
            QbId: company.QbId,
            contactname: company.contact.name,
            Id: company.Id,
            name: company.name,
            phone: company.contact.phone
          },
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
          timestamp: firestore.Timestamp.now()
        };
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

    const syncobject: syncrequest = {
      companyid: this.depotservice.activedepot.value.companyId,
      time: firestore.Timestamp.now(),
      synctype: ["Customer"]
    };

    this.functions.httpsCallable("requestsync")(syncobject).pipe(takeUntil(this.comopnentDestroyed))
      .subscribe(res => {
        this.creatingsync = false;
        this.notification.notify({
          alert_type: "success",
          title: "Success",
          body: "Companies Synchronized"
        });
      });

  }

  openOrders(id: string) {
    console.log(id);
  }

  approvecompany(company: Customer) {
    this.savingcompany = true;
    this.customerservice.verifykra(company.krapin)
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          company.kraverified = {
            status: true,
            user: this.adminservice.createuserobject()
          };
          this.customerservice.updatecompany(company.Id).update(company).then(() => {
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

  compileProperties(companyKey) {
    this.dialogProperties["company"] = companyKey;
    this.dialogProperties["archive"] = false;
    return this.dialogProperties;
  }

  approve(company: Customer) {
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
    // this.firestore.updateCompanies(company.$key, company)
    this.snackBar.open("Company details updated!", "Emkay Now ", { duration: 4000 });

  }

  saveChanges(company: Customer) {
    console.log(company);
    // update company
    // this.firestore.updateCompanies(company.$key, company)
    this.snackBar.open("Company details updated!", "Emkay Now ", { duration: 4000 });
  }
}
