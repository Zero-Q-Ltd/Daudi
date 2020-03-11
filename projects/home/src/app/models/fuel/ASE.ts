import { BaseStockModel } from "./BaseStockModel";
import { QbRef } from "./QbRef";

export interface ASE extends Omit<BaseStockModel, "qty"> {
  ase: QbRef;
  qty: number;
}

export function newAse(): ASE {
  return {
    ...{
      Id: null,
      fuelType: null,
      Amount: null,
      ase: {
        QbId: null,
        qty: 0
      },
      price: 0,
      qty: 0,
      depot: {
        name: null,
        Id: null
      },
      active: false,
      date: new Date()
    }
  };
}
