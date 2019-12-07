import { AdminType } from "../admin/AdminType";
import { FuelType } from "../fuel/FuelType";
import { Metadata, emptymetadata } from "../universal/Metadata";
import { firestore } from "firebase";

import { Meta } from "../universal/Meta";
import { DepotConfig } from "../depot/DepotConfig";
import { FuelConfig, emptyFuelConfig } from "./FuelConfig";
import { Environment } from "./Environments";
import { QBOAuthCOnfig } from "./QboAuthConfig";
import { TaxConfig } from "./TaxConfig";

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
    depotconfig: {
        [key in Environment]: Array<DepotConfig> };
    taxExempt: {
        [key in Environment]: {
            [key in FuelType]: TaxExempt
        } };
}

export interface QboEnvironment {
    auth: QBOAuthCOnfig;
    fuelconfig: {
        [key in FuelType]: FuelConfig
    };
    taxConfig: TaxConfig;
}

interface TaxExempt {
    amount: number;
    metadata: Metadata;
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

export const emptyqboAuth: QBOAuthCOnfig = {
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
const emptytaxExempt: TaxExempt = {
    amount: 0,
    metadata: { ...emptymetadata }
};

export const emptyConfig: Config = {
    depotconfig: {
        live: [],
        sandbox: []
    },
    taxExempt: {
        live: {
            ago: { ...emptytaxExempt },
            ik: { ...emptytaxExempt },
            pms: { ...emptytaxExempt }
        },
        sandbox: {
            ago: { ...emptytaxExempt },
            ik: { ...emptytaxExempt },
            pms: { ...emptytaxExempt }
        }
    },
    Qbo: {
        live: {
            auth: { ...emptyqboAuth },
            fuelconfig: {
                pms: { ...emptyFuelConfig },
                ago: { ...emptyFuelConfig },
                ik: { ...emptyFuelConfig }
            },
            taxConfig: {
                taxAgency: {
                    Id: "0"
                },
                taxCode: {
                    Id: "0"
                },
                taxRate: {
                    Id: "0"
                },
            }
        },
        sandbox: {
            auth: { ...emptyqboAuth },
            fuelconfig: {
                pms: { ...emptyFuelConfig },
                ago: { ...emptyFuelConfig },
                ik: { ...emptyFuelConfig }
            },
            taxConfig: {
                taxAgency: {
                    Id: "0"
                },
                taxCode: {
                    Id: "0"
                },
                taxRate: {
                    Id: "0"
                },
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
