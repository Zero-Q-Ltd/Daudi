
import { QuickBooks } from "../libs/qbmain";
import { Invoice } from "../models/Qbo/Invoice";
import { Order } from "../models/Daudi/order/Order";
import { editStats } from "../tasks/crud/daudi/editStats";

export function validorderupdate(order: Order, qbo: QuickBooks) {
    switch (order.stage) {
        case 3:
            return editStats(order, "paid");
        case 6:
            /**
             * Delete orders deleted on Daudi, which havae already been created on QB
             */
            if (order.QbConfig.QbId) {
                console.log("deleting order...");
                return qbo.getInvoice(order.QbConfig.QbId).then(result => {
                    const resultinvoice = result.Invoice as Invoice;
                    resultinvoice.void = true;
                    resultinvoice.CustomerMemo = {
                        value: order.stagedata["6"].data.reason
                    };
                    return qbo.updateInvoice(resultinvoice);
                });
            } else return true
            break;
        default:
            return true;
    }
}
