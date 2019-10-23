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
        phone: null,
        name: null
    };

    currentpriceconfig: {
        [key in fuelTypes]: DepotPrice
    };
    taxconfig: taxconfig;
    sandbox: boolean;
    Location: firebase.firestore.GeoPoint;
}
