export interface DepotQty {
    ase: {
        totalActive: number,
        available: number
    },
    entry: {
        totalActive: number,
        available: number
    }
}
export const EmptyDepotQty: DepotQty = {
    ase: {
        available: 0,
        totalActive: 0
    },
    entry: {
        available: 0,
        totalActive: 0
    }
}