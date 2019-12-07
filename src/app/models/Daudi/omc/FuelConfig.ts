import { Metadata, emptymetadata } from "../universal/Metadata";
export interface FuelConfig {
    allocation: {
        qty: number;
    };
    QbId: number;

}

export const emptyFuelConfig: FuelConfig = {
    allocation: {
        qty: 0
    },
    QbId: null,
};
