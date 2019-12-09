import { Metadata, emptymetadata } from "../universal/Metadata";
import { DepotCreator } from "./DepotCreator";
import { deepCopy } from "../../utils/deepCopy";
import { MyTimestamp, MyGeoPoint } from "../../firestore/firestoreTypes";

export interface Depot {
  Id: string;
  MetaData: Metadata;
  Name: string;
  Contact: {
    phone: string,
    name: string
  };
  Location: MyGeoPoint;
  config: {
    /**
     * indicates whether it's part of KPC or not
     * private depots are NOT part of KPC and require additional config for parent depot
     */
    parent: string | null,
    /**
     * indicates whether this depot can be seen by all OMC's
     */
    externalVisibility: boolean,

    creator: DepotCreator
  };
}

export const emptydepot: Depot = {
  Id: null,
  MetaData: deepCopy<Metadata>(emptymetadata),
  Name: null,
  Contact: {
    phone: null,
    name: null
  },
  config: {
    parent: null,
    externalVisibility: false,
    creator: {
      adminId: null,
      date: MyTimestamp.now(),
      omcId: null,
    }
  },
  /**
   * make default location Somewhere in nbi
   */
  Location: new MyGeoPoint(-1.3088567, 36.7752539)
};


