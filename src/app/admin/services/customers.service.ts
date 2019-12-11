import { Injectable } from "@angular/core";
import { Customer } from "../../models/Daudi/customer/Customer";
import { AngularFirestore } from "@angular/fire/firestore";
import { DepotService } from "./core/depot.service";
import { BehaviorSubject, Observable, combineLatest } from "rxjs";
import { AngularFireFunctions } from "@angular/fire/functions";
import { distinctUntilKeyChanged, distinctUntilChanged, skipWhile } from "rxjs/operators";
import { ConfigService } from "./core/config.service";
import { OmcService } from "./core/omc.service";

@Injectable({
  providedIn: "root"
})
export class CustomerService {
  allcustomers: BehaviorSubject<Array<Customer>> = new BehaviorSubject<Array<Customer>>([]);
  loadingcustomers: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();

  constructor(
    private db: AngularFirestore,
    private depotsservice: DepotService,
    private config: ConfigService,
    private omc: OmcService,
    private functions: AngularFireFunctions) {
    combineLatest(this.config.environment, this.omc.currentOmc)
      .pipe(skipWhile(t => !t[1].Id))
      .subscribe(t => {
        this.unsubscribeAll();
        this.getallcustomers();
      });

  }

  /**
   * When a new company is created, it's unique identifier is the KRA pin but we need the QbID when creating any order, hence we use this vaue to cross-check
   * @param krapin
   */
  queryActivecompany(krapin: string) {
    return this.db.firestore.collection("omc")
      .doc(this.omc.currentOmc.value.Id)
      .collection("customers")
      .where("krapin", "==", krapin)
      .where("Active", "==", true)
      .limit(1);
  }

  getcompany(companyid) {
    return this.db.firestore.collection("customers")
      .doc(companyid);
  }

  getallcustomers() {
    this.loadingcustomers.next(true);
    const subscriprion = this.db.firestore.collection("omc")
      .doc(this.omc.currentOmc.value.Id)
      .collection("customers")
      .where("sandbox", "==", this.config.environment.value)
      .onSnapshot(snapshot => {
        this.allcustomers.next(snapshot.docs.map(value => {
          const co: Customer = value.data() as Customer;
          co.Id = value.id;
          return co;
        }));
        this.loadingcustomers.next(false);
      });
    this.subscriptions.set("allcustomers", subscriprion);
  }

  unsubscribeAll() {
    this.subscriptions.forEach(value => {
      value();
    });
  }

  /**
   * The KRA PIN to checked for uniqueness
   * @param {string} krapin
   */
  verifykra(krapin: string) {
    return this.db.firestore.collection("omc")
      .doc(this.omc.currentOmc.value.Id)
      .collection("customers")
      .where("krapin", "==", krapin);
  }

  querycustomers(customer: string, maxstring: string) {
    return this.db.firestore.collection("omc")
      .doc(this.omc.currentOmc.value.Id)
      .collection("customers")
      .where("name", ">=", customer)
      .where("name", "<", maxstring)
      .where("Active", "==", true)
      .where("companyId", "==", this.config.getEnvironment().auth.companyId);
  }

  createcompany(company: Customer): Observable<any> {
    company.companyId = this.db.createId();
    return this.functions.httpsCallable("createcustomer")(company);
  }


  updatecompany(companyid: string) {
    return this.db.firestore.collection("customers").doc(companyid);
  }

}
