import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { BatchTrucksComponent } from 'app/components/batch-trucks/batch-trucks.component';
import { Depot } from 'app/models/Daudi/depot/Depot';
import { AdminService } from 'app/services/core/admin.service';
import { CoreService } from 'app/services/core/core.service';
import { DepotService } from 'app/services/core/depot.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss']
})

export class AdminComponent implements OnInit, OnDestroy {

    position = 'above';
    phoneControl: FormControl = new FormControl({ value: '' }, [Validators.required, Validators.maxLength(8), Validators.minLength(8)]);

    alldepots: Depot[];
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    constructor(
        private adminservice: AdminService,
        private dialog: MatDialog,
        private core: CoreService,
        private depotsservice: DepotService) {

        this.core.depots.pipe(takeUntil(this.comopnentDestroyed)).subscribe(depots => {
            this.alldepots = depots;
        });
    }

    isauthenticated(level) {
        if (this.adminservice.userdata.config.level <= level) {
            return true;
            // console.log('authenticated')
        } else {
            return false;
        }
    }

    ngOnInit() {

    }

    ngOnDestroy(): void {
        this.comopnentDestroyed.next(true);
        this.comopnentDestroyed.complete();
    }

    openBatchTrucks(batchkey, batchdId) {
        // console.log(batchkey, batchdId);
        const dialogRef = this.dialog.open(BatchTrucksComponent, {
            role: 'dialog',
            data: {
                batchkey,
                batchdId
            },
            height: 'auto'
            // width: '100%%',

        });

    }

}
