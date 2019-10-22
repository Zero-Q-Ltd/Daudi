export interface Order extends DatabaseBasics {

  companyName?: string;
  companyPhone?: number;
  companyEmail?: string;
  contactName?: string;
  createdByuid?: string;   //this is the uid
  createdBy?: string;     //this is the nmae for easy reference
  createdTime?: any;

  deletedBy?: string; //track who deleted
  deletedAt?: any; //track time deleted
  deletedByUser?: string;
  approvedBy?: string;

  discountRequest?: Object;
  discountApproved?: Object;
  allowSms?: boolean;
  orderId?: number;
  grandTotal?: number;
  stage?: number;

  pmsQty?: number;
  pmsRp?: number;
  pmsAmntloaded?: number;
  pmsSp?: number;
  pmsTotal?: number;

  agoQty?: number;
  agoRp?: number;
  agoAmntloaded?: number;
  agoSp?: number;
  agoTotal?: number;

  ikQty?: number;
  ikRp?: number;
  ikAmntloaded?: number;
  ikSp?: number;
  ikTotal?: number;

  soCreatedBy?: string;   //this is the uid
  soUsername?: string;     //this is the nmae for easy reference
  soCreatedAt?: any;
  so?: string;

  bankRefcreatedBy?: string;   //this is the uid
  bankRefUsername?: string;     //this is the nmae for easy reference
  bankRefcreatedTime?: any;
  bankRef?: string;

  trucks?: object;
  enteredById?: string;
  enteredByUser?: string;

  completedAt?: any;
  completedBy?: string;
  completedByUsername?: string;

  family?: boolean; // family flag
}

export interface OrderStats extends DatabaseBasics {
  date?: string;
  ordersTotal?: any;
  pmsTotalqty?: any;
  agoTotalqty?: any;
  ikTotalqty?: any;
  pmsTotal?: any;
  agoTotal?: any;
  ikTotal?: any;
  ordersTotalqty?: any;
}

export interface fuelStats extends DatabaseBasics {
  totalActive?: number
  totalLoaded?: number
  totalReserved?: number
  totalSold?: number
}

export interface Depots extends DatabaseBasics {
  name?: string;
  createdById?: string;
  createdByUser?: string;
  createdAt?: any;
}

export interface FuelPrices extends DatabaseBasics {

  pmsAvg?: number;
  pmsEditedby?: string;
  pmsEditedbyuid?: string;
  pmsLastEdited?: string;
  pmsPrice?: number;
  //an object containing the entered pices that are used to get the average
  pmsAvgObj?: object;
  pmsavgEditedby?: string;
  pmsavgEditedbyuid?: string;

  agoAvg?: number;
  agoEditedby?: string;
  agoEditedbyuid?: string;
  agoLastEdited?: string;
  agoPrice?: number;
  agoAvgObj?: object;
  agoavgEditedby?: string;
  agoavgEditedbyuid?: string;

  ikAvg?: number;
  ikEditedby?: string;
  ikEditedbyuid?: string;
  ikLastEdited?: string;
  ikPrice?: number;
  ikAvgObj?: object;
  ikavgEditedby?: string;
  ikavgEditedbyuid?: string;

}

export interface GlobalDetails {

  createdByuid?: string;   //this is the uid
  createdBy?: string;     //this is the nmae for easy reference
  createdTime?: any;
  value?: any;
}

export interface User extends DatabaseBasics {
  email?: string;
  level?: number;
  photoURL?: string;
  displayName?: string;
  phoneNumber?: string;
  status?: boolean; //Whether olnine or offline
}

export interface Rules extends DatabaseBasics {

}

export interface Chat extends DatabaseBasics {
  msg?: string;
  time?: any;
  uid?: string;
  username?: string;
  readby?: any;
}

export interface EmkayFamily {
  uid?: string;//copycreated by
  email?: any;
  phone?: string;
  userName?: string;
  photoURL?: string;
  companyId?: string;
  companyName?: string;

  createdByEmail?: string,
  createdByUid?: string,
  createdTime?: any;
  $key?: string;
  approved?: Boolean;
  orderId?: string;
}

