import { fuelTypes, User, inituser } from "../common";

const { ...initbatch } = {
  Id: '',
  Name: '',
  observed: 0,
  qty: 0
};

type Compartment = {
  fueltype: string;
  qty: number;
};
type Expiries = {
  time: string;
  timestamp: Date;
};
type Batch = {
  Name: string;
  Id: string;
  qty: number;
  observed: number;
};

export interface Truck_ {
  stage: number;
  Id: string;
  orderdata: {
    QbID: string;
    OrderID: string;
  };
  truckId: string;
  company: {
    QbId: string;
    name: string;
    Id: string;
    phone: string;
    contactname: string;
  };
  /**
   * @description important for Cloud functions
   */
  config: {
    depot: {
      name: string;
      Id: string;
    };
    companyid: string;
    sandbox: boolean;
  };
  notifications: {
    allowsms: boolean;
    allowemail: boolean;
  };
  drivername: string;
  driverid: string;
  numberplate: string;
  isPrinted: boolean;
  fuel: {
    [key in fuelTypes]: {
      qty: number;
      batches: {
        0: Batch;
        1: Batch;
      };
    };
  };
  stagedata: {
    0: {
      user: User;
      data: {};
    };
    1: {
      user: User;
      data: {
        expiry: Array<Expiries>;
      };
    };
    2: {
      user: User;
      data: {
        expiry: Array<Expiries>;
        //Inside here we store the expiry time vs the approximated time
        //I.e
        /*
         1164666616 : 45,
         1516815165 : 15
        */
      };
    };
    3: {
      user: User;
      data: {
        expiry: Array<Expiries>;
      };
    };
    4: {
      user: User;
      data: {
        seals: {
          range: string;
          broken: Array<string>;
        };
      };
    };
  };
  compartments: Array<Compartment>;
}

export const emptytruck: Truck_ = {
  stage: 0,
  Id: '',
  orderdata: {
    OrderID: '',
    QbID: ''
  },
  truckId: '',
  company: {
    QbId: '',
    name: '',
    Id: '',
    phone: '',
    contactname: ''
  },
  notifications: {
    allowsms: false,
    allowemail: false
  },
  drivername: '',
  driverid: '',
  numberplate: '',
  isPrinted: false,
  config: {
    depot: {
      name: '',
      Id: ''
    },
    companyid: '',
    sandbox: true
  },
  fuel: {
    pms: {
      qty: 0,
      batches: {
        0: { ...initbatch },
        1: { ...initbatch }
      }
    },
    ago: {
      qty: 0,
      batches: {
        0: { ...initbatch },
        1: { ...initbatch }
      }
    },
    ik: {
      qty: 0,
      batches: {
        0: { ...initbatch },
        1: { ...initbatch }
      }
    }
  },
  stagedata: {
    0: {
      data: {
        expiry: []
      },
      user: { ...inituser }
    },
    1: {
      data: {
        expiry: []
      },
      user: { ...inituser }
    },
    2: {
      data: {
        expiry: []
      },
      user: { ...inituser }
    },
    3: {
      data: {
        expiry: []
      },
      user: { ...inituser }
    },
    4: {
      data: {
        seals: {
          broken: [],
          range: ''
        }
      },
      user: { ...inituser }
    }
  },
  compartments: [
    { fueltype: '', qty: 0 },
    { fueltype: '', qty: 0 },
    { fueltype: '', qty: 0 },
    { fueltype: '', qty: 0 },
    { fueltype: '', qty: 0 },
    { fueltype: '', qty: 0 },
    { fueltype: '', qty: 0 }
  ]
};

export type truckStages = "0" | "1" | "2" | "3" | "4";
export let truckStagesarray = ["0", "1", "2", "3", "4"];
export let truckqueryStagesarray = ["1", "2", "3"];
