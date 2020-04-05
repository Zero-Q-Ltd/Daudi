import {deepCopy} from "../../utils/deepCopy";
import {AssociatedUser, EmptyAssociatedUser} from "./AssociatedUser";

export interface Admin {
  Active: boolean;
  Id: string;
  config: {
    qbo: {
      companyid: string,
      QbId: string,
    }
    omcId: string,
    app: {
      depotid: string,
    },
    fcm: {
      tokens: {
        web: string,
        apk: string
      };
      subscriptions: {
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
    approvedby: AssociatedUser
    /**
     * This keeps a reference to the id of the user type
     */
    type: number,
    level: number,

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
  Id: null,
  config: {
    omcId: null,
    level: null,
    qbo: {
      companyid: null,
      QbId: null,
    },
    approvedby: deepCopy(EmptyAssociatedUser),
    app: {
      depotid: null
    },
    fcm: {
      subscriptions: {
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
