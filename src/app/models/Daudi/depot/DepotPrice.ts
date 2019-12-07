import { AssociatedUser } from "../admin/AssociatedUser";

export interface DepotPrice {
    price: number;
    minPrice: number;
    user: AssociatedUser;
}
