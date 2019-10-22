import { fuelTypes, User, inituser } from "../common";
import { firestore } from "firebase-admin";

export interface Order_ {
  Id: string; //used to temporarily store the key, used later for looping
  company: {
    name: string;
    Id: string;
    phone: string;
    contact: {
      email: string;
      name: string;
      phone: string;
    };
    krapin: string;
    QbId: string;
    email?: string;
  };
  QbId: string;
  InvoiceId: string;
  stage: number;
  origin: string;
  /**
   * @deprecated use QbID or Id instead
   */
  orderId: number;
  notifications: {
    allowsms: boolean;
    allowemail: boolean;
  };
  config: {
    depot: {
      name: string;
      Id: string;
    };
    companyid: string;
    sandbox: boolean;
  };
  error?: {
    status: boolean;
    errorCode: string;
    origin: string;
    timestamp: Date;
    errorDetail: string;
  };
  /**
   *@Deprecated, In Daudi 3 the truck Id is exactly the same as the order Id since its a 1:1 r/ship
   */
  truck?: Array<string>;
  loaded: boolean;
  fuel: {
    [key in fuelTypes]: fuelconfig;
  };
  discount: {
    approved: {
      approved: boolean;
      user: User;
      data: {};
    };
    request: {
      [key in fuelTypes]: number;
    };
  };
  stagedata: {
    [key in orderStages]: {
      user: User;
      data: any;
    };
  };
}

export type fuelconfig = {
  QbId: string;
  qty: number;
  priceconfig: priceconfig;
};

const initpriceconfig: priceconfig = {
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
  taxQbId: ""
};
const initorderfuel: fuelconfig = {
  QbId: '',
  priceconfig: { ...initpriceconfig },
  qty: 0
}
const initstages = {
  data: "",
  user: {
    name: "",
    time: firestore.Timestamp.fromDate(new Date()),
    uid: ""
  }
};

export type priceconfig = {
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
};

export const emptyorder: Order_ = {
  Id: "",
  company: {
    contact: {
      email: "",
      name: "",
      phone: ""
    },
    phone: "",
    name: "",
    Id: "",
    QbId: "",
    krapin: ""
  },
  QbId: "",
  InvoiceId: "",
  notifications: {
    allowsms: false,
    allowemail: false
  },
  config: {
    depot: {
      name: "",
      Id: ""
    },
    companyid: "",
    sandbox: true
  },
  orderId: 0,
  origin: "",
  stage: 0,
  loaded: false,
  stagedata: {
    1: { ...initstages },
    2: { ...initstages },
    3: { ...initstages },
    4: { ...initstages },
    5: { ...initstages },
    6: { ...initstages }
  },
  discount: {
    approved: {
      approved: false,
      data: {},
      user: { ...inituser }
    },
    request: {
      pms: 0,
      ago: 0,
      ik: 0
    }
  },

  fuel: {
    pms: { ...initorderfuel },
    ago: { ...initorderfuel },
    ik: { ...initorderfuel }
  }
};
export type orderStages = "1" | "2" | "3" | "4" | "5" | "6";
export let orderStagesarray = ["1", "2", "3", "4", "5", "6"];
export let orderqueryStagesarray = ["1", "2", "3", "4", "6"];
