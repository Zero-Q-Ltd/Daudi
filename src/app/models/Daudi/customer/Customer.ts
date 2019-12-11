import { Contact } from "./Contact";
import { AssociatedUser } from "../admin/AssociatedUser";
import { MyGeoPoint } from "../../firestore/firestoreTypes";

export interface DaudiCustomer {
  Active: boolean;
  name: string;
  /**
   * The primary contact shall be in pos 0
   */
  contact: Array<Contact>;
  QbId: string;
  sandbox: boolean;
  Id: string;
  location: MyGeoPoint;
  krapin: string;
  kraverified: {
    status: boolean
    user: AssociatedUser,
  };
  companyId: string;
  balance: number;
}

export const emptyDaudiCustomer: DaudiCustomer = {
  Active: null,
  contact: [],
  companyId: null,
  Id: null,
  name: null,
  QbId: null,
  sandbox: null,
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
