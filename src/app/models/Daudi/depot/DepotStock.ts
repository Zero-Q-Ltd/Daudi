export interface DepotStock {
    ase: {
        totalActive: number,
        used: number
    };
    entry: {
        totalActive: number,
        used: number
    };
}
export const EmptyDepotQty: DepotStock = {
    ase: {
        used: 0,
        totalActive: 0
    },
    entry: {
        used: 0,
        totalActive: 0
    }
};
