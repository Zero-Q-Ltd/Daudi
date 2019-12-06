import { FuelType } from "../fuel/FuelType";
import { DepotPrice } from "./DepotPrice";
import { inituser } from "../admin/AssociatedUser";
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
const initPrice = {
    price: 0,
    user: { ...inituser }
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
        ago: { ...initPrice },
        pms: { ...initPrice },
        ik: { ...initPrice }
    }
};
