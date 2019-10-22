import { inituser, User } from "../common";
import { firestore } from "firebase-admin";

export interface Admin_ {
  Active: boolean;
  qbconfig: {
    companyid: string;
    QbId: string;
    sandbox: boolean;
  };
  Id: string;
  config: {
    level?: string;
    viewsandbox: boolean;
    depotdata?: {
      depotname: string;
      depotid: string;
    };
    approvedby: User;
  };
  settings: {
    fcm: {
      trueck: {
        live: boolean;
        sandbox: boolean;
      };
      payment: {
        live: boolean;
        sandbox: boolean;
      };
    };
  };
  data: {
    email: string;
    uid: string;
    photoURL: string;
    name: string;
  };
  status: {
    online: boolean;
    time: firestore.Timestamp;
  };
  profiledata: {
    address: {
      Id: string;
      Line1: string;
      City: string;
      CountrySubDivisionCode: string;
      PostalCode: string;
    };
    gender: "Male" | "Female";
    dob: string;
    bio: string;
    phone: string;
  };
  fcmtokens: {
    web: string;
    apk: string;
  };
}

export const emptyadmin: Admin_ = {
  Active: false,
  qbconfig: {
    companyid: '',
    QbId: '',
    sandbox: true
  },
  Id: '',
  config: {
    viewsandbox: false,
    level: '',
    approvedby: inituser
  },
  data: {
    email: '',
    uid: '',
    photoURL: '',
    name: ''
  },
  status: {
    online: false,
    time: firestore.Timestamp.fromDate(new Date())
  },
  settings: {
    fcm: {
      trueck: {
        live: false,
        sandbox: false
      },
      payment: {
        live: false,
        sandbox: false
      }
    }
  },
  profiledata: {
    gender: "Male",
    address: {
      City: '',
      CountrySubDivisionCode: '',
      Id: '',
      Line1: '',
      PostalCode: ''
    },
    dob: '',
    bio: '',
    phone: ''
  },
  fcmtokens: {
    web: '',
    apk: ''
  }
};
