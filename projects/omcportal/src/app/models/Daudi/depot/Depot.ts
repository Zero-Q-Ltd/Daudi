import { MyGeoPoint } from "../../firestore/firestoreTypes";
import { deepCopy } from "../../utils/deepCopy";
import { emptymetadata, Metadata } from "../universal/Metadata";
import { DepotCreator } from "./DepotCreator";

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
      date: new Date(),
      omcId: null,
    }
  },
  /**
   * make default location Somewhere in nbi
   */
  Location: new MyGeoPoint(-1.3088567, 36.7752539)
};
