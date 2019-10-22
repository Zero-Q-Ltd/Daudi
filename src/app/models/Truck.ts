import {fuelTypes, inituser, User} from "./universal";
import * as firebase from "firebase";

const initbatch = {
  Id: null,
  Name: null,
  observed: null,
  qty: null
};

interface Compartment {
  fueltype: string;
  qty: number;
}

interface Expiries {
  time: string;
  timestamp: firebase.firestore.Timestamp | Date;
}

interface Batch {
  Name: string;
  Id: string;
  qty: number;
  observed: number;
}

export interface Truck_ {
  stage: number;
  Id: string;
  orderdata: {
    QbID: string,
    OrderID: string,
  };
  truckId: string;
  company: {
    QbId: string,
    name: string,
    Id: string,
    phone: string,
    contactname: string,
  };
  /**
   * @description important for Cloud functions
   */
  config: {
    depot: {
      name: string,
      Id: string,
    },
    companyid: string,
    sandbox: boolean,
  };
  frozen: boolean;
  notifications: {
    allowsms: boolean,
    allowemail: boolean
  };
  drivername: string;
  driverid: string;
  numberplate: string;
  isPrinted: boolean;
  fuel: {
    [key in fuelTypes]: {
      qty: number,
      batches: {
        0: Batch,
        1: Batch
      }
    }
  };
  stagedata: {

    0: {
      user: User,
      data: {},
    },
    1: {
      user: User,
      data: {
        expiry: Array<Expiries>
      },
    },
    2: {
      user: User,
      data: {
        expiry: Array<Expiries>
        // Inside here we store the expiry time vs the approximated time
        // I.e
        /*
         1164666616 : 45,
         1516815165 : 15
        */
      },
    },
    3: {
      user: User,
      data: {
        expiry: Array<Expiries>
      },
    },
    4: {
      user: User,
      data: {
        seals: {
          range: string,
          broken: Array<string>
        }
      },
    },
  };
  compartments: Array<Compartment>;
}

export const emptytruck: Truck_ = {
  stage: null,
  Id: null,
  orderdata: {
    OrderID: null,
    QbID: null
  },
  truckId: null,
  company: {
    QbId: null,
    name: null,
    Id: null,
    phone: null,
    contactname: null
  },
  notifications: {
    allowsms: null,
    allowemail: null
  },
  drivername: null,
  driverid: null,
  numberplate: null,
  isPrinted: false,
  config: {
    depot: {
      name: null,
      Id: null
    },
    companyid: null,
    sandbox: null
  },
  frozen: false,
  fuel: {
    pms: {
      qty: null,
      batches: {
        0: initbatch,
        1: initbatch
      }
    },
    ago: {
      qty: null,
      batches: {
        0: initbatch,
        1: initbatch
      }
    }, ik: {
      qty: null,
      batches: {
        0: initbatch,
        1: initbatch
      }
    }
  },
  stagedata: {
    0: {
      data: {
        expiry: []
      },
      user: inituser
    },
    1: {
      data: {
        expiry: []
      },
      user: inituser
    },
    2: {
      data: {
        expiry: []
      },
      user: inituser
    },
    3: {
      data: {
        expiry: []
      },
      user: inituser
    },
    4: {
      data: null,
      user: inituser
    }
  },
  compartments: [
    {fueltype: null, qty: 0}, {fueltype: null, qty: 0},
    {fueltype: null, qty: 0}, {fueltype: null, qty: 0},
    {fueltype: null, qty: 0}, {fueltype: null, qty: 0},
    {fueltype: null, qty: 0}]
};

export type truckStages = "0" | "1" | "2" | "3" | "4";
export let truckStagesarray = ["0", "1", "2", "3", "4"];
export let truckqueryStagesarray = ["1", "2", "3"];
