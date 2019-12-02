export enum FuelType {
    "pms",
    "ago",
    "ik"
}

export const fuelTypeIds = Object.keys(FuelType).filter(key => isNaN(Number(FuelType[key])));
export const fuelTypeNames = Object.keys(FuelType).filter(key => !isNaN(Number(FuelType[key])));
