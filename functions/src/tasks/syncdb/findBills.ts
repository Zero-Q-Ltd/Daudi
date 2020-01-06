import {QuickBooks} from "../../libs/qbmain";
import * as moment from "moment";

export function findBills(qbo: QuickBooks) {
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
            // {
            //     field: "Line.ItemBasedExpenseLineDetail.ItemRef.value",
            //     value: fuelConfig.pms.entryId, operator: "LIKE"
            // },
            // {
            //     field: "Line.ItemBasedExpenseLineDetail.ItemRef.value",
            //     value: fuelConfig.ago.entryId, operator: "LIKE"
            // },
            // {
            //     field: "Line.ItemBasedExpenseLineDetail.ItemRef.value",
            //     value: fuelConfig.ik.entryId, operator: "LIKE"
            // },
            { desc: "MetaData.LastUpdatedTime" },
            /**
             * Use the update time to compare with sync request time
             */
            {
                field: "TxnDate",
                value: moment()
                    .subtract(30, "day")
                    .startOf("day")
                    .format("YYYY-MM-DD"),
                operator: ">="
            }
        ])
}
