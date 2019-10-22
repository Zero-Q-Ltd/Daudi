import { inituser, User } from "./universal";

export interface Admin_ {
  Active: boolean,
  qbconfig: {
    companyid: string,
    QbId: string,
    sandbox: boolean
  }
  Id: string,
  config: {
    level: string,
    viewsandbox: boolean,
    depotid: string,
    approvedby: User
    /**
     * This keeps a reference to the id of the user type
     */
    type: number,
  },
  data: {
    email: string,
    uid: string,
    photoURL: string,
    name: string,
  },
  status: {
    online: boolean,
    time: Date
  },
  settings: {
    fcm: {
      trueck: {
        live: boolean,
        sandbox: boolean
      },
      payment: {
        live: boolean,
        sandbox: boolean
      },
    },
  }
  profiledata: {
    address: {
      Id: string,
      Line1: string,
      City: string,
      CountrySubDivisionCode: string,
      PostalCode: string
    },
    gender: "Male" | "Female"
    dob: string,
    bio: string,
    phone: string,
  },
  fcmtokens: {
    web: string,
    apk: string
  };
}

export const emptyadmin: Admin_ = {
  Active: null,
  qbconfig: {
    companyid: null,
    QbId: null,
    sandbox: null
  },
  Id: null,
  config: {
    viewsandbox: false,
    level: null,
    approvedby: inituser,
    depotid: null,
    type: null,
  },
  data: {
    email: null,
    uid: null,
    photoURL: null,
    name: null
  },
  status: {
    online: false,
    time: null
  },
  profiledata: {
    gender: null,
    address: null,
    dob: null,
    bio: null,
    phone: null
  },
  fcmtokens: {
    web: null,
    apk: null
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
  }

};
