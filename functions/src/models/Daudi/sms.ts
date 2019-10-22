import { firestore } from "firebase-admin";

export interface SMS {
  Id: string;
  type: {
    origin: "custom" | "system";
    reason: "ordermoved" | "truckmoved" | string;
  };
  company: {
    QbId: string;
    name: string;
    Id: string;
    phone: string;
    contactname: string;
  };
  msg: string;
  greeting: string;
  timestamp: firestore.Timestamp;
  status: {
    sent: boolean;
    delivered: boolean;
  };
}

export const emptysms: SMS = {
  Id: "",
  type: {
    origin: "custom",
    reason: ""
  },
  company: {
    QbId: "",
    name: "",
    Id: "",
    phone: "",
    contactname: ""
  },
  msg: "",
  greeting: "",
  timestamp: firestore.Timestamp.fromDate(new Date()),
  status: {
    sent: false,
    delivered: false
  }
};
