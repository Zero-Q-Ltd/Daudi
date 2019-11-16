import { OMC } from "../../../../models/Daudi/omc/OMC";
import { Config } from "../../../../models/Daudi/omc/Config";
import { createQbo } from "../../../sharedqb";
import { firestore } from "firebase-admin";
import { Environment } from "../../../../models/Daudi/omc/Environments";

export function createCompanyInfo(omc: OMC, config: Config, environment: Environment) {
    const newCustomer = {

    };
    return createQbo(omc.Id, config, environment).then(result => {
        const qbo = result;
        return qbo.createCustomer(newCustomer).then(innerresult => {
            console.log(innerresult);
            customerdata.QbId = innerresult.Customer.Id;
            return firestore()
                .collection("companies")
                .doc(customerdata.QbId)
                .set(customerdata)
                .then(() => {
                    return customerdata;
                });
        });
    });
}
