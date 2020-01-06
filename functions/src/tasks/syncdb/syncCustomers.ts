import { QuickBooks } from "../../libs/qbmain";
import { firestore } from "firebase-admin";
import { DaudiCustomer, emptyDaudiCustomer } from '../../models/Daudi/customer/Customer';
import { Customer } from "../../models/Qbo/Customer";

/**
 * Fetches all the customer information qbom qbo and overwrites the customers info on Dausi
 * @param qbo
 */
export function syncCustomers(qbo: QuickBooks, omcId: string) {
    /**
     * Limit to 1000 customers for every sync operation
     */
    return qbo.findCustomers([{ Active: [true, false] }]).then(customers => {
        const allcustomers: Array<Customer> = customers.QueryResponse.Customer;
        const batchwrite = firestore().batch();
        return getallcustomers(omcId).then(existingcustomers => {
            const customersarray = existingcustomers.docs.map(doc => doc.data() as DaudiCustomer) || [];
            allcustomers.forEach(customer => {
                /**
                 * Overwrite sandbox customers that conflict id with live, but ignore sandbox customers that conflict with live
                 */
                if (customersarray.find(comp => comp.QbId === customer.Id)) {
                    console.log('ignoring conflicting company');
                    return;
                } else {
                    let co = convertToDaudicustomer(customer, qbo.companyid);
                    if (customersarray.find(company => company.QbId === customer.Id)) {
                        console.log('updating customer');
                        batchwrite.update(
                            firestore()
                                .collection("omc")
                                .doc(omcId)
                                .collection(`customer`)
                                .doc(co.Id),
                            co
                        );
                    } else {
                        co = { ...emptyDaudiCustomer, ...co };
                        console.log('creating company');
                        // console.log(co);
                        batchwrite.set(
                            firestore()
                                .collection("omc")
                                .doc(omcId)
                                .collection(`customer`)
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
    companyid: string
): DaudiCustomer {
    let daudicompany: DaudiCustomer;
    daudicompany = {
        balance: customer.Balance || 0,
        contact: [{
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
        }],
        Active: customer.Active || false,
        /**
         * A firebase id cannot contain '/' hence we use it as the separator
         */
        Id: customer.Id || '',
        name: customer.FullyQualifiedName.toUpperCase(),
        QbId: customer.Id || '',
        krapin: customer.Notes ? customer.Notes.substring(0, 13) : '',
        kraverified: {
            status: false,
            user: null
        },
        location: new firestore.GeoPoint(0, 0)
    };
    return daudicompany;
}

function getallcustomers(omcId: string) {
    return firestore()
        .collection("omc")
        .doc(omcId)
        .collection("customer")
        .get();
}
