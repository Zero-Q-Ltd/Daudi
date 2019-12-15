import { FuelType } from "../fuel/FuelType";

export interface Contact {
    name: string;
    phone: string;
    email: string;
    kraPin: string;
}

export interface OrderFuel {
    qty: number;
    price: number;
}

export interface CreateOrder {
    fuel: {
        [key in FuelType]: OrderFuel;
    };
    contact: Contact;
}
