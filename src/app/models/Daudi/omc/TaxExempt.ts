import { Metadata, emptymetadata } from "../universal/Metadata";
import { deepCopy } from "../../utils/deepCopy";

export interface TaxExempt {
    amount: number;
    metadata: Metadata;
}
export const emptytaxExempt: TaxExempt = {
    amount: 0,
    metadata: deepCopy<Metadata>(emptymetadata)
};