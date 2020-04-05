import {Injectable} from "@angular/core";
import {emptyorder, Order} from "app/models/Daudi/order/Order";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: "root"
})
/**
 * this holds variables that are set in one component but are necessary for usage in another component
 */
export class ComponentCommunicationService {
  clickedorder: BehaviorSubject<Order> = new BehaviorSubject<Order>({...emptyorder});
  truckDeleted: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
  }
}
