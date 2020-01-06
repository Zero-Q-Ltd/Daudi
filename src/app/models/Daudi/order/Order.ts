import {deepCopy} from "../../utils/deepCopy";
import {CustomerDetail} from "../customer/CustomerDetail";
import {FuelType} from "../fuel/FuelType";
import {OrderFuelConfig} from "./FuelConfig";
import {OrderStages} from "./OrderStages";
import {emptytruck, Truck} from "./truck/Truck";
import {EmptyGenericDetail, GenericStageDetail} from "./GenericStageDetail";

export interface Order {
  Id: string; // used to temporarily store the key, used later for looping
  customer: CustomerDetail;
  QbConfig: {
    InvoiceId: string,
    EstimateId: string,
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
  stagedata: {
    [key in OrderStages]: GenericStageDetail
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
    taxableAmnt: 0,
  },
  entries: []
};


export const emptyorder: Order = {
  Id: null,
  customer: {
    contact: [],
    name: null,
    Id: null,
    QbId: null,
    krapin: null
  },
  QbConfig: {
    EstimateId: null,
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
    depot: {
      id: null,
      name: null
    }
  },
  origin: null,
  stage: null,
  loaded: null,
  stagedata: {
    1: deepCopy<GenericStageDetail>(EmptyGenericDetail),
    2: deepCopy<GenericStageDetail>(EmptyGenericDetail),
    3: deepCopy<GenericStageDetail>(EmptyGenericDetail),
    4: deepCopy<GenericStageDetail>(EmptyGenericDetail),
    5: deepCopy<GenericStageDetail>(EmptyGenericDetail),
    6: deepCopy<GenericStageDetail>(EmptyGenericDetail),
  },
  fuel: {
    pms: deepCopy<OrderFuelConfig>(initorderfuel),
    ago: deepCopy<OrderFuelConfig>(initorderfuel),
    ik: deepCopy<OrderFuelConfig>(initorderfuel)
  }
};