export interface EmkayFamilyHistory extends DatabaseBasics {
  orderId?: string;
  companyId?: string;
  stage?: number;
  pmsQty?: number;
  agoQty?: number;
  ikQty?: number;
  totalAmount?: number;
  createdTime?: any;
  createdByUid?: string;
  createdByUser?: string;
}

export interface Batch extends DatabaseBasics, GlobalDetails {
  batchno?: string;
  totalQty?: number;
  loadedQty?: number;
  runningCost?: number;
  pricePerL?: number;
  minSP?: number;
  //The following 3 hold volume figures
  pms?: object;
  ago?: object;
  ik?: object;
}

export interface Truck extends DatabaseBasics {
  agoQty?: number;
  pmsQty?: number;
  ikQty?: number;

  pmsBatch?: string;
  agoBatch?: string;
  ikBatch?: string;

  pmsbatchkey?: string;
  agobatchkey?: string;
  ikbatchkey?: string;

  pmsbatchdiff?: number; //Used when a truck has more than 1 batch number to store the amount that was deducted from the first batch
  agobatchdiff?: number; //Used when a truck has more than 1 batch number to store the amount that was deducted from the first batch
  ikbatchdiff?: number; //Used when a truck has more than 1 batch number to store the amount that was deducted from the first batch

  truckRef?: string; //added here for compartments sake

  createdBy?: string;   //this is the uid
  userName?: string;     //this is the nmae for easy reference
  stage?: number;
  createdTime?: any;

  isorderProcessed?: boolean;// to show if order is created from front end

  orderRef?: string; //match with order id
  orderCompanyName?: string;
  orderContactName?: string;
  orderCompanyPhone?: number;
  orderCreatedTime?: any;
  orderSo?: string;
  allowSms?: boolean;

  truckId?: string;
  grandTotal?: number;
  depot?: string; //depo id
  depotName?: string;
  driverName?: string;
  driverId?: string;
  truckReg?: string;

  proTime?: any; //processing time at
  proExpiryreact?: any;
  proAt?: any;
  proBy?: string;
  probyUname?: string;

  queTime?: any;
  queExpiry?: any;
  queExpiryreact?: any;
  queAt?: any;
  queBy?: string;
  quebyUname?: string;

  loadTime?: any;
  loadExpiry?: any;
  loadExpiryreact?: any;
  loadAt?: any;
  loadBy?: string;
  loadbyUname?: string;

  doneAt?: any;
  doneBy?: string;
  donebyUname?: string;

  sealNumbers?: string;
  stagePrinted?: Boolean;
  c1?: string;
  c2?: string;
  c3?: string;
  c4?: string;
  c5?: string;
  c6?: string;
  c7?: string;

}

export interface customUserDetails extends DatabaseBasics {
  level: number;
}

//this will help avoid a lot of repetitions for Firebase database fields that should be there by default
interface DatabaseBasics {
  $key?: string;
  $ref?: string;

}

export interface Texts {
  //essentials
  sentByEmail?: string;
  sentByUsername?: string;
  sentByUid?: string;
  toCompanyName?: string;
  toCompanyId?: string;
  toCompanyNo?: string;
  message?: string;
  time?: any;

}

export interface CompanyNames {
  $key?: string;
  companyId?: string;
  companyName?: string;
}

export interface Companies {
  $key?: string;
  createdTime?: any;
  companyName?: string;
  companyEmail?: string;
  kraPin?: string;
  contactName?: string;
  companyPhone?: number;
  county?: string;
  subcounty?: string;
  town?: string;
  adminEmail?: string;
  adminUid?: string;
  verified?: boolean;
  verifiedByUid?: string;
  verifiedByUser?: string;
  users?: object;
}

export interface KraPins {
  $key?: string; //companyID
  pin?: string;
  companyId?: string;
}

export class stageNames {
  getStagename(stageid) {
    switch (stageid) {
      case 1:
        return "NEW ORDERS";
      case 2:
        return "INVOICED";
      case 3:
        return "UNLOADED";
      case 4:
        return "LOADED";
      case 4.1:
        return "PROCESING";
      case 4.2:
        return "QUEUED";
      case 4.3:
        return "LODING";
      case 4.4:
        return "COMPLETED";
      case 5:
        return "COMPLETED";
      case 6:
        return "ARCHIVED";
      case 7:
        return "DELETED";
      default:
        return "Illigal Operation";
    }
  }

}
