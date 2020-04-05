import { deepCopy } from "../../utils/deepCopy";
import { AssociatedUser, EmptyAssociatedUser } from "../admin/AssociatedUser";
import { FuelType } from "../fuel/FuelType";
import { DepotPrice } from "./DepotPrice";

export interface DepotConfig {
  /**
   * The same depot can have 2 different configs due to live and sandbox environments
   */
  Id: string;
  depotId: string;
  QbId: string;
  CompanyRep: {
    phone: null;
    name: null;
  };
  price: {
    [key in FuelType]: DepotPrice;
  };
  initialised: boolean;
  hospitality: {
    amnt: number;
  };
}

const initPrice: DepotPrice = {
  price: 0,
  minPrice: 0,
  user: deepCopy<AssociatedUser>(EmptyAssociatedUser)
};
export const emptyDepotConfig: DepotConfig = {
  depotId: null,
  Id: null,
  QbId: null,
  initialised: false,
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
