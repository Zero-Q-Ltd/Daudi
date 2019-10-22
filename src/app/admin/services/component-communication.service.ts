import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {emptyorder, Order_} from "../../models/Order";

@Injectable({
  providedIn: 'root'
})
/**
 * this holds variables that are set in one component but are necessary for usage in another component
 */
export class ComponentCommunicationService {
  clickedorder: BehaviorSubject<Order_> = new BehaviorSubject<Order_>({...emptyorder});
  truckDeleted: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
  }
}
