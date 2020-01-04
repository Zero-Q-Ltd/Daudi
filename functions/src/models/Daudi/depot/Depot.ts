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
     * Every depot is attached to a specific exit location, including private depots
     */
    exitLocationId: string,
    private: boolean,
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
    exitLocationId: null,
    externalVisibility: false,
    private: false,
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


