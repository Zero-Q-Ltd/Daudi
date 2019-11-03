import { emptymetadata } from "../universal/universal";
import { Meta } from "../universal/Meta";
import { Metadata } from "../universal/Metadata";
import { firestore } from "firebase";
import { OMC } from "./OMC";
import { QBOconfig } from "./QBOconfig";

/**
 * This is an initialization variable for the undeletable level for System Admins
 * More levels can be added via db, but these init values are forced to exist
 */
const KisingaMetadata: Metadata = {
    created: {
        adminId: "oSGSG2uCQJd3SqpZf6TXObrbDo73",
        date: new Date("Aug 29, 2019")
    },
    edited: {
        adminId: "oSGSG2uCQJd3SqpZf6TXObrbDo73",
        date: new Date("Aug 29, 2019")
    }
};

export const emptyqbo: QBOconfig = {
    companyid: 0,
    clientid: "",
    clientSecret: "",
    webhooksverifier: "",
    issandbox: true,
    authconfig: {
        previousDCT: firestore.Timestamp.fromDate(new Date()),
        accessToken: "",
        refreshtoken: "",
        accesstokenExpiry: firestore.Timestamp.fromDate(new Date()),
        refreshtokenExpiry: firestore.Timestamp.fromDate(new Date()),
        time: firestore.Timestamp.fromDate(new Date())
    }
};
export const emptyomc: OMC = {
    license: null,
    contactperson: [],
    logourl: null,
    status: null,
    fuelconfig: {
        ago: null,
        ik: null,
        pms: null
    },
    qbconfig: { ...emptyqbo },

    /**
     * make default location Somewhere in nbi
     */
    location: new firestore.GeoPoint(-1.3373943, 36.7208522),
    name: null,
    id: null,
    userid: null,
    description: null,
    metadata: emptymetadata,

    /**
     * Hardcoded this so that the system always has System Admin values
     * Always... Tutatambulikaje???
     */
    adminTypes: [
        {
            description: "Zero-Q IT Development Team",
            metadata: KisingaMetadata,
            name: "System Admins", levels: [
                {
                    description: "System Developers",
                    name: "Developers",
                    metadata: KisingaMetadata
                }
            ]
        }
    ]
};



