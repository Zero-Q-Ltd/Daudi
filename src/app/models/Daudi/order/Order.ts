import { FuelType } from "../fuel/FuelType";
import { Contact } from "../customer/Contact";
import { Truck, emptytruck } from "./Truck";
import { OrderFuelConfig } from "./FuelConfig";
import { OrderStages } from "./OrderStages";
import { Environment } from "../omc/Environments";
import { AssociatedUser } from "../admin/AssociatedUser";
import { deepCopy } from "../../utils/deepCopy";

export interface Order {
  Id: string; // used to temporarily store the key, used later for looping
  customer: {
    name: string,
    Id: string,
    phone: string,
    contact: Array<Contact>;
    krapin: string,
    QbId: string,
  };
  QbConfig: {
    InvoiceId: string,
    QbId: string,
    /**
     * depots are created in qbo as departments
     * The departments Id's must be referenced
     */
    departmentId: string,
  };
  stage: number;
  origin: string;
  notifications: {
    sms: boolean,
    email: boolean
  };
  config: {
    depot: {
      name: string,
      id: string
    }
    environment: Environment,
  };
  error?: {
    status: boolean,
    errorCode: string,
    origin: string,
    MyTimestamp: Date,
    errorDetail: string
  };

  truck: Truck;
  loaded: boolean;
  fuel: {
    [key in FuelType]: OrderFuelConfig
  };
  discount?: {
    approved: {
      status: boolean,
      user: AssociatedUser,
      data: {},
    },
    request: {
      [key in FuelType]: number;
    }
  };
  stagedata: {
    [key in OrderStages]: StageData
  };
}

export interface StageData {
  user: AssociatedUser;
  data: any;
}

const initorderfuel: OrderFuelConfig = {
  qty: 0,
  priceconfig: {
    price: 0,
    nonTax: 0,
    nonTaxprice: 0,
    retailprice: 0,
    minsp: 0,
    total: 0,
    difference: 0,
    taxAmnt: 0,
    nonTaxtotal: 0,
    taxablePrice: 0,
    taxableAmnt: 0,
    taxQbId: null
  },
  batches: []
};

const initstages: StageData = {
  data: null,
  user: {
    name: null,
    time: null,
    uid: null
  }
};

export const emptyorder: Order = {
  Id: null,
  customer: {
    contact: [],
    phone: null,
    name: null,
    Id: null,
    QbId: null,
    krapin: null
  },
  QbConfig: {
    InvoiceId: null,
    QbId: null,
    departmentId: null
  },
  truck: deepCopy<Truck>(emptytruck),
  notifications: {
    sms: null,
    email: null
  },
  config: {
    environment: null,
    depot: {
      id: null,
      name: null
    }
  },
  origin: null,
  stage: null,
  loaded: null,
  stagedata: {
    1: deepCopy<StageData>(initstages),
    2: deepCopy<StageData>(initstages),
    3: deepCopy<StageData>(initstages),
    4: deepCopy<StageData>(initstages),
    5: deepCopy<StageData>(initstages),
    6: deepCopy<StageData>(initstages)
  },


  fuel: {
    pms: deepCopy<OrderFuelConfig>(initorderfuel),
    ago: deepCopy<OrderFuelConfig>(initorderfuel),
    ik: deepCopy<OrderFuelConfig>(initorderfuel)
  }
};
