import { Environment } from "../Daudi/omc/Environments";
import { OMCConfig } from "../Daudi/omc/Config";
import { Order } from "../Daudi/order/Order";
export interface OrderCreate {
    omcId: string;
    config: OMCConfig;
    environment: Environment;
    order: Order;
}
