import { AdminType } from "../admin/AdminType";
import { fuelTypes } from "../fuel/fuelTypes";
import { Metadata } from "../universal/Metadata";
import { QBOconfig as QboAuth } from "./QboAuth";
import { firestore } from "firebase-admin";
import { Meta } from "../universal/Meta";
import { DepotConfig } from "../depot/DepotConfig";
import { FuelConfig, emptyFuelConfig } from "./FuelConfig";
import { Environment } from "./Environments";

export interface Config {
    adminTypes: Array<AdminType>;
    Qbo: {
        /**
         * Every company has a sandbox and a live config
         */
        [key in Environment]: QboEnvironment
    };
    /**
     * Depot configurations remains constant across different environments
     */
    depotconfig: Array<DepotConfig>;
}

export interface QboEnvironment {
    auth: QboAuth;
    fuelconfig: {
        [key in fuelTypes]: FuelConfig
    };
}
/**
 * This is an initialization variable for the undeletable level for System Admins
 * More levels can be added via db, but these init values are forced to exist
 */
const happy: Meta = {
    adminId: "oSGSG2uCQJd3SqpZf6TXObrbDo73",
    date: firestore.Timestamp.fromDate(new Date("Aug 29, 2019"))
};

const InfoMetadata: Metadata = {
    created: happy,
    edited: happy
};


export const emptyqboAuth: QboAuth = {
    companyId: 0,
    clientId: "",
    clientSecret: "",
    webhooksVerifier: "",
    isSandbox: true,
    authConfig: {
        previousDCT: firestore.Timestamp.fromDate(new Date()),
        accessToken: "",
        refreshToken: "",
        accesstokenExpiry: firestore.Timestamp.fromDate(new Date()),
        refreshtokenExpiry: firestore.Timestamp.fromDate(new Date()),
        time: firestore.Timestamp.fromDate(new Date())
    }
};


export const emptyConfig: Config = {
    depotconfig: [],
    Qbo: {
        live: {
            auth: { ...emptyqboAuth },
            fuelconfig: {
                pms: { ...emptyFuelConfig },
                ago: { ...emptyFuelConfig },
                ik: { ...emptyFuelConfig }
            }
        },
        sandbox: {
            auth: { ...emptyqboAuth },
            fuelconfig: {
                pms: { ...emptyFuelConfig },
                ago: { ...emptyFuelConfig },
                ik: { ...emptyFuelConfig }
            }
        },
    },
    /**
     * Hardcoded this so that the system always has System Admin values
     * Always... Tutatambulikaje???
     */
    adminTypes: [
        {
            description: "Zero-Q IT Development Team",
            metadata: { ...InfoMetadata },
            name: "System Admins", levels: [
                {
                    description: "System Developers",
                    name: "Developers",
                    metadata: { ...InfoMetadata }
                }
            ]
        }
    ]
};
