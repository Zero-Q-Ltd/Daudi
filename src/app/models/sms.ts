import * as firebase from "firebase";

export interface SMS {
  Id: string,
  type: {
    origin: "custom" | "system" | "bulk",
    reason: "ordermoved" | "truckmoved" | string
  },
  company: {
    QbId: string,
    name: string,
    Id: string,
    phone: string,
    contactname: string
  },
  msg: string,
  greeting: string,
  timestamp: firebase.firestore.Timestamp,
  status: {
    sent: boolean,
    delivered: boolean
  },
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
    phone: null,
    contactname: null
  },
  msg: null,
  greeting: null,
  timestamp: new firebase.firestore.Timestamp(0, 0),
  status: {
    sent: null,
    delivered: null
  }
};
