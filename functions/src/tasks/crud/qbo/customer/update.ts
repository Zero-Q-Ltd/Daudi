import {Customer} from "../../../../models/Qbo/Customer";
import {DaudiCustomer} from '../../../../models/Daudi/customer/Customer';
import {QuickBooks} from '../../../../libs/qbmain';

export function updateCustomer(customerdata: DaudiCustomer, qbo: QuickBooks) {

    const editedCustomer: Customer = {
        FullyQualifiedName: customerdata.name,
        DisplayName: customerdata.contact[0].name,
        CompanyName: customerdata.name,
        BillAddr: {
            Lat: customerdata.location.latitude,
            Long: customerdata.location.longitude
        },
        // BillAddr : customerdata.location
        PrimaryEmailAddr: {
            Address: customerdata.contact[0].email
        },
        Id: customerdata.QbId,
        /**
         * Assign something for synctoken
         */
        Notes: customerdata.krapin,
        // PrimaryTaxIdentifier: customerdata.krapin,
        PrimaryPhone: {
            FreeFormNumber: customerdata.contact[0].phone
        },
        sparse: true
    };
    return qbo.getCustomer(customerdata.QbId).then(customerdataresponse => {
        let customer = customerdataresponse.Customer as Customer;
        customer = Object.assign(customer, editedCustomer);
        return qbo.updateCustomer(customer);
    });
    // return resolver('Nothing to resolve');
}
