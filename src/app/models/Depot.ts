import * as firebase from "firebase";
import { fuelTypes, inituser, User } from "./universal";
import { emptytaxconfig, taxconfig } from "./Taxconfig";

export interface Depot_ {
  Id: string,
  Active: boolean,
  FullyQualifiedName: string,
  MetaData: {
    CreateTime: firebase.firestore.Timestamp | Date,
    LastUpdatedTime: firebase.firestore.Timestamp | Date
  };
  SyncToken: number;
  domain: string;
  sparse: boolean;

  Name: string;
  Contact: {
    phone: null,
    name: null
  };
  companyId: string;
  fuelconfig: {
    [key in fuelTypes]: string
  };
  minpriceconfig: {
    [key in fuelTypes]: depotPrice
  };
  currentpriceconfig: {
    [key in fuelTypes]: depotPrice
  };
  taxconfig: taxconfig;
  sandbox: boolean;
  Location: firebase.firestore.GeoPoint;
}


type depotPrice = {
  price: number,
  user: User,
};

export const emptydepot: Depot_ = {
  Id: null,
  Active: null,
  FullyQualifiedName: null,
  MetaData: {
    CreateTime: new firebase.firestore.Timestamp(0, 0),
    LastUpdatedTime: new firebase.firestore.Timestamp(0, 0)
  },
  SyncToken: null,
  domain: null,
  sparse: null,

  companyId: null,
  Name: null,
  Contact: {
    phone: null,
    name: null
  },
  taxconfig: emptytaxconfig,
  fuelconfig: {
    pms: null,
    ago: null,
    ik: null
  },
  minpriceconfig: {
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
  currentpriceconfig: {
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
  sandbox: null,
  /**
   * make default location Somewhere in nbi
   */
  Location: new firebase.firestore.GeoPoint(-1.3088567, 36.7752539)
};
