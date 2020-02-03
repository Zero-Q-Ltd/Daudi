import {deepCopy} from '../../utils/deepCopy';
import {emptymetadata, Metadata} from '../universal/Metadata';

export interface TaxExempt {
  amount: number;
  metadata: Metadata;
}

export const emptytaxExempt: TaxExempt = {
  amount: 0,
  metadata: deepCopy<Metadata>(emptymetadata)
};
