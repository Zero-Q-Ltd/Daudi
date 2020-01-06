import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireFunctions } from "@angular/fire/functions";
import { Observable } from "rxjs";
import { DaudiCustomer } from "../../models/Daudi/customer/Customer";

@Injectable({
  providedIn: "root"
})
export class CustomerService {

  constructor(
    private db: AngularFirestore,
    private functions: AngularFireFunctions) {


  }

  /**
   * When a new company is created, it's unique identifier is the KRA pin but we need the QbID when creating any order, hence we use this vaue to cross-check
   * @param krapin
   */
  queryActivecompany(krapin: string, omcId: string) {
    return this.customerCollection(omcId)
      .where("krapin", "==", krapin)
      .where("Active", "==", true)
      .limit(1);
  }

  getcompany(omcId: string, customerid: string) {
    return this.customerCollection(omcId)
      .doc(customerid);
  }


  /**
   * The KRA PIN to checked for uniqueness
   * @param {string} krapin
   */
  verifykra(krapin: string, omcId: string) {
    return this.customerCollection(omcId)
      .where("krapin", "==", krapin);
  }

  customerCollection(omcId: string) {
    return this.db.firestore.collection("omc")
      .doc(omcId)
      .collection(`customer`);
  }

  createcompany(company: DaudiCustomer): Observable<any> {
    return this.functions.httpsCallable("createcustomer")(company);
  }


  updateCustomer(customer: DaudiCustomer, omcId: string) {
    return this.customerCollection(omcId)
      .doc(customer.Id)
      .update(customer);
  }

}
