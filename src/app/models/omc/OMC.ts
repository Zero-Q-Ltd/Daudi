import { AdminType } from "../admin/AdminType";
import { fuelTypes } from "../fuel/fuelTypes";
import { Metadata } from "../universal/Metadata";
import { ContactPerson } from "./ContactPerson";
import { QBOconfig } from "./QBOconfig";
export interface OMC {
    license: string;
    location: firebase.firestore.GeoPoint;
    name: string;
    userid: string;
    id: string;
    description: string;
    status: boolean;
    contactperson: Array<ContactPerson>;
    qbconfig: QBOconfig;
    fuelconfig: {
        [key in fuelTypes]: {
            allocation: {
                qty: number
            }
            QbId: number;
            tax: {
                QbId: number;
                nonTax: number;
                metadata: Metadata;
            };
        };
    };
    logourl: string;
    metadata: Metadata;
    adminTypes: Array<AdminType>;
}
