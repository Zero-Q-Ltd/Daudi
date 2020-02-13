import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { FormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material";
import { DepotConfig, emptyDepotConfig } from "app/models/Daudi/depot/DepotConfig";
import { EmptyEntryDraw, Entry, EntryDraw } from "app/models/Daudi/fuel/Entry";
import { Stock, newStock } from "app/models/Daudi/omc/Stock";
import { MyTimestamp } from "app/models/firestore/firestoreTypes";
import { deepCopy } from "app/models/utils/deepCopy";
import { toObject } from "app/models/utils/SnapshotUtils";
import { CoreService } from "app/services/core/core.service";
import { DepotService } from "app/services/core/depot.service";
import { StocksService } from "app/services/core/stocks.service";
import { EntriesService } from "app/services/entries.service";
import { ReplaySubject } from "rxjs";
import { debounceTime, delay, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { Depot } from "../../../../../../models/Daudi/depot/Depot";
import { FuelType } from "../../../../../../models/Daudi/fuel/FuelType";
import { ASE } from 'app/models/Daudi/fuel/ASE';
import { AseService } from 'app/services/ase.service';

@Component({
    selector: "app-transfer",
    templateUrl: "./transfer.component.html",
    styleUrls: ["./transfer.component.scss"]
})
export class TransferComponent implements OnInit, OnDestroy {
    privateDepots: Depot[] = [];
    selectedDepot: { depot: Depot, config: DepotConfig, stock: Stock };
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
    qtyToDraw = 0;
    depotControl: FormControl = new FormControl({}, [Validators.required]);
    validEntryForms = false;
    validTotals = false;
    selectedEntries: (Entry & EntryDraw)[] = [];
    loadingDepotConfig = false;
    saving = false;
    qtyToDrawControl: FormControl = new FormControl({
        value: 0,
        disabled: true
    },
        [Validators.required, Validators.min(1000),
        Validators.max(1000000),
        Validators.pattern("^[1-9]\\d*$")]);

    constructor(
        @Inject(MAT_DIALOG_DATA) public fuelType: FuelType,
        private db: AngularFirestore,
        private entriesService: EntriesService,
        private depotService: DepotService,
        private stockService: StocksService,
        private aseService: AseService,
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
            .subscribe((depot: Depot) => {
                this.loadingDepotConfig = true;
                Promise.all([
                    this.depotService.depotConfigDoc(this.core.omcId, depot.Id).get(),
                    this.stockService.stockDoc(
                        this.core.currentOmc.value.Id,
                        depot.Id,
                        depot.config.private
                    ).get()])
                    .then(async ([conf, stck]) => {
                        /**
                         * sleep so that the loader does not appear as a glitch in case the value is loaded very fast,
                         *  which will happen more often than not
                         */
                        await delay(1000);

                        const config = toObject(emptyDepotConfig, conf);
                        const stock = toObject(newStock(), stck);
                        this.selectedDepot = { depot, config, stock };
                        this.loadingDepotConfig = false;
                    });
                this.qtyToDrawControl.enable();
            });
    }

    ngOnInit() {
    }
    saveEntryChanges() {
        this.saving = true;
        const batchaction = this.db.firestore.batch();

        this.selectedEntries.forEach(tt => {
            /**
             * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
             * Create another var to avoid mutation of the original values
             */
            const t = deepCopy(tt);
            Object.keys(EmptyEntryDraw).forEach(index => {
                delete t[index];
            });
            const newEntryId = this.core.createId();
            t.qty.used += tt.qtyDrawn;
            t.qty.transferred.total += tt.qtyDrawn;
            t.qty.transferred.transfers.push({
                qty: tt.qtyDrawn,
                depotId: this.selectedDepot.depot.Id,
                entryId: newEntryId
            });
            /**
             * Update each entry independently
             */
            batchaction.update(this.entriesService.entryCollection(this.core.currentOmc.value.Id)
                .doc(t.Id), t);
            /**
             * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
             * For each selected entry create a child entry
             */
            const newEntry: Entry = {
                Amount: 0,
                Id: newEntryId,
                active: true,
                date: MyTimestamp.now(),
                depot: {
                    name: this.selectedDepot.depot.Name,
                    Id: this.selectedDepot.depot.Id
                },
                entry: tt.entry,
                fuelType: this.fuelType,
                price: tt.price,
                qty: {
                    directLoad: {
                        accumulated: {
                            total: 0,
                            usable: 0
                        },
                        total: 0,
                    },
                    total: tt.qtyDrawn,
                    transferred: {
                        total: 0,
                        transfers: []
                    },
                    used: 0
                }
            };
            batchaction.set(this.entriesService.entryCollection(this.core.currentOmc.value.Id).doc(newEntryId),
                newEntry);
        });

        /**
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         * Update Ase quantities in the originating depot
         * We are sure that the oriogin is a KPc depot
         */
        const tempStockVal = deepCopy(this.core.stock.value);
        tempStockVal.qty[this.fuelType].ase -= Number(this.qtyToDrawControl.value);
        batchaction.update(
            this.stockService.stockDoc(this.core.omcId,
                this.core.activedepot.value.depot.Id,
                this.core.activedepot.value.depot.config.private)
            , tempStockVal);
        /**
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         * Create an ase for the destination depot
         * Every transfer has only one ASE, irrespective of how many entries have been chosen
         */
        const newAse: ASE = {
            qty: this.qtyToDrawControl.value,
            Amount: null,
            Id: this.core.createId(),
            active: true,
            ase: {
                QbId: null,
                qty: this.qtyToDrawControl.value
            },
            date: new MyTimestamp(0, 0),
            depot: {
                name: this.selectedDepot.depot.Name,
                Id: this.selectedDepot.depot.Id
            },
            fuelType: this.fuelType,
            price: null
        }

        batchaction.set(this.aseService.ASECollection(this.core.omcId).doc(newAse.Id), newAse);

        /**
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         * Update stock quantities in the destination depot
         */
        const tempStock = deepCopy(this.selectedDepot.stock);
        tempStock.qty[this.fuelType].ase += Number(this.qtyToDrawControl.value);
        if (this.selectedDepot.config.initialised) {
            batchaction.update(this.stockService.stockDoc(this.core.omcId, this.selectedDepot.depot.Id, true), tempStock);
        } else {
            batchaction.set(this.stockService.stockDoc(this.core.omcId, this.selectedDepot.depot.Id, true), tempStock);
        }
        /**
         * submit... Phew... I know
         * But finally, we're here
         */
        batchaction.commit().then(res => {
            this.saving = false;
        });
    }

    ngOnDestroy(): void {
        this.comopnentDestroyed.next(true);
    }
}
