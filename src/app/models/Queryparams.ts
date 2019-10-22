import * as firebase from "firebase";

type querybuild = {
  status: boolean,
  value: string | number
}
const emptyquerybuild: querybuild = {
  status: false,
  value: null
};

export interface TruckQueryParams {
  stagedata: {
    date: {
      status: boolean,
      range: {
        from: firebase.firestore.Timestamp | Date,
        to: firebase.firestore.Timestamp | Date
      },
      absolute: firebase.firestore.Timestamp | Date
    },
    invoiceno: {
      status: boolean,
      value: string
    },
    user: {
      status: false,
      value: string
    },
    stage: {
      status: boolean,
      value: string
    },
    seals: {},
    batch: {}
  }
  customer: {
    status: boolean,
    value: string
  }
}

export type dateQuerybuild = {
  range: {
    from: firebase.firestore.Timestamp | Date,
    to: firebase.firestore.Timestamp | Date
  },
  absolute: firebase.firestore.Timestamp | Date
}

export interface OrderQueryParams {
  stagedata: {
    status: boolean,
    date: {
      status: boolean,
      range: {
        from: firebase.firestore.Timestamp | Date,
        to: firebase.firestore.Timestamp | Date
      },
      absolute: firebase.firestore.Timestamp | Date
    },
    invoiceno: querybuild,
    batch: querybuild,
    user: querybuild,
    stage: querybuild,
  }
  company: {
    status: boolean,
    contact: {
      email: querybuild,
      name: querybuild,
      phone: querybuild,
    },
    phone: querybuild,
    name: querybuild,
    QbId: querybuild,
    krapin: querybuild,
  },
  /**
   * TODO : Finish pricing query
   */
  pricing: {
    status: boolean
  }
}

export const epmtyQueryparams: OrderQueryParams = {
  stagedata: {
    status: null,
    date: {
      status: false,
      range: {
        from: null,
        to: null
      },
      absolute: null
    },
    invoiceno: Object.assign({}, emptyquerybuild),
    batch: Object.assign({}, emptyquerybuild),
    user: Object.assign({}, emptyquerybuild),
    stage: Object.assign({}, emptyquerybuild)
  },
  company: {
    status: null,
    contact: {
      email: Object.assign({}, emptyquerybuild),
      name: Object.assign({}, emptyquerybuild),
      phone: Object.assign({}, emptyquerybuild)
    },
    krapin: Object.assign({}, emptyquerybuild),
    name: Object.assign({}, emptyquerybuild),
    phone: Object.assign({}, emptyquerybuild),
    QbId: Object.assign({}, emptyquerybuild)
  },

  pricing: {
    status: null
  }

};
