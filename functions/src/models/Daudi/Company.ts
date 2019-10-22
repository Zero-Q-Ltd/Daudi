import { firestore } from "firebase-admin";
import { User, inituser } from "../common";

export interface Company_ {
  Active: boolean;
  name: string;
  /**
   * The primary contact shall be in pos 0
   */
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  QbId: string;
  sandbox: boolean;
  Id: string;
  location: firestore.GeoPoint;
  krapin: string;
  kraverified?: {
    status: Boolean;
    user: User;
  };
  companyId: string;
  balance: number;
}

export const emptycompany: Company_ = {
  Active: false,
  contact: {
    email: "",
    phone: "",
    name: ""
  },
  companyId: "",
  Id: "",
  name: "",
  QbId: "",
  sandbox: true,
  location: new firestore.GeoPoint(0, 0),
  krapin: "",
  kraverified: {
    status: false,
    user: { ...inituser }
  },
  balance: 0
};
