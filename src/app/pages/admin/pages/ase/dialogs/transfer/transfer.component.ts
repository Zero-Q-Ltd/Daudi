import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Entry } from 'app/models/Daudi/fuel/Entry';
import { CoreService } from 'app/services/core/core.service';
import { ReplaySubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Depot } from '../../../../../../models/Daudi/depot/Depot';
import { FuelType } from '../../../../../../models/Daudi/fuel/FuelType';

@Component({
    selector: 'app-transfer',
    templateUrl: './transfer.component.html',
    styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit, OnDestroy {
    privateDepots: Depot[] = [];
    selectedDepot: Depot;
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
    qtyToDraw = 0;
    depotControl: FormControl = new FormControl({}, [Validators.required]);
    validEntryForms = false;
    validTotals = false;
    selectedEntries: Entry[] = [];
    qtyToDrawControl: FormControl = new FormControl({
        value: 0,
        disabled: true
    },
        [Validators.required, Validators.min(1000),
        Validators.max(1000000),
        Validators.pattern('^[1-9]\\d*$')]);

    constructor(
        @Inject(MAT_DIALOG_DATA) public fuelType: FuelType,
        private core: CoreService) {
        this.core.depots.pipe(takeUntil(this.comopnentDestroyed)).subscribe(depots => {
            /**
             * Only allow fuel to be transferred to a private depot
             */
            this.privateDepots = depots.filter(d => d.config.private);
        });
        this.depotControl.valueChanges
            .pipe(debounceTime(400),
                distinctUntilChanged())
            .subscribe(value => {
                this.selectedDepot = value;
                this.qtyToDrawControl.enable();
            });
    }

    ngOnInit() {
    }
    saveEntryChanges() {

    }

    ngOnDestroy(): void {
        this.comopnentDestroyed.next(true);
    }
}
