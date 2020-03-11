import {Component, OnInit} from '@angular/core';
import {ReplaySubject} from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor() {
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.comopnentDestroyed.complete();
  }

}
