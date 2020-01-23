import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {CoreService} from 'app/services/core/core.service';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Depot} from '../../../../../../models/Daudi/depot/Depot';
import {FuelType} from '../../../../../../models/Daudi/fuel/FuelType';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit, OnDestroy {
  privateDepots: Depot[] = [];
  selectedDepot: Depot;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  qty = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public fuelType: FuelType,
    private core: CoreService) {
    this.core.depots.pipe(takeUntil(this.comopnentDestroyed)).subscribe(depots => {
      /**
       * Only allow fuel to be transferred to a private depot
       */
      this.privateDepots = depots.filter(d => d.config.private);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
  }
}
