import {Component, OnInit} from "@angular/core";
// import { OrderDetailsComponent } from './../pages/order-details/order-details.component';
import {Batch, Order, Truck} from "../../models/Global"; //get our interface

@Component({
  selector: "front-compartments",
  templateUrl: "./front-compartments.component.html",
  styleUrls: ["./front-compartments.component.scss"]
})
export class FrontCompartmentsComponent implements OnInit {
  position = "left";

  position2 = "above";
  pms_c1: number = 0;
  pms_c2: number = 0;
  pms_c3: number = 0;
  pms_c4: number = 0;
  pms_c5: number = 0;
  pms_c6: number = 0;
  pms_c7: number = 0;

  ago_c1: number = 0;
  ago_c2: number = 0;
  ago_c3: number = 0;
  ago_c4: number = 0;
  ago_c5: number = 0;
  ago_c6: number = 0;
  ago_c7: number = 0;

  ik_c1: number = 0;
  ik_c2: number = 0;
  ik_c3: number = 0;
  ik_c4: number = 0;
  ik_c5: number = 0;
  ik_c6: number = 0;
  ik_c7: number = 0;


  order: Order = {}; //cast our order to our interface
  truck: Truck = {};
  canDismiss: boolean = false;

  pmsBatch: Batch = {};
  agoBatch: Batch = {};
  ikBatch: Batch = {};


  batch: any;

  constructor() {

  }

  //added to constructor to inject the data
  // constructor(@Inject(MAT_DIALOG_DATA) private truckProperties: object, private firestore: FirestoreService,
  //   private snackBar: MatSnackBar, private dialogRef) {

  //   this.truck = truckProperties['truck'];
  //   this.order = truckProperties['order']; //from order-details components in dialog
  //   //  console.log("this truck is from compartment components");
  //   // console.log( truckProperties['truck']);
  //   // console.log("this order is from compartment components");
  //   // console.log( truckProperties['order']);
  //   if (!this.order.trucks)
  //     {
  //       this.order.trucks={};
  //     }
  //   // this.firebaseService.getPmsBatch().subscribe(batch=>{
  //   //   this.pmsBatch = batch;
  //   // });
  //   // console.log(this.pmsBatch);


  // }


  ngOnInit() {

  }

  pmsQty() {
    return this.pms_c1 + this.pms_c2 + this.pms_c3 + this.pms_c4 + this.pms_c5 + this.pms_c6 + this.pms_c7;
  }

  agoQty() {
    return this.ago_c1 + this.ago_c2 + this.ago_c3 + this.ago_c4 + this.ago_c5 + this.ago_c6 + this.ago_c7;
  }

  ikQty() {
    return this.ik_c1 + this.ik_c2 + this.ik_c3 + this.ik_c4 + this.ik_c5 + this.ik_c6 + this.ik_c7;
  }

  //TODO: copy paste for ago n ik
  iscompartmentFree(fueltype, compartment): boolean {
    // console.log(fueltype, compartment);
    switch (compartment) {
      case 1:
        switch (fueltype) {
          case "pms":
            if (this.ago_c1 > 0 || this.ik_c1 > 0) {
              return false;
            } else {
              return true;
            }
          case "ago":
            if (this.pms_c1 > 0 || this.ik_c1 > 0) {
              return false;
            } else {
              return true;
            }
          case "ik":
            if (this.ago_c1 > 0 || this.pms_c1 > 0) {
              return false;
            } else {
              return true;
            }
        }

      case 2:
        switch (fueltype) {
          case "pms":
            if (this.ago_c2 > 0 || this.ik_c2 > 0) {
              return false;
            } else {
              return true;
            }
          case "ago":
            if (this.pms_c2 > 0 || this.ik_c2 > 0) {
              return false;
            } else {
              return true;
            }
          case "ik":
            if (this.ago_c2 > 0 || this.pms_c2 > 0) {
              return false;
            } else {
              return true;
            }
        }

      case 3:
        switch (fueltype) {
          case "pms":
            if (this.ago_c3 > 0 || this.ik_c3 > 0) {
              return false;
            } else {
              return true;
            }
          case "ago":
            if (this.pms_c3 > 0 || this.ik_c3 > 0) {
              return false;
            } else {
              return true;
            }
          case "ik":
            if (this.ago_c3 > 0 || this.pms_c3 > 0) {
              return false;
            } else {
              return true;
            }
        }

      case 4:
        switch (fueltype) {
          case "pms":
            if (this.ago_c4 > 0 || this.ik_c4 > 0) {
              return false;
            } else {
              return true;
            }
          case "ago":
            if (this.pms_c4 > 0 || this.ik_c4 > 0) {
              return false;
            } else {
              return true;
            }
          case "ik":
            if (this.ago_c4 > 0 || this.pms_c4 > 0) {
              return false;
            } else {
              return true;
            }
        }

      case 5:
        switch (fueltype) {
          case "pms":
            if (this.ago_c5 > 0 || this.ik_c5 > 0) {
              return false;
            } else {
              return true;
            }
          case "ago":
            if (this.pms_c5 > 0 || this.ik_c5 > 0) {
              return false;
            } else {
              return true;
            }
          case "ik":
            if (this.ago_c5 > 0 || this.pms_c5 > 0) {
              return false;
            } else {
              return true;
            }
        }

      case 6:
        switch (fueltype) {
          case "pms":
            if (this.ago_c6 > 0 || this.ik_c6 > 0) {
              return false;
            } else {
              return true;
            }
          case "ago":
            if (this.pms_c6 > 0 || this.ik_c6 > 0) {
              return false;
            } else {
              return true;
            }
          case "ik":
            if (this.ago_c6 > 0 || this.pms_c6 > 0) {
              return false;
            } else {
              return true;
            }
        }
      case 7:
        switch (fueltype) {
          case "pms":
            if (this.ago_c7 > 0 || this.ik_c7 > 0) {
              return false;
            } else {
              return true;
            }
          case "ago":
            if (this.pms_c7 > 0 || this.ik_c7 > 0) {
              return false;
            } else {
              return true;
            }
          case "ik":
            if (this.ago_c7 > 0 || this.pms_c7 > 0) {
              return false;
            } else {
              return true;
            }
        }
      default:
        return false;
    }
  }


