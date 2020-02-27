import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { AdminConfigService } from './core/admin-config.service';
import { DepotService } from './core/depot.service';
import { DaudiPayment } from 'app/models/payment/DaudiPayment';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  unprocessedpayments: BehaviorSubject<DaudiPayment[]> = new BehaviorSubject<DaudiPayment[]>([]);

  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();


  constructor(
    private db: AngularFirestore,
    private config: AdminConfigService,
    private depotservice: DepotService) {

  }


  paymentsCollection(omcId: string) {
    return this.db.firestore.collection('omc')
      .doc(omcId)
      .collection('payments')
  }
  paymentsDoc(omcId: string, paymentId: string) {
    return this.paymentsCollection(omcId)
      .doc(paymentId)
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
