import { Price, emptyprice } from '../depot/Price';

export interface AvgPrice extends Price {
  omcId: string;
}

export const emptyAvgprice: AvgPrice = { ...emptyprice, ...{ omcId: null } }
