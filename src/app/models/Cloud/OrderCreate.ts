import { Environment } from "../Daudi/omc/Environments";
import { Config } from "../Daudi/omc/Config";
import { Order } from "../Daudi/order/Order";
export interface OrderCreate {
    omcId: string;
    config: Config;
    environment: Environment;
    order: Order;
}
