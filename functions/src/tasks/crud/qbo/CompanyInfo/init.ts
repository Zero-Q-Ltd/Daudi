import { OMC } from "../../../../models/Daudi/omc/OMC";
import { Config } from "../../../../models/Daudi/omc/Config";
import { createQbo } from "../../../sharedqb";
import { firestore } from "firebase-admin";
import { Environment } from "../../../../models/Daudi/omc/Environments";
import { CompanyInfo } from "../../../../models/Qbo/CompanyInfo";
export function initCompanyInfo(omc: OMC, config: Config, environment: Environment) {
    /**
     * Convert Daudi OMC to QBO company Info
       */
    const companyInfo: CompanyInfo = {
        CompanyAddr: {
            City: "Kenya",
            Country: "Kenya",
            CountrySubDivisionCode: "Ke",
            Id: "1",
            Line1: "",
            PostalCode: ""
        },
        CompanyName: omc.name,
        Country: "Kenya",
        sparse: true,
        domain: "QBO",
    }
    return createQbo(omc.Id, config, environment).then(result => {
        const qbo = result;
        return qbo.updateCompanyInfo(companyInfo).then(operationresult => {
            // console.log(innerresult);
            // const batch = firestore().batch();

            // batch.update(
            //     firestore()
            //         .collection("omc")
            //         .doc(omc.Id)
            //         .collection("config")
            //         .doc("main"),
            //     config
            // );
            const res = operationresult.CompanyInfo as Array<CompanyInfo>
            res.forEach(item => {
                config.Qbo[environment].fuelconfig[item.Name].QbId = item.Id
            })
            return firestore()
                .collection("omc")
                .doc(omc.Id)
                .collection("config")
                .doc("main")
                .update(config)
        });
    });
}