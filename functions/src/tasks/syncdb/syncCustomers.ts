import { QuickBooks } from "../../libs/qbmain";
import { firestore } from "firebase-admin";
import { DaudiCustomer, emptyDaudiCustomer } from '../../models/Daudi/customer/Customer';
import { Customer } from "../../models/Qbo/Customer";
import { getallcustomers } from "../crud/daudi/getallcustomers";

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
                let co = convertToDaudicustomer(customer);
                if (customersarray.find(company => company.QbId === customer.Id)) {
                    console.log('updating customer');
                    batchwrite.update(
                        firestore()
                            .collection("omc")
                            .doc(omcId)
                            .collection(`customers`)
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
                            .collection(`customers`)
                            .doc(co.Id),
                        co
                    );
                }
            });
            return batchwrite.commit();
        });
    });
}

function convertToDaudicustomer(
    customer: Customer,
): DaudiCustomer {
    let daudicompany: DaudiCustomer;
    daudicompany = {
        balance: customer.Balance || 0,
        contact: [{
            email: customer.PrimaryEmailAddr
                ? customer.PrimaryEmailAddr.Address.toLowerCase()
                : '',
            /**
             * Standardise how names are stored in db
             */
            name: customer.DisplayName.toUpperCase(),
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

        Id: customer.Id || '',
        /**
        * Standardise how names are stored in db
        */
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


