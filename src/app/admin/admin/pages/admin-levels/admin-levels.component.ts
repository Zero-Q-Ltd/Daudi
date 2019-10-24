import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommunicationService } from "../../communication.service";
import { MatDialog } from "@angular/material";
import { ConfigService } from "../../../services/core/config.service";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { OMC, emptyomc } from "../../../../models/Config";
import { FormArray, FormControl, FormGroup, FormBuilder } from "ngx-strongly-typed-forms";

import { NotificationService } from "../../../../shared/services/notification.service";
import * as firebase from "firebase";
import { NewAdminType, AdminType } from "../../../../models/AdminType";
import { Validators } from "@angular/forms";
import { AdminLevel } from "../../../../models/AdminLevel";
import { Metadata, Meta } from "../../../../models/universal";
import { AdminsService } from "../../../services/core/admins.service";
import { ConfirmDialogComponent } from "../../../confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-admin-levels",
  templateUrl: "./admin-levels.component.html",
  styleUrls: ["./admin-levels.component.scss"]
})
export class AdminLevelsComponent implements OnInit, OnDestroy {
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  newadminform: FormGroup<NewAdminType>;
  originalCompany: OMC = { ...emptyomc };
  tempcompany: OMC = { ...emptyomc };

  constructor(private companyservice: ConfigService,
    private formBuilder: FormBuilder,
    private _matDialog: MatDialog,
    private notificationservice: NotificationService,
    private adminService: AdminsService,

  ) {
    this.initforms();
    this.initvalues();
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.comopnentDestroyed.complete();
  }
  initvalues(): void {
    this.companyservice.companydata.pipe(takeUntil(this.comopnentDestroyed)).subscribe(co => {
      this.originalCompany = co;
      this.tempcompany = Object.assign({}, co);
      this.initforms();
    });
  }

  saveadminType(): void {
    const newtype: NewAdminType = this.newadminform.getRawValue();
    const meta: Meta = {
      adminId: this.adminService.userdata.Id,
      date: new Date()
    };

    const newMeta: Metadata = {
      created: meta,
      edited: meta
    };
    const withMeta: AdminType = Object.assign({}, newtype, { metadata: newMeta });
    // @TODO temporary hack
    // @ts-ignore
    delete (withMeta.level);
    this.tempcompany.adminTypes.splice(newtype.level, 0, withMeta);
    this.savecompany();
  }

  savecompany(): void {
    console.log(this.tempcompany);
    const dialogRef = this._matDialog.open(ConfirmDialogComponent,

      {
        role: "dialog",
        data: `Are you sure?`
      });
    dialogRef.afterClosed().pipe(takeUntil(this.comopnentDestroyed)).subscribe(result => {
      if (result) {
        this.companyservice.savecompany(this.tempcompany).then(() => {
          this.notificationservice.notify({
            title: "SAVED",
            body: ""
          });
        });
      }
    });
  }
  /**
   * Retruns the form array for dynamic manipulation
   */
  getlevelsArray(): FormArray<AdminLevel> {
    return this.newadminform.get("levels") as FormArray<AdminLevel>;
  }

  /**
   * This adds an admin level to the New Admins form
   */
  addLevelsform() {
    this.getlevelsArray().push(this.formBuilder.group<AdminLevel>({
      name: ["", Validators.required],
      description: ["", Validators.required],
    }));
  }
  /**
   * This adds an admin level to the New Admins form
   */
  removeLevelsform(id: number) {
    if (id === 0) {
      return;
    }
    this.getlevelsArray().removeAt(id);
  }
  /**
   * This adds an admin level to the tempcompany model
   */
  addLevelsdirect(index: number) {
    this.tempcompany.adminTypes[index].levels.push({
      description: "",
      name: ""
    });
  }

  deleteTypedirect(index: number) {
    const dialogRef = this._matDialog.open(ConfirmDialogComponent,
      {
        role: "dialog",
        data: `Are you sure?`
      });
    dialogRef.afterClosed().pipe(takeUntil(this.comopnentDestroyed)).subscribe(result => {
      if (result) {
        this.tempcompany.adminTypes.splice(index, 1);
      }
    });
  }
  /**
   * This removes an admin level to the tempcompany model
   */
  removeLevelsirect(typeindex: number, index: number) {
    if (index === 0) {
      return;
    }
    this.tempcompany.adminTypes[typeindex].levels.splice(index, 1);
  }

  initforms() {
    this.newadminform = this.formBuilder.group<NewAdminType>({
      level: [1, Validators.compose([Validators.required, Validators.min(1)])],
      levels: this.formBuilder.array<AdminLevel>([]),
      name: ["", Validators.required],
      description: ["", Validators.required]
    });
    this.addLevelsform();
  }
}
