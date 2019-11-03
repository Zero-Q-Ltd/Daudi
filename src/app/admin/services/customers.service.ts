import { Injectable } from "@angular/core";
import { Customer } from "../../models/customer/Customer";
import { AngularFirestore } from "@angular/fire/firestore";
import { DepotService } from "./core/depot.service";
import { BehaviorSubject, Observable } from "rxjs";
import { AngularFireFunctions } from "@angular/fire/functions";
import { distinctUntilKeyChanged } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class CustomerService {
  allcompanies: BehaviorSubject<Array<Customer>> = new BehaviorSubject<Array<Customer>>([]);
  loadingcompanies: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  depotAttachedCompany = "";

  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();


  constructor(private db: AngularFirestore,
    private depotsservice: DepotService,
    private functions: AngularFireFunctions) {
    this.depotsservice.activedepot.pipe(distinctUntilKeyChanged("companyId")).subscribe(depot => {
      if (depot.Id) {
        this.depotAttachedCompany = depot.companyId;
        this.unsubscribeAll();
        this.getallcompanies();
      }
    });
  }

  /**
   * When a new company is created, it's unique identifier is the KRA pin but we need the QbID when creating any order, hence we use this vaue to cross-check
   * @param krapin
   */
  queryActivecompany(krapin: string) {
    return this.db.firestore.collection("companies")
      .where("krapin", "==", krapin)
      .where("Active", "==", true)
      .limit(1);
  }

  getcompany(companyid) {
    return this.db.firestore.collection("companies")
      .doc(companyid);
  }

  getallcompanies() {
    this.loadingcompanies.next(true);
    const subscriprion = this.db.firestore.collection("companies")
      .where("sandbox", "==", this.depotsservice.activedepot.value.sandbox)
      .onSnapshot(snapshot => {
        this.allcompanies.next(snapshot.docs.map(value => {
          const co: Customer = value.data() as Customer;
          co.Id = value.id;
          return co;
        }));
        this.loadingcompanies.next(false);
      });
    this.subscriptions.set("allcompanies", subscriprion);
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
    return this.db.firestore.collection("companies")
      .where("krapin", "==", krapin);
  }

  querycompanies(companyname: string, maxstring: string) {
    return this.db.firestore.collection("companies")
      .where("name", ">=", companyname)
      .where("name", "<", maxstring)
      .where("Active", "==", true)
      .where("companyId", "==", this.depotsservice.activedepot.value.companyId);
  }

  createcompany(company: Customer): Observable<any> {
    company.companyId = this.db.createId();
    return this.functions.httpsCallable("createcustomer")(company);
  }


  updatecompany(companyid: string) {
    return this.db.firestore.collection("companies").doc(companyid);
  }

}
