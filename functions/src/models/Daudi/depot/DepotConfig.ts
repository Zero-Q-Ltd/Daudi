import { FuelType } from "../fuel/FuelType";
import { DepotPrice } from "./DepotPrice";
import { inituser, AssociatedUser } from "../admin/AssociatedUser";
import { deepCopy } from "../../utils/deepCopy";
export interface DepotConfig {
    depotId: string;
    CompanyRep: {
        phone: null;
        name: null;
    };
    price: {
        [key in FuelType]: DepotPrice;
    };
    hospitality: {
        amnt: number;
    };
}
const initPrice: DepotPrice = {
    price: 0,
    minPrice: 0,
    user: deepCopy<AssociatedUser>(inituser)
};
export const emptyDepotConfig: DepotConfig = {
    depotId: null,
    CompanyRep: {
        name: null,
        phone: null
    },
    hospitality: {
        amnt: 0
    },
    price: {
        ago: deepCopy<DepotPrice>(initPrice),
        pms: deepCopy<DepotPrice>(initPrice),
        ik: deepCopy<DepotPrice>(initPrice)
    }
};
