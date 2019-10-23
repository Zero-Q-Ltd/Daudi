import { AdminType } from "./AdminType";
import { Metadata, emptymetadata, Meta, fuelTypes } from "./universal";
import * as firebase from "firebase";

export interface CompanyConfig {
    location: firebase.firestore.GeoPoint;
    name: string;
    userid: string;
    id: string;
    description: string;
    status: boolean;
    contactperson: Array<ContactPerson>;

    fuelconfig: {
        [key in fuelTypes]: string
    };
    logourl: string;
    metadata: Metadata;
    adminTypes: Array<AdminType>;
}

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

interface ContactPerson {
    name: string;
    phone: string;
    email: string;
    position: string;
    address: string;
}
export const emptycompanydata: CompanyConfig = {
    contactperson: [],
    logourl: null,
    status: null,
    fuelconfig: {
        ago: null,
        ik: null,
        pms: null
    },
    /**
     * make default location Somewhere in nbi
     */
    location: new firebase.firestore.GeoPoint(-1.3373943, 36.7208522),
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

