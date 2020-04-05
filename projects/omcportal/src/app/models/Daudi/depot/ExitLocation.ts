import {MyGeoPoint} from "../../firestore/firestoreTypes";
import {Metadata} from "../universal/Metadata";

/**
 * Every depot is tied to an exit location that determines the Hospitality amount
 * Private depots have an additional Hospitality cost making the fuel prices higher
 */
export interface ExitLocation {
  Id: string;
  MetaData: Metadata;
  Name: string;
  Contact: {
    phone: string,
    name: string
  };
  Location: MyGeoPoint;
}
