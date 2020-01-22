import { animate, sequence, state, style, transition, trigger } from '@angular/animations';
import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { AdminService } from 'app/services/core/admin.service';
import { CoreService } from 'app/services/core/core.service';
import * as moment from 'moment';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SyncRequest } from '../../../../models/Cloud/Sync';
import { Admin, emptyadmin } from '../../../../models/Daudi/admin/Admin';
import { Depot } from '../../../../models/Daudi/depot/Depot';
import { emptyomc, OMC } from '../../../../models/Daudi/omc/OMC';
import { MyTimestamp } from '../../../../models/firestore/firestoreTypes';
import { NotificationService } from '../../../../shared/services/notification.service';
@Component({
    selector: "user-management",
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss'],
    animations: [
        trigger('flyIn', [
            state('in', style({ transform: 'translateX(0)' })),
            transition('void => *', [
                style({ height: '*', opacity: '0', transform: 'translateX(-550px)', 'box-shadow': 'none' }),
                sequence([
                    animate('.20s ease', style({ height: '*', opacity: '.2', transform: 'translateX(0)', 'box-shadow': 'none' })),
                    animate('.15s ease', style({ height: '*', opacity: 1, transform: 'translateX(0)' }))
                ])
            ])
        ]),
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
        ])]
})

export class UserManagementComponent implements OnInit, OnDestroy {

    usersdatasource = new MatTableDataSource<Admin>();
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    creatingsync = false;
    displayedColumns: string[] = ['photo', 'QbId', 'name', 'email', 'phone', 'type', 'level', 'sandbox', 'depot', 'status', 'action'];
    activeuser: Admin = emptyadmin;
    loadingadmins = true;
    saving = false;
    alldepots: Depot[];
    expandedEAdmin: Admin;
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
    originalCompany: OMC = { ...emptyomc };

    constructor(
        private adminservice: AdminService,
        private functions: AngularFireFunctions,
        private notification: NotificationService,
        private adminsService: AdminService,
        private core: CoreService) {
        this.core.activedepot.pipe(takeUntil(this.comopnentDestroyed)).subscribe(depotvata => {
            if (depotvata.depot.Id) {
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
                this.core.adminConfig.pipe(takeUntil(this.comopnentDestroyed)).subscribe(co => {
                    // this.originalCompany = co;
                });
            }
        });
        this.core.depots.pipe(takeUntil(this.comopnentDestroyed)).subscribe(depots => {
            this.alldepots = depots;
        });

    }

    @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
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
            time: MyTimestamp.now(),
            synctype: ['Employee']
        };
        this.functions.httpsCallable('requestsync')(syncobject).pipe(takeUntil(this.comopnentDestroyed)).subscribe(res => {
            this.creatingsync = false;
            this.notification.notify({
                alert_type: 'success',
                title: 'Success',
                body: 'Users Synchronized'
            });
        });
    }

    savechanges() {
        // console.log(admin);
        this.saving = true;
        if (this.expandedEAdmin.config.level >= this.activeuser.config.level) {
            this.adminsService.updateadmin(this.expandedEAdmin).then(_ => {
                this.saving = false;
                this.notification.notify({
                    alert_type: 'success',
                    title: 'Success',
                    body: 'Admin Updated'
                });
            });
        } else {
            this.saving = false;
            this.notification.notify({
                alert_type: 'error',
                title: 'ERROR',
                body: 'You are not authorised to perform this action'
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

    converttime(MyTimestamp) {
        if (MyTimestamp) {
            return `Last Seen ${moment(MyTimestamp).fromNow()}`;
        } else {
            return 'Uknown Last Seen';
        }
    }

    getimage(image) {
        // console.log(image)
        if (image) {
            return image;
        } else {
            return '/assets/images/EmkayLogoBMP.svg';
        }
    }
}
