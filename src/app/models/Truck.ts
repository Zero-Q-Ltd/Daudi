import { fuelTypes, inituser, User } from "./universal";
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

export interface Batch {
  Name: string;
  Id: string;
  qty: number;
  observed: number;
}

export interface Truck {
  stage: number;
  Id: string;

  frozen: boolean;

  driverdetail: {
    name: string,
    id: string
  };
  truckdetail: {
    numberplate: string;
  };
  isPrinted: boolean;

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

export const emptytruck: Truck = {
  stage: null,
  Id: null,

  isPrinted: false,

  frozen: false,
  driverdetail: {
    id: null,
    name: null,
  },
  truckdetail: {
    numberplate: null
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
    { fueltype: null, qty: 0 }, { fueltype: null, qty: 0 },
    { fueltype: null, qty: 0 }, { fueltype: null, qty: 0 },
    { fueltype: null, qty: 0 }, { fueltype: null, qty: 0 },
    { fueltype: null, qty: 0 }]
};

export type truckStages = "0" | "1" | "2" | "3" | "4";
export let truckStagesarray = ["0", "1", "2", "3", "4"];
export let truckqueryStagesarray = ["1", "2", "3"];
