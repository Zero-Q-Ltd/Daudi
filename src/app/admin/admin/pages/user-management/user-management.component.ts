import { Component, OnDestroy, OnInit, ViewChild, HostListener } from "@angular/core";
import { Admin, emptyadmin } from "../../../../models/admin/Admin";
import { MatDialog, MatPaginator, MatSnackBar, MatSort, MatTableDataSource } from "@angular/material";
import * as moment from "moment";
import { NotificationService } from "../../../../shared/services/notification.service";
import { SyncRequest } from "../../../../models/qbo/sync/Sync";
import { firestore } from "firebase";
import { animate, sequence, state, style, transition, trigger } from "@angular/animations";
import { FormControl, Validators } from "@angular/forms";
import { AdminService } from "../../../services/core/admin.service";
import { DepotService } from "../../../services/core/depot.service";
import { Depot } from "../../../../models/depot/Depot";
import { AngularFireFunctions } from "@angular/fire/functions";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { emptyomc } from "../../../../models/omc/Configg";
import { OMC } from "../../../../models/omc/OMC";
import { ConfigService } from "../../../services/core/config.service";

@Component({
  selector: "user-management",
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.scss"],
  animations: [
    trigger("flyIn", [
      state("in", style({ transform: "translateX(0)" })),
      transition("void => *", [
        style({ height: "*", opacity: "0", transform: "translateX(-550px)", "box-shadow": "none" }),
        sequence([
          animate(".20s ease", style({ height: "*", opacity: ".2", transform: "translateX(0)", "box-shadow": "none" })),
          animate(".15s ease", style({ height: "*", opacity: 1, transform: "translateX(0)" }))
        ])
      ])
    ]),
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0", display: "none" })),
      state("expanded", style({ height: "*" })),
      transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)"))
    ])]
})

export class UserManagementComponent implements OnInit, OnDestroy {

  usersdatasource = new MatTableDataSource<Admin>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  creatingsync = false;
  displayedColumns: string[] = ["photo", "QbId", "name", "email", "phone", "type", "level", "sandbox", "depot", "status", "action"];
  activeuser: Admin = emptyadmin;
  loadingadmins = true;
  saving = false;
  alldepots: Array<Depot>;
  expandedEAdmin: Admin;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  originalCompany: OMC = { ...emptyomc };


  constructor(
    private companyservice: ConfigService,
    private adminservice: AdminService,
    private functions: AngularFireFunctions,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private notification: NotificationService,
    private adminsService: AdminService,
    private config: ConfigService,
    private depotservice: DepotService) {
    this.depotservice.activedepot.pipe(takeUntil(this.comopnentDestroyed)).subscribe(depotvata => {
      if (depotvata.Id) {
        this.adminservice.observableuserdata.pipe(takeUntil(this.comopnentDestroyed)).subscribe(admin => {
          this.activeuser = admin;
        });
        this.adminservice.getalladmins().onSnapshot(snapshot => {
          this.loadingadmins = false;
          this.usersdatasource.data = snapshot.docs.map(doc => {
            const value = Object.assign({}, emptyadmin, doc.data());
            value.Id = doc.id;
            return value as Admin;
          });
        });
        this.companyservice.omcconfig.pipe(takeUntil(this.comopnentDestroyed)).subscribe(co => {
          this.originalCompany = co;
        });
      }
    });
    this.depotservice.alldepots.pipe(takeUntil(this.comopnentDestroyed)).subscribe(depots => {
      this.alldepots = depots;
    });

  }
  @HostListener("document:keydown.escape", ["$event"]) onKeydownHandler(event: KeyboardEvent) {
    this.expandedEAdmin = null;
  }
  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.comopnentDestroyed.complete();
  }

  ngOnInit() {
    this.usersdatasource.paginator = this.paginator;
    this.usersdatasource.sort = this.sort;
  }


  /**
   * @todo allow custom photo upload
   */
  uploadphoto() {

  }

  syncdb() {
    this.creatingsync = true;

    const syncobject: SyncRequest = {
      companyid: this.config.omcconfig.value.Qbo.companyId,
      time: firestore.Timestamp.now(),
      synctype: ["Employee"]
    };
    this.functions.httpsCallable("requestsync")(syncobject).pipe(takeUntil(this.comopnentDestroyed)).subscribe(res => {
      this.creatingsync = false;
      this.notification.notify({
        alert_type: "success",
        title: "Success",
        body: "Users Synchronized"
      });
    });
  }


  savechanges() {
    // console.log(admin);
    this.saving = true;
    if (this.expandedEAdmin.config.level >= this.activeuser.config.level) {
      this.adminsService.updateadmin(this.expandedEAdmin.Id).update(this.expandedEAdmin).then(_ => {
        this.saving = false;
        this.notification.notify({
          alert_type: "success",
          title: "Success",
          body: "Admin Updated"
        });
      });
    } else {
      this.saving = false;
      this.notification.notify({
        alert_type: "error",
        title: "ERROR",
        body: "You are not authorised to perform this action"
      });
    }
  }

  filterusers(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.usersdatasource.filter = filterValue;
  }

  selectlevel(level) {
    // console.log(level)
    return level;
  }

  converttime(timestamp) {
    if (timestamp) {
      return `Last Seen ${moment(timestamp).fromNow()}`;
    } else {
      return "Uknown Last Seen";
    }
  }


  getimage(image) {
    // console.log(image)
    if (image) {
      return image;
    } else {
      return "/assets/images/EmkayLogoBMP.svg";
    }
  }
}
