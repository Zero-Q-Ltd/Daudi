import {MyTimestamp} from "../../firestore/firestoreTypes";
import {Contact} from "../customer/Contact";

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
  contact: Contact[];
  msg: string;
  greeting: string;
  timestamp: MyTimestamp;
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
  contact: [],
  msg: null,
  greeting: null,
  timestamp: new MyTimestamp(0, 0),
  status: {
    sent: null,
    delivered: null
  }
};
