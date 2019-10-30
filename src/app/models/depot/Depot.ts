import * as firebase from "firebase";
import { inituser } from "../universal/universal";
import { Types } from "../fuel/fuelTypes";
import { User } from "../universal/User";
import { Metadata } from "../universal/Metadata";

export interface Depot {
  Id: string;

  MetaData: Metadata;

  Name: string;
  Contact: {
    phone: string,
    name: string
  };

  sandbox: boolean;
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
  ContactPerson: {
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
