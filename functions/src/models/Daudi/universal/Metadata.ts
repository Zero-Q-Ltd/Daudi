import {emptyMeta, Meta} from "./Meta";
import {deepCopy} from "../../utils/deepCopy";

export interface Metadata {
    /**
     * Sometimes we may just want to modify the last edited date
     */
    created?: Meta;
    edited: Meta;
}
export const emptymetadata: Metadata = {
    created: deepCopy<Meta>(emptyMeta),
    edited: deepCopy<Meta>(emptyMeta),
};
