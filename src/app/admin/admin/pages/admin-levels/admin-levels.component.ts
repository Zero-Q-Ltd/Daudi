import {Component, OnDestroy, OnInit} from "@angular/core";
import {MatDialog} from "@angular/material";
import {AdminConfigService} from "../../../services/core/admin-config.service";
import {ReplaySubject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {emptyomc, OMC} from "../../../../models/Daudi/omc/OMC";
import {FormArray, FormBuilder, FormGroup} from "ngx-strongly-typed-forms";

import {NotificationService} from "../../../../shared/services/notification.service";
import * as firebase from "firebase";
import {AdminType, NewAdminType} from "../../../../models/Daudi/admin/AdminType";
import {Validators} from "@angular/forms";
import {AdminLevel} from "../../../../models/Daudi/admin/AdminLevel";
import {Meta} from "../../../../models/Daudi/universal/Meta";
import {Metadata} from "../../../../models/Daudi/universal/Metadata";
import {AdminService} from "../../../services/core/admin.service";
import {ConfirmDialogComponent} from "../../../confirm-dialog/confirm-dialog.component";
import {deepCopy} from "../../../../models/utils/deepCopy";
import {CoreService} from "../../../services/core/core.service";
import {AdminConfig} from "../../../../models/Daudi/omc/Config";

@Component({
    selector: "app-admin-levels",
    templateUrl: "./admin-levels.component.html",
    styleUrls: ["./admin-levels.component.scss"]
})
export class AdminLevelsComponent implements OnInit, OnDestroy {
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
    newadminform: FormGroup<NewAdminType>;
    originalCompany: OMC = deepCopy<OMC>(emptyomc);
    config: AdminConfig;

    constructor(
        private companyservice: AdminConfigService,
        private formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private core: CoreService,
        private notificationservice: NotificationService,
        private adminService: AdminService,
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
        this.core.adminConfig.pipe(takeUntil(this.comopnentDestroyed)).subscribe(conf => {
            this.config = conf;
            this.initforms();
        });
    }

    saveadminType(): void {
        const newtype: NewAdminType = this.newadminform.getRawValue();
        const meta: Meta = {
            adminId: this.adminService.userdata.Id,
            date: firebase.firestore.Timestamp.now()
        };

        const newMeta: Metadata = {
            created: meta,
            edited: meta
        };
        const withMeta: AdminType = Object.assign({}, newtype, {metadata: newMeta});
        // @TODO temporary hack
        // @ts-ignore
        delete (withMeta.level);
        // this.tempcompany.adminTypes.splice(newtype.level, 0, withMeta);
        this.savecompany();
    }

    savecompany(): void {
        const dialogRef = this._matDialog.open(ConfirmDialogComponent,

            {
                role: "dialog",
                data: `Are you sure?`
            });
        dialogRef.afterClosed().pipe(takeUntil(this.comopnentDestroyed)).subscribe(result => {
            if (result) {
                // this.companyservice.saveConfig(this.tempcompany).then(() => {
                //   this.notificationservice.notify({
                //     title: "SAVED",
                //     body: ""
                //   });
                // });
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
        // this.tempcompany.adminTypes[index].levels.push({
        //   description: "",
        //   name: ""
        // });
    }

    deleteTypedirect(index: number) {
        const dialogRef = this._matDialog.open(ConfirmDialogComponent,
            {
                role: "dialog",
                data: `Are you sure?`
            });
        dialogRef.afterClosed().pipe(takeUntil(this.comopnentDestroyed)).subscribe(result => {
            if (result) {
                // this.tempcompany.adminTypes.splice(index, 1);
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
        // this.tempcompany.adminTypes[typeindex].levels.splice(index, 1);
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
