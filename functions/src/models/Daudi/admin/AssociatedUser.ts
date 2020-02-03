import {DaudiMeta} from '../universal/Meta';

export interface AssociatedUser extends DaudiMeta {
  name: string;
}

export const EmptyAssociatedUser: AssociatedUser = {
  name: '',
  adminId: '',
  date: new Date() as any
};

