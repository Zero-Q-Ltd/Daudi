import {fuelTypes, User} from "./universal";

export interface Order_ {
  Id: string, //used to temporarily store the key, used later for looping
  company: {
    name: string,
    Id: string,
    phone: string,
    contact: {
      email: string,
      name: string,
      phone: string
    },
    krapin: string,
    QbId: string,
    email?: string
  };
  QbId: string,
  InvoiceId: string,
  stage: number,
  origin: string,
  /**
   * @deprecated use QbID or Id instead
   */
  orderId: number,
  notifications: {
    allowsms: boolean,
    allowemail: boolean
  };
  config: {
    depot: {
      name: string,
      Id: string,
    },
    companyid: string,
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
  truck?: Array<string>;
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

export type fuelconfig = {
  QbId: string,
  qty: number,
  priceconfig: priceconfig
};

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

export type priceconfig = {
  /**
   * @description the total price of the fuel/l, inclusive of VAT
   */
  price: number,
  /**
   * @description the amount/l without tax
   */
  nonTaxprice: number,
  /**
   * @description the amount/l that is not taxed, provided by the Gov
   */
  nonTax: number,
  /**
   * @description the price set as the day's selling price used for discount calculation
   */
  retailprice: number,
  /**
   * @description the minSp as of writing the order, connected to the buying of the most recent batch number
   */
  minsp: number,
  /**
   * @description the total amount of money that the order will cost in KES
   */
  total: number,
  /**
   * @description Amount of tax in the order in KES
   */
  taxAmnt: number,
  /**
   * @description Worth of the order without tax
   */
  nonTaxtotal: number,
  /**
   * @description calculation of price minus nonTax
   */
  taxablePrice: number,
  /**
   * @description total amount on which tax is calculated on
   */
  taxableAmnt: number,
  /**
   * @description calculation of the price minus retailprice used in calculating the amount of discount
   * +ve for upmark and -ve for discount
   */
  difference: number,
  /**
   * @description QuickbooksId of the tax Object, used for referencing for accounting
   */
  taxQbId: string
};

export const emptyorder: Order_ = {
  Id: null,
  company: {
    contact: {
      email: null,
      name: null,
      phone: null
    },
    phone: null,
    name: null,
    Id: null,
    QbId: null,
    krapin: null
  },
  QbId: null,
  InvoiceId: null,
  notifications: {
    allowsms: null,
    allowemail: null
  },
  config: {
    depot: {
      name: null,
      Id: null
    },
    companyid: null,
    sandbox: null
  },
  orderId: null,
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
      QbId: null
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
      QbId: null
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
        taxQbId: null
      },
      QbId: null
    }
  }
};
export type orderStages = "1" | "2" | "3" | "4" | "5" | "6"
export let orderStagesarray = ["1", "2", "3", "4", "5", "6"];
export let orderqueryStagesarray = ["1", "2", "3", "4", "6"];

