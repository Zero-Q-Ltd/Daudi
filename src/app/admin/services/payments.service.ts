import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { DepotService } from "./core/depot.service";
import { BehaviorSubject } from "rxjs";
import { ipnmodel } from "../../models/Daudi/universal/universal";
import { distinctUntilKeyChanged } from "rxjs/operators";
import { ConfigService } from "./core/config.service";

@Injectable({
  providedIn: "root"
})
export class PaymentsService {

  proddbstring = "prodpayments";
  sandboxdbstring = "sandboxpayments";
  unprocessedpayments: BehaviorSubject<Array<ipnmodel>> = new BehaviorSubject<Array<ipnmodel>>([]);

  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();

  constructor(
    private db: AngularFirestore,
    private config: ConfigService,
    private depotservice: DepotService) {
    /**
     * only fetch payments when the companyId of activedepot changes
     */
    this.config.environment.subscribe(depot => {
      this.unsubscribeAll();
      this.getunprocessedpayments();
    });
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
