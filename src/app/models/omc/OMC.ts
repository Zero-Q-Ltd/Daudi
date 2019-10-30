import { AdminType } from "../admin/AdminType";
import { Types } from "../fuel/fuelTypes";
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
        [key in Types]: {
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
