import { Meta, emptyMeta } from "./Meta";
export interface Metadata {
    /**
     * Sometimes we may just want to modify the last edited date
     */
    created?: Meta;
    edited: Meta;
}
export const emptymetadata: Metadata = {
    created: { ...emptyMeta },
    edited: { ...emptyMeta },
};
