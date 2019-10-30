import * as firebase from "firebase";
import { fuelTypes, inituser, User } from "./universal";
import { emptytaxconfig, taxconfig } from "./Taxconfig";

export interface Depot {
  Id: string;
  MetaData: {
    CreateTime: firebase.firestore.Timestamp | Date,
    LastUpdatedTime: firebase.firestore.Timestamp | Date
  };

  Name: string;
  Contact: {
    phone: null,
    name: null
  };

  price: {
    [key in fuelTypes]: DepotPrice
  };
  Location: firebase.firestore.GeoPoint;
}


export interface DepotPrice {
  price: number;
  user: User;
}

export const emptydepot: Depot = {
  Id: null,
  MetaData: {
    CreateTime: new firebase.firestore.Timestamp(0, 0),
    LastUpdatedTime: new firebase.firestore.Timestamp(0, 0)
  },
  Name: null,
  Contact: {
    phone: null,
    name: null
  },
  price: {
    pms: {
      user: inituser,
      price: null
    },
    ago: {
      user: inituser,
      price: null
    },
    ik: {
      user: inituser,
      price: null
    }
  },
  /**
   * make default location Somewhere in nbi
   */
  Location: new firebase.firestore.GeoPoint(-1.3088567, 36.7752539)
};
