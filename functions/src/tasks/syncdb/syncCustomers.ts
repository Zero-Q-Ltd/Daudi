import { QuickBooks } from "../../libs/qbmain";
import { firestore } from "firebase-admin";
import { Customer } from "../../models/Qbo/Customer";
import { Company_, emptycompany } from "../../models/Daudi/Company";

/**
 * Fetches all the customer information qbom qbo and overwrites the Companies info on Dausi
 * @param qbo
 */
export function syncCustomers(qbo: QuickBooks) {
  /**
   * Limit to 1000 customers for every sync operation
   */
  return qbo.findCustomers([{ Active: [true, false] }]).then(customers => {
    const allcustomers: Array<Customer> = customers.QueryResponse.Customer;
    const batchwrite = firestore().batch();
    return getallcompanies().then(allcompanies => {
      const companiesarray =
        allcompanies.docs.map(doc => doc.data() as Company_) || [];
      allcustomers.forEach(customer => {
        /**
         * Overwrite sandbox companies that conflict id with live, but ignore sandbox companies that conflict with live
         */
        if (
          companiesarray.find(
            comp =>
              comp.QbId === customer.Id &&
              comp.companyId !== qbo.companyid &&
              qbo.sandbox
          )
        ) {
          // console.log('ignoring conflicting company');
          return;
        } else {
          let co = convertToDaudicustomer(customer, qbo.sandbox, qbo.companyid);
          if (companiesarray.find(company => company.QbId === customer.Id)) {
            // console.log('updating company');
            batchwrite.update(
              firestore()
                .collection("companies")
                .doc(co.Id),
              co
            );
          } else {
            co = Object.assign({}, emptycompany, co);
            // console.log('creating company');
            // console.log(co);
            batchwrite.set(
              firestore()
                .collection("companies")
                .doc(co.Id),
              co
            );
          }
        }
      });
      return batchwrite.commit();
    });
  });
}

function convertToDaudicustomer(
  customer: Customer,
  sandbox: boolean,
  companyid: string
): Company_ {
  let daudicompany: Company_;
  daudicompany = {
    sandbox: sandbox,
    balance: customer.Balance || 0,
    contact: {
      email: customer.PrimaryEmailAddr
        ? customer.PrimaryEmailAddr.Address
        : '',
      name: customer.DisplayName,
      /**
       * Only take the last 9 chars of the string, remove all whitespaces
       */
      phone: customer.PrimaryPhone
        ? customer.PrimaryPhone.FreeFormNumber.replace(/-|\s/g, "").substr(
          customer.PrimaryPhone.FreeFormNumber.length - 9
        )
        : ''
    },
    Active: customer.Active || false,
    /**
     * A firebase id cannot contain '/' hence we use it as the separator
     */
    Id: customer.Id || '',
    name: customer.FullyQualifiedName.toUpperCase(),
    QbId: customer.Id || '',
    krapin: customer.Notes ? customer.Notes.substring(0, 13) : '',
    companyId: companyid,
    location: new firestore.GeoPoint(0, 0)
  };
  return daudicompany;
}

function getallcompanies() {
  return firestore()
    .collection("companies")
    .get();
}
