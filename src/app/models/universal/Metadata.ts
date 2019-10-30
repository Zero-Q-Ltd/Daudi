import { Meta } from "./universal";
export interface Metadata {
    /**
     * Sometimes we may just want to modify the last edited date
     */
    created?: Meta;
    edited: Meta;
}
