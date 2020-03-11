import { AssociatedUser, EmptyAssociatedUser } from "../admin/AssociatedUser";
import { CustomerDetail } from "../customer/CustomerDetail";
import { FuelType } from "../fuel/FuelType";
import { OrderFuelConfig } from "./FuelConfig";
import {
  EmptyGenericStage,
  EmptyGenericTruckStage,
  GenericStage,
  GenericTruckStage
} from "./GenericStage";
import { OrderStages } from "./OrderStages";
import { emptytruck, Truck } from "./truck/Truck";
import { TruckStages } from "./truck/TruckStages";
import { deepCopy } from "functions/src/models/utils/deepCopy";

export interface Order {
  Id: string; // used to temporarily store the key, used later for looping
  customer: CustomerDetail;
  QbConfig: {
    InvoiceId: string;
    InvoiceNumber: string;
    EstimateId: string;
    EstimateNumber: string;
    /**
     * depots are created in qbo as departments
     * The departments Id's must be referenced
     */
    departmentId: string;
  };
  stage: typeof OrderStages[keyof typeof OrderStages];
  origin: string;
  notifications: {
    sms: boolean;
    email: boolean;
  };
  config: {
    depot: {
      name: string;
      id: string;
    };
  };
  error?: {
    status: boolean;
    errorCode: string;
    origin: string;
    timestamp: Date;
    errorDetail: string;
  };
  deliveryNote: {
    value: string;
    photos: string[];
  };
  truck: Truck;
  frozen: boolean;
  loaded: boolean;
  fuel: {
    [key in FuelType]: OrderFuelConfig;
  };
  /**
   * Keeps a reference to the payments
   * The key is the paymentId and the value is the amount from the payment applied to this order
   * This makes multi-directional query to happen, both by orderId and paymentId
   */
  paymentDetail: {
    [key: string]: number;
  };
  orderStageData: {
    [key in OrderStages]: GenericStage;
  };
  truckStageData: {
    [stage in TruckStages]: GenericTruckStage;
  };
  seals: {
    user: AssociatedUser;
    range: string[];
    broken: string[];
  };

  printStatus: {
    LoadingOrder: {
      status: boolean;
      user: AssociatedUser;
    };
    gatepass: {
      status: boolean;
      user: AssociatedUser;
    };
  };
}

const initorderfuel: OrderFuelConfig = {
  qty: 0,
  priceconfig: {
    requestedPrice: 0,
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
    taxableAmnt: 0
  },
  entries: [],
  entryIds: []
};

export const emptyorder: Order = {
  Id: null,
  frozen: false,
  deliveryNote: {
    photos: [],
    value: null
  },
  customer: {
    contact: [],
    name: null,
    Id: null,
    QbId: null,
    krapin: null
  },
  paymentDetail: {},
  QbConfig: {
    EstimateId: null,
    EstimateNumber: null,
    InvoiceNumber: null,
    InvoiceId: null,
    departmentId: null
  },
  truck: deepCopy(emptytruck),
  notifications: {
    sms: null,
    email: null
  },
  config: {
    depot: {
      id: null,
      name: null
    }
  },
  printStatus: {
    LoadingOrder: {
      status: null,
      user: null
    },
    gatepass: {
      status: null,
      user: null
    }
  },
  seals: {
    broken: [],
    range: [],
    user: deepCopy(EmptyAssociatedUser)
  },
  truckStageData: {
    0: deepCopy(EmptyGenericTruckStage),
    1: deepCopy(EmptyGenericTruckStage),
    2: deepCopy(EmptyGenericTruckStage),
    3: deepCopy(EmptyGenericTruckStage)
  },
  origin: null,
  stage: null,
  loaded: null,
  orderStageData: {
    1: deepCopy(EmptyGenericStage),
    2: deepCopy(EmptyGenericStage),
    3: deepCopy(EmptyGenericStage),
    4: deepCopy(EmptyGenericStage),
    5: deepCopy(EmptyGenericStage),
    6: deepCopy(EmptyGenericStage)
  },
  fuel: {
    pms: deepCopy(initorderfuel),
    ago: deepCopy(initorderfuel),
    ik: deepCopy(initorderfuel)
  }
};
