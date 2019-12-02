import { fuelTypes } from "../fuel/fuelTypes";
import { User } from "../universal/User";
import { Contact } from "../customer/Contact";
import { Truck, emptytruck } from "./Truck";
import { FuelConfig } from "./FuelConfig";
import { OrderStages } from "./OrderStages";
import { Environment } from "../omc/Environments";

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
     * depots are created in qbo as classes
     * The class Id's must be referenced
     */
    classId: string,
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
    timestamp: Date,
    errorDetail: string
  };

  truck: Truck;
  loaded: boolean;
  fuel: {
    [key in fuelTypes]: FuelConfig
  };
  discount?: {
    approved: {
      status: boolean,
      user: User,
      data: {},
    },
    request: {
      [key in fuelTypes]: number;
    }
  };
  stagedata: {
    [key in OrderStages]: {
      user: User,
      data: any,
    }
  };
}



const initorderfuel = {
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
  QbId: null,
  batches: []
};

const initstages = {
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
  QbConfig: null,
  truck: { ...emptytruck },
  notifications: {
    sms: null,
    email: null
  },
  config: {
    QbCompanyId: null,
    depotId: null,
    depotname: null,
    environment: null
  },
  origin: null,
  stage: null,
  loaded: null,
  stagedata: {
    1: { ...initstages },
    2: { ...initstages },
    3: { ...initstages },
    4: { ...initstages },
    5: { ...initstages },
    6: { ...initstages }
  },


  fuel: {
    pms: { ...initorderfuel },
    ago: { ...initorderfuel },
    ik: { ...initorderfuel }
  }
};
export let orderStagesarray = ["1", "2", "3", "4", "5", "6"];

