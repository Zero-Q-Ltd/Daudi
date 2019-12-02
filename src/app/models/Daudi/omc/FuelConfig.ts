import { Metadata, emptymetadata } from "../universal/Metadata";
export interface FuelConfig {
    allocation: {
        qty: number;
    };
    QbId: number;
    tax: {
        nonTax: number;
        metadata: Metadata;
    };
}

export const emptyFuelConfig: FuelConfig = {
    allocation: {
        qty: 0
    },
    QbId: null,
    tax: {
        metadata: { ...emptymetadata },
        nonTax: 0
    },
};
