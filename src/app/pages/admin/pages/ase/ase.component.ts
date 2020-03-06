import { Component, OnInit, ViewChild } from '@angular/core';
import { newStock, Stock } from 'app/models/Daudi/omc/Stock';
import { AseService } from 'app/services/ase.service';
import { CoreService } from 'app/services/core/core.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ASE, newAse } from '../../../../models/Daudi/fuel/ASE';
import { FuelNamesArray, FuelType } from '../../../../models/Daudi/fuel/FuelType';
import { NotificationService } from '../../../../shared/services/notification.service';
import { CoreAdminService } from '../../services/core.service';
import { TransferComponent } from './dialogs/transfer/transfer.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: "app-ase",
    templateUrl: "./ase.component.html",
    styleUrls: ["./ase.component.scss"]
})
export class AseComponent implements OnInit {
    fueltypesArray = FuelNamesArray;
    datasource = {
        pms: new MatTableDataSource<ASE>(),
        ago: new MatTableDataSource<ASE>(),
        ik: new MatTableDataSource<ASE>()
    };
    creatingsync = false;
    @ViewChild(MatPaginator, { static: true }) pmspaginator: MatPaginator;
    @ViewChild(MatPaginator, { static: true }) agopaginator: MatPaginator;
    @ViewChild(MatPaginator, { static: true }) ikpaginator: MatPaginator;
    displayedColumns: string[] = ["date", "id", "totalqty"];
    loading: {
        pms: boolean,
        ago: boolean,
        ik: boolean
    } = {
            pms: true,
            ago: true,
            ik: true
        };

    /**
     * this keeps a local copy of all the subscriptions within this service
     */
    subscriptions: Map<string, any> = new Map<string, any>();
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
    private = true;
    stock: Stock = { ...newStock() };
    typedValue: string

    constructor(
        private notification: NotificationService,
        private core: CoreService,
        private coreAdmin: CoreAdminService,
        private dialog: MatDialog,
        private aseService: AseService) {
        this.core.activedepot.pipe(takeUntil(this.comopnentDestroyed)).subscribe(depotdata => {
            this.loading = {
                pms: true,
                ago: true,
                ik: true
            };
            this.core.stock.subscribe(stock => {
                this.stock = stock;
            });
            if (depotdata.depot.Id) {
                /**
                 * Only show transfer column when in a KPC depot
                 */
                this.private = depotdata.depot.config.private;
                this.fueltypesArray.forEach((fueltype: FuelType) => {
                    /**
                     * Create a subscrition for 100 batches history
                     */
                    let queryvalue = this.aseService.ASECollection(this.core.currentOmc.value.Id)
                        // .where("active", "==", true)
                        .where("fuelType", "==", fueltype)
                        .orderBy('active', 'desc')
                    /**
                     * Filter by depot if its a privtae depot
                     */
                    if (this.core.activedepot.value.depot.config.private) {
                        queryvalue = queryvalue.where("depot.Id", "==", this.core.activedepot.value.depot.Id);
                    } else {
                        queryvalue = queryvalue.where("depot.Id", "==", null);
                    }

                    const subscription = queryvalue.limit(100)
                        .onSnapshot(snapshot => {
                            this.loading[fueltype] = false;
                            this.datasource[fueltype].data = snapshot.docs.map(ase => {
                                const value: ASE = Object.assign({}, newAse(), ase.data()) as any;
                                value.Id = ase.id;
                                return value;
                            });
                        });
                    this.subscriptions.set(`ases`, subscription);
                });
            }
        });
    }

    ngOnDestroy(): void {
        this.comopnentDestroyed.next(true);
        this.unsubscribeAll();
    }

    unsubscribeAll() {
        this.subscriptions.forEach(value => {
            value();
        });
    }

    trasfer(fuelType: FuelType) {
        const dialogRef = this.dialog.open(TransferComponent, {
            role: "dialog",
            data: fuelType,
            height: "auto",
            width: "75%",
        });

    }

    syncdb() {
        this.creatingsync = true;
        this.coreAdmin.syncdb(["BillPayment"])
            .then(res => {
                this.creatingsync = false;
                this.notification.notify({
                    alert_type: "success",
                    body: "Entries updated",
                    title: "Success"
                });
            },
                err => {
                    console.error(err);
                    this.creatingsync = false;
                    this.notification.notify({
                        alert_type: "error",
                        body: "Error Syncronising",
                        title: "Error"
                    });
                });
    }

    getTotalAvailable(batch: ASE) {
        // const totalqty = batch.qty.total;
        // const totalLoaded = batch.qty.directLoad.total + batch.qty.transferred.total;
        // return totalqty - totalLoaded;
        return 0;
    }

    ngOnInit() {
        this.datasource.pms.paginator = this.pmspaginator;
        this.datasource.ago.paginator = this.agopaginator;
        this.datasource.ik.paginator = this.ikpaginator;
    }

    filterbatches(fueltype: string, filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
        this.datasource[fueltype].filter = filterValue;
    }
}
