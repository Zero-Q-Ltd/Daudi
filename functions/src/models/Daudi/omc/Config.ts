import {MyTimestamp} from "../../firestore/firestoreTypes";
import {deepCopy} from "../../utils/deepCopy";
import {AdminType} from "../admin/AdminType";
import {Meta} from "../universal/Meta";
import {Metadata} from "../universal/Metadata";
import {emptyFuelConfig, FuelConfig} from "./FuelConfig";
import {QBOAuthCOnfig} from "./QboAuthConfig";
import {QboEnvironment} from "./QboEnvironment";

export interface OMCConfig {
    adminTypes: Array<AdminType>;
    Qbo: QboEnvironment;
    status: boolean;
}

/**
 * This is an initialization variable for the undeletable level for System Admins
 * More levels can be added via db, but these init values are forced to exist
 */
const happy: Meta = {
    adminId: "oSGSG2uCQJd3SqpZf6TXObrbDo73",
    date: MyTimestamp.fromDate(new Date("Aug 29, 2019"))
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
    authConfig: {
        previousDCT: MyTimestamp.fromDate(new Date()),
        accessToken: "",
        refreshToken: "",
        accesstokenExpiry: MyTimestamp.fromDate(new Date()),
        refreshtokenExpiry: MyTimestamp.fromDate(new Date()),
        time: MyTimestamp.fromDate(new Date())
    }
};


export const emptyConfig: OMCConfig = {
    status: true,
    Qbo: {
        auth: deepCopy<QBOAuthCOnfig>(emptyqboAuth),
        fuelconfig: {
            pms: deepCopy<FuelConfig>(emptyFuelConfig),
            ago: deepCopy<FuelConfig>(emptyFuelConfig),
            ik: deepCopy<FuelConfig>(emptyFuelConfig)
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
    /**
     * Hardcoded this so that the system always has System Admin values
     * Always... Tutatambulikaje???
     */
    adminTypes: [
        {
            description: "Zero-Q IT Development Team",
            metadata: deepCopy<Metadata>(InfoMetadata),
            name: "System Admins", levels: [
                {
                    description: "System Developers",
                    name: "Developers",
                    metadata: deepCopy<Metadata>(InfoMetadata)
                }
            ]
        }
    ]
};
