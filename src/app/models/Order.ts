import { fuelTypes, User } from "./universal";
import { CustomerContact } from "./Customer";
import { Truck, Batch } from "./Truck";

export interface Order {
  Id: string; // used to temporarily store the key, used later for looping
  company: {
    name: string,
    Id: string,
    phone: string,
    contact: Array<CustomerContact>;
    krapin: string,
    QbId: string,
  };
  QbId: string;
  stage: number;
  origin: string;
  notifications: {
    sms: boolean,
    email: boolean
  };
  config: {
    depotId: string,
    sandbox: boolean,
  };
  error?: {
    status: boolean,
    errorCode: string,
    origin: string,
    timestamp: Date,
    errorDetail: string
  };
  /**
   *@Deprecated, In Daudi 3 the truck Id is exactly the same as the order Id since its a 1:1 r/ship
   */
  truck: Truck;
  loaded: boolean;
  fuel: {
    [key in fuelTypes]: fuelconfig
  };
  discount: {
    approved: {
      approved: boolean,
      user: User,
      data: {},
    },
    request: {
      [key in fuelTypes]: number;
    }
  };
  stagedata: {
    [key in orderStages]: {
      user: User,
      data: any,
    }
  };
}



export interface fuelconfig {
  QbId: string;
  qty: number;
  priceconfig: priceconfig;
  batches: Array<Batch>;
}

const initorderfuel = {
  qty: 0,
  priceconfig: {
    price: 0,
    nonTax: 0,
    retailprice: 0,
    minsp: 0,
    total: 0,
    difference: 0,
    taxAmnt: 0,
    nonTaxtotal: 0,
    taxablePrice: 0,
    taxTotal: 0,
    taxableAmnt: 0,
    taxQbId: null
  },
  QbId: null
};

const initstages = {
  data: null,
  user: {
    name: null,
    time: null,
    uid: null
  }
};

export interface priceconfig {
  /**
   * @description the total price of the fuel/l, inclusive of VAT
   */
  price: number;
  /**
   * @description the amount/l without tax
   */
  nonTaxprice: number;
  /**
   * @description the amount/l that is not taxed, provided by the Gov
   */
  nonTax: number;
  /**
   * @description the price set as the day's selling price used for discount calculation
   */
  retailprice: number;
  /**
   * @description the minSp as of writing the order, connected to the buying of the most recent batch number
   */
  minsp: number;
  /**
   * @description the total amount of money that the order will cost in KES
   */
  total: number;
  /**
   * @description Amount of tax in the order in KES
   */
  taxAmnt: number;
  /**
   * @description Worth of the order without tax
   */
  nonTaxtotal: number;
  /**
   * @description calculation of price minus nonTax
   */
  taxablePrice: number;
  /**
   * @description total amount on which tax is calculated on
   */
  taxableAmnt: number;
  /**
   * @description calculation of the price minus retailprice used in calculating the amount of discount
   * +ve for upmark and -ve for discount
   */
  difference: number;
  /**
   * @description QuickbooksId of the tax Object, used for referencing for accounting
   */
  taxQbId: string;
}

export const emptyorder: Order = {
  Id: null,
  company: {
    contact: [],
    phone: null,
    name: null,
    Id: null,
    QbId: null,
    krapin: null
  },
  QbId: null,
  InvoiceId: null,
  notifications: {
    sms: null,
    email: null
  },
  config: {
    depotId: null,
    sandbox: null
  },
  origin: null,
  stage: null,
  loaded: null,
  stagedata: {
    1: initstages,
    2: initstages,
    3: initstages,
    4: initstages,
    5: initstages,
    6: initstages
  },
  discount: {
    approved: null,
    request: {
      pms: null,
      ago: null,
      ik: null
    }
  },

  fuel: {
    pms: {
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
    },
    ago: {
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
    },
    ik: {
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
        taxQbId: null,
      },
      QbId: null,
      batches: []
    }
  }
};
export type orderStages = "1" | "2" | "3" | "4" | "5" | "6";
export let orderStagesarray = ["1", "2", "3", "4", "5", "6"];
export let orderqueryStagesarray = ["1", "2", "3", "4", "6"];

