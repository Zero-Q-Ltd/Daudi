import { QuickBooks } from "../libs/qbmain";
import { QboOrder } from "../models/Qbo/QboOrder";
import { Order } from "../models/Daudi/order/Order";
import { editStats } from "../tasks/crud/daudi/editStats";
import { ReadAndInstantiate } from "../tasks/crud/daudi/QboConfig";

export function validorderupdate(order: Order, omcId: string) {
    switch (order.stage) {
        case 3:
            return editStats(order, "paid");
        case 6:
            /**
             * Delete orders deleted on Daudi, which havae already been created on QB
             */
            if (order.QbConfig.QbId) {
                console.log("deleting order...");
                return ReadAndInstantiate(omcId).then(res => {
                    return res.qbo.getInvoice(order.QbConfig.QbId).then(result => {
                        const resultinvoice = result.Invoice as QboOrder;
                        resultinvoice.void = true;
                        /**
                         * @todo Implement deletion reason and User detail
                         */
                        // resultinvoice.CustomerMemo = {
                        //     value: order.stagedata["6"].data.reason
                        // };
                        return res.qbo.updateInvoice(resultinvoice);
                    })
                });
            } else return true
            break;
        default:
            return true;
    }
}