  saveCompartments(truck) {
    // console.log(" clicked save compartments");
    if (this.pms_c1 > 0) {
      this.truck.c1 = "pms=" + this.pms_c1;
    } else if (this.ago_c1 > 0) {
      this.truck.c1 = "ago=" + this.ago_c1;
    } else if (this.ik_c1 > 0) {
      this.truck.c1 = "ik=" + this.ik_c1;
    }

    if (this.pms_c2 > 0) {
      this.truck.c2 = "pms=" + this.pms_c2;
    } else if (this.ago_c2 > 0) {
      this.truck.c2 = "ago=" + this.ago_c2;
    } else if (this.ik_c2 > 0) {
      this.truck.c2 = "ik=" + this.ik_c2;
    }

    if (this.pms_c3 > 0) {
      this.truck.c3 = "pms=" + this.pms_c3;
    } else if (this.ik_c3 > 0) {
      this.truck.c3 = "ik=" + this.ik_c3;
    } else if (this.ago_c3 > 0) {
      this.truck.c3 = "ago=" + this.ago_c3;
    }

    if (this.pms_c4 > 0) {
      this.truck.c4 = "pms=" + this.pms_c4;
    } else if (this.ik_c4 > 0) {
      this.truck.c4 = "ik=" + this.ik_c4;
    } else if (this.ago_c4 > 0) {
      this.truck.c4 = "ago=" + this.ago_c4;
    }

    if (this.pms_c5 > 0) {
      this.truck.c5 = "pms=" + this.pms_c5;
    } else if (this.ik_c5 > 0) {
      this.truck.c5 = "ik=" + this.ik_c5;
    } else if (this.ago_c5 > 0) {
      this.truck.c5 = "ago=" + this.ago_c1;
    }

    if (this.pms_c6 > 0) {
      this.truck.c6 = "pms=" + this.pms_c6;
    } else if (this.ik_c6 > 0) {
      this.truck.c6 = "ik=" + this.ik_c6;
    } else if (this.ago_c6 > 0) {
      this.truck.c6 = "ago=" + this.ago_c6;
    }

    if (this.pms_c7 > 0) {
      this.truck.c7 = "pms=" + this.pms_c7;
    } else if (this.ik_c7 > 0) {
      this.truck.c7 = "ik=" + this.ik_c7;
    } else if (this.ago_c7 > 0) {
      this.truck.c7 = "ago=" + this.ago_c7;
    }
    //  console.log(this.order);

    this.truck.agoQty = 0;
    this.truck.pmsQty = 0;
    this.truck.ikQty = 0;
    // console.log(this.truck);
    this.truck.pmsQty = this.pmsQty();
    this.truck.agoQty = this.agoQty();
    this.truck.ikQty = this.ikQty();

    //create truck and get id
    // var Ref = this.firestore.newTruck(this.truck);
    //console.log(Ref);
    // this.firebaseService.addTruckToOrder(this.order.$key, Ref); //fxn to add truck id to order

    // this.snackBar.open('Truck Successfully loaded', 'Emkay Now ', { duration: 2000, });
    //aparently these values reset themselves after saving took me 3hrs to figure it out dont know why.. so
    //ps dont remove
    this.truck.pmsQty = this.pmsQty();
    this.truck.agoQty = this.agoQty();
    this.truck.ikQty = this.ikQty();

    this.order.agoAmntloaded += this.truck.agoQty;
    this.order.ikAmntloaded += this.truck.ikQty;
    this.order.pmsAmntloaded += this.truck.pmsQty;

    //console.log(this.order);
    //update order stage kwa db
    // first add the new truck to the order
    // this.order.trucks[Ref]='4';
    // this.firestore.updateOrder(this.order.$key, this.order);

    // this.snackBar.open('Order Successfully updated', 'Emkay Now ', { duration: 2000, });

    // this.dialogRef.close();
    this.order = {};
  }

}
