import { deepCopy } from "../../../models/utils/deepCopy";
import { BaseStockModel } from "./BaseStockModel";
import { EmptyStockQty, StockQty } from "./StockQty";
import { EntryRef } from "./StockRef";

export interface Entry extends BaseStockModel {
  entry: EntryRef;
}
export interface EntryDraw {
  qtyDrawn: number;
  qtyRemaining: number;
  resultStatus: boolean;
}

export const EmptyEntryDraw: EntryDraw = {
  qtyDrawn: 0,
  qtyRemaining: 0,
  resultStatus: true,
};

export const emptyEntry: Entry = {
  Id: null,
  fuelType: null,
  Amount: null,
  entry: {
    name: null,
    refs: [],
  },
  price: 0,
  qty: deepCopy<StockQty>(EmptyStockQty),
  depot: {
    name: null,
    Id: null,
  },
  active: false,
  date: new Date(),
};
