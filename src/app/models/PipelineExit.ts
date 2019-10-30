import { fuelTypes } from "./universal";
import { DepotPrice } from "./Depot";
import { taxconfig } from "./Taxconfig";
export interface PipelineExit {
    Id: string;
    MetaData: {
        CreateTime: firebase.firestore.Timestamp | Date,
        LastUpdatedTime: firebase.firestore.Timestamp | Date
    };

    Name: string;
    Contact: {
        phone: string,
        name: string
    };
    hospitality: {
        amnt: number
    };
    taxconfig: taxconfig;
    sandbox: boolean;
    Location: firebase.firestore.GeoPoint;
}
