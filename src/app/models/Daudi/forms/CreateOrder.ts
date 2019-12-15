import { FuelType } from "../fuel/FuelType";
import { Contact } from "../customer/Contact";

export interface OrderContactForm extends Contact {
    kraPin: string;
    companyName: string;
}

export interface OrderFuel {
    qty: number;
    price: number;
}

export interface CreateOrder {
    fuel: {
        [key in FuelType]: OrderFuel;
    };
    detail: OrderContactForm;
}
