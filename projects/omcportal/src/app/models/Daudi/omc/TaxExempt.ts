import { deepCopy } from "../../utils/deepCopy";
import { AssociatedUser, EmptyAssociatedUser } from "../admin/AssociatedUser";

export interface TaxExempt {
  amount: number;
  user: AssociatedUser;
}

export const emptytaxExempt: TaxExempt = {
  amount: 0,
  user: deepCopy<AssociatedUser>(EmptyAssociatedUser),
};
