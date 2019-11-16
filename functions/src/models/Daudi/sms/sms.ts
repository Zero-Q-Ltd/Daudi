import { firestore } from "firebase-admin";
export interface SMS {
  Id: string;
  type: {
    origin: "custom" | "system" | "bulk",
    reason: "ordermoved" | "truckmoved" | string
  };
  company: {
    QbId: string,
    name: string,
    Id: string,
    krapin: string
  };
  phone: string;
  msg: string;
  greeting: string;
  timestamp: firestore.Timestamp;
  status: {
    sent: boolean,
    delivered: boolean
  };
}

export const emptysms: SMS = {
  Id: null,
  type: {
    origin: null,
    reason: null
  },
  company: {
    QbId: null,
    name: null,
    Id: null,
    krapin: null
  },
  phone: null,
  msg: null,
  greeting: null,
  timestamp: new firestore.Timestamp(0, 0),
  status: {
    sent: null,
    delivered: null
  }
};
