import {Order} from "../Daudi/order/Order";
import {BaseCloudCall} from "./BaseCloudCall";

export interface OrderCreate extends BaseCloudCall {
    order: Order;
}
