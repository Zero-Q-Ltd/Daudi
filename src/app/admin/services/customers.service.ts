import { Injectable } from "@angular/core";
import { AngularFirestore, QueryFn } from "@angular/fire/firestore";
import { AngularFireFunctions } from "@angular/fire/functions";
import { Observable } from "rxjs";
import { DaudiCustomer, emptyDaudiCustomer } from "../../models/Daudi/customer/Customer";
import { Environment } from "../../models/Daudi/omc/Environments";
import { ConfigService } from "./core/config.service";
import { OmcService } from "./core/omc.service";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class CustomerService {

  constructor(
    private db: AngularFirestore,
    private config: ConfigService,
    private omc: OmcService,
    private functions: AngularFireFunctions) {


  }

  /**
   * When a new company is created, it's unique identifier is the KRA pin but we need the QbID when creating any order, hence we use this vaue to cross-check
   * @param krapin
   */
  queryActivecompany(krapin: string, omcid: string) {
    return this.db.firestore.collection("omc")
      .doc(omcid)
      .collection("customer")
      .where("krapin", "==", krapin)
      .where("Active", "==", true)
      .limit(1);
  }

  getcompany(companyid) {
    return this.db.firestore.collection("customer")
      .doc(companyid);
  }


  /**
   * The KRA PIN to checked for uniqueness
   * @param {string} krapin
   */
  verifykra(krapin: string, omcid: string) {
    return this.db.firestore.collection("omc")
      .doc(omcid)
      .collection("customer")
      .where("krapin", "==", krapin);
  }

  queryCustomers(queryFn: QueryFn, omcid: string, environment: Environment) {
    return this.db.collection<DaudiCustomer>("omc", queryFn)
      .doc(omcid)
      .collection("order")
      .snapshotChanges()
      .pipe(map(t => {
        return t.map(data => {
            return {
              ...emptyDaudiCustomer, ...{ Id: data.payload.doc.id }, ...data.payload.doc.data()
            };
          })
      }
      ));
  }

  createcompany(company: DaudiCustomer): Observable<any> {
    return this.functions.httpsCallable("createcustomer")(company);
  }


  updateCustomer(companyid: string, omcid: string) {
    return this.db.firestore.collection("omc")
      .doc(omcid)
      .collection("customer")
      .doc(companyid);
    // .update(customer);
  }

}
