import { User } from "../universal/User";
import * as firebase from "firebase";
import { Contact } from "./Contact";
import { firestore } from "firebase-admin";

export interface Customer {
  Active: boolean;
  name: string;
  /**
   * The primary contact shall be in pos 0
   */
  contact: Array<Contact>;
  QbId: string;
  sandbox: boolean;
  Id: string;
  location: firestore.GeoPoint;
  krapin: string;
  kraverified: {
    status: boolean
    user: User,
  };
  companyId: string;
  balance: number;
}

export const emptycompany: Customer = {
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
  location: new firestore.GeoPoint(-1.3088567, 36.7752539),
  krapin: null,
  kraverified: {
    status: null,
    user: null
  },
  balance: 0
};
