import { Contact } from "./Contact";
import { AssociatedUser } from "../admin/AssociatedUser";
import { MyGeoPoint } from "../../firestore/firestoreTypes";
import { Environment } from "../omc/Environments";
import { CustomerDetail } from "./CustomerDetail";

export interface DaudiCustomer extends CustomerDetail {
  Active: boolean;
  location: MyGeoPoint;
  kraverified: {
    status: boolean
    user: AssociatedUser,
  };
  balance: number;
}



export const emptyDaudiCustomer: DaudiCustomer = {
  Active: null,
  contact: [],
  Id: null,
  name: null,
  QbId: null,
  /**
   * make default location Somewhere in nbi
   */
  location: new MyGeoPoint(-1.3088567, 36.7752539),
  krapin: null,
  kraverified: {
    status: null,
    user: null
  },
  balance: 0
};
