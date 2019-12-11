import { Metadata, emptymetadata } from "../universal/Metadata";
export interface FuelConfig {
    allocation: {
        qty: number;
    };
    groupId: string;
    aseId: string;
    entryId: string;
}

export const emptyFuelConfig: FuelConfig = {
    allocation: {
        qty: 0
    },
    groupId: null,
    aseId: null,
    entryId: null
};
