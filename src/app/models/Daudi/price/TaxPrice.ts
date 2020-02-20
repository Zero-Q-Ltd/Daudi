import { Price } from '../depot/Price';

export interface TaxPrice extends Omit<Price, 'depotId'> { }