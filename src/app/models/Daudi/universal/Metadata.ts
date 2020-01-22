import {emptyMeta, DaudiMeta} from "./Meta";
import {deepCopy} from "../../utils/deepCopy";

export interface Metadata {
    /**
     * Sometimes we may just want to modify the last edited date
     */
    created?: DaudiMeta;
    edited: DaudiMeta;
}

export const emptymetadata: Metadata = {
    created: deepCopy<DaudiMeta>(emptyMeta),
    edited: deepCopy<DaudiMeta>(emptyMeta),
};
