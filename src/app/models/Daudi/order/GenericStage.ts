import { deepCopy } from '../../utils/deepCopy';
import { AssociatedUser, EmptyAssociatedUser } from '../admin/AssociatedUser';
import { Expiry } from './truck/Truck';

/**
 * @description Base model for every Stage movement carried out via the web-App
 */
export interface GenericStage {
  user: AssociatedUser;
}

export interface GenericTruckStage extends GenericStage {
  expiry: Expiry[];
  /**
   * In milliseconds
   */
  totalExpiredTime: number;
  totalApproxTime: number;
  Additions: number;
}

export const EmptyGenericStage: GenericStage = {
  user: deepCopy(EmptyAssociatedUser)
};

export const EmptyGenericTruckStage: GenericTruckStage = {
  expiry: [],
  user: deepCopy(EmptyAssociatedUser),
  Additions: 0,
  totalApproxTime: 0,
  totalExpiredTime: 0
};
