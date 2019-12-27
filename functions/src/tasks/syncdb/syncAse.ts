import { QuickBooks } from "../../libs/qbmain";
import { Bill } from "../../models/Qbo/Bill";
import * as moment from "moment";
import { firestore } from "firebase-admin";
import { Depot } from "../../models/Daudi/depot/Depot";
import { Entry } from "../../models/Daudi/fuel/Entry";
import { FuelType, FuelNamesArray } from "../../models/Daudi/fuel/FuelType";
import { FuelConfig } from "../../models/Daudi/omc/FuelConfig";
import { ASE } from "../../models/Daudi/fuel/ASE";

/**
 * 
 * @param qbo QBO Class containing valid auth tokens
 * @param fuelConfig COnfig having valid ID's
 * @param since 
 */
export function syncAse(qbo: QuickBooks, omcId: string, fuelConfig: { [key in FuelType]: FuelConfig }) {
    return qbo
        .findBills([
            /**
             * Get only the bills(Entries numbers) that have been fully paid
             */
            { field: "Balance", value: "1", operator: "<" },
            /**
             * fetch only bills that have been paid for Entry
             * Fetch all the fuel types at once
             */
            FuelNamesArray.map(fuel => {
                return { field: "Line.ItemBasedExpenseLineDetail.ItemRef.value", value: fuelConfig[fuel].aseId, operator: "==" }
            }),
            { desc: "MetaData.LastUpdatedTime" },
            /**
             * Use the update time to compare with sync request time
             */
            {
                field: "TxnDate",
                value: moment()
                    .subtract(1, "day")
                    .startOf("day")
                    .format("YYYY-MM-DD"),
                operator: ">="
            }
        ])
        .then(billpayments => {
            const allbillpayment = (billpayments.QueryResponse.Bill as Array<Bill>) || [];

            return Promise.all(
                allbillpayment.map(async payment => {
                    const convertedbacth = covertbilltobatch(payment);

                    const batchesdir = firestore()
                        .collection("omc")
                        .doc(omcId)
                        .collection("ase")

                    const fetchedbatch = await batchesdir.where("QbId", "==", payment.Id).get();
                    /**
                     * make sure the Entry doenst alread exist before writing to db
                     */
                    if (fetchedbatch.empty) {
                        console.log("creating new batch");
                        /**
                         * Update the prices as well
                         */
                        return await batchesdir.add(convertedbacth);
                    } else {
                        return true
                    }
                })
            );

        });
}



function covertbilltobatch(convertedBill: Bill): ASE | null {
    console.log("converting bill to ASE");

    const ASEQty = convertedBill.Line[0].ItemBasedExpenseLineDetail.Qty ? convertedBill.Line[0].ItemBasedExpenseLineDetail.Qty : 0;
    const fueltype = FuelType[convertedBill.Line[0].ItemBasedExpenseLineDetail.ItemRef.name.toLowerCase()];


    const newASE: ASE = {
        Amount: convertedBill.Line[0].Amount ? convertedBill.Line[0].Amount : 0,
        ase: convertedBill.DocNumber ? convertedBill.DocNumber : "Null",
        depot: {
            Id: null,
            name: null
        },
        Id: null,
        price: 0,
        qty: {
            directLoad: {
                accumulated: {
                    total: 0,
                    usable: 0
                },
                total: 0
            },
            total: ASEQty,
            transfered: 0
        },
        QbId: convertedBill.Id,
        active: true,
        fuelType: fueltype,
        date: firestore.Timestamp.fromDate(new Date())
    };
    return newASE;
}
