import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {EquityBulk} from 'app/models/ipn/EquityBulk';
import {BehaviorSubject} from 'rxjs';
import {AdminConfigService} from './core/admin-config.service';
import {DepotService} from './core/depot.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  proddbstring = 'prodpayments';
  sandboxdbstring = 'sandboxpayments';
  unprocessedpayments: BehaviorSubject<EquityBulk[]> = new BehaviorSubject<EquityBulk[]>([]);

  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();

  constructor(
    private db: AngularFirestore,
    private config: AdminConfigService,
    private depotservice: DepotService) {

  }

  getrecentpayments() {

  }

  getunprocessedpayments(): void {
    // const subscription = this.db.firestore.collection(this.sandoox ? this.sandboxdbstring : this.proddbstring)
    //   .where("daudiFields.status", "==", 0)
    //   .onSnapshot(snapshot => {
    //     this.unprocessedpayments.next(snapshot.docs.map(value => value.data() as ipnmodel));
    //   });
    // this.subscriptions.set("getunprocessedpayments", subscription);
  }

  unsubscribeAll() {
    this.subscriptions.forEach(value => {
      value();
    });
  }
}
