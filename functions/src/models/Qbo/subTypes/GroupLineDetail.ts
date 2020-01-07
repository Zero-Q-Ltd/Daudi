import {Line} from "./Line";
import {ItemRef} from "./ItemRef";

export interface GroupLineDetail {
    Quantity: number;
    GroupItemRef: ItemRef;
    Line: Line[]
}
