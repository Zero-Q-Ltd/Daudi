import { inituser, User } from "./universal";

export interface Admin {
  Active: boolean;
  qbconfig: {
    companyid: string,
    QbId: string,
    sandbox: boolean
  };
  Id: string;
  config: {
    level: string,
    viewsandbox: boolean,
    app: {
      depotid: string,
    },
    fcm: {
      tokens: {
        web: string,
        apk: string
      };
      settings: {
        truck: {
          live: boolean,
          sandbox: boolean
        },
        payment: {
          live: boolean,
          sandbox: boolean
        }
      },
    };
    approvedby: User
    /**
     * This keeps a reference to the id of the user type
     */
    type: number,
  };
  status: {
    online: boolean,
    time: Date
  };

  profile: {
    email: string,
    uid: string,
    photoURL: string,
    name: string,
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
  };

}

export const emptyadmin: Admin = {
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
    approvedby: { ...inituser },
    app: {
      depotid: null
    },
    fcm: {
      settings: {
        payment: null,
        truck: null
      },
      tokens: {
        apk: null,
        web: null
      }
    },
    type: null,
  },

  status: {
    online: false,
    time: null
  },
  profile: {
    address: null,
    bio: null,
    dob: null,
    email: null,
    gender: null,
    name: null,
    phone: null,
    photoURL: null,
    uid: null
  }

};
