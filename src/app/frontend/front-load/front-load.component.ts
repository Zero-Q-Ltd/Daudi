import {Component, Inject, OnInit, Optional} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialog, MatSnackBar} from "@angular/material"; //added dialog data receive
import {FrontCompartmentsComponent} from "../front-compartments/front-compartments.component";
import {Depots, Order, Truck} from "../../models/Global"; //get our interface
import {FirestoreService} from "../services/firestore.service"; //service for saving

@Component({
  selector: "front-load",
  templateUrl: "./front-load.component.html",
  styleUrls: ["./front-load.component.scss"]
})
export class FrontLoadComponent implements OnInit {

  order: Order = {}; //cast our order & truck to our interface
  truck: Truck = {};
  trucks: Truck = {};
  dialogProperties: object = {}; //added to sent data via dialog
  depots: Depots; //all depots
  depotId: string;
  selectedDepot: Depots = {};
  depot: Depots;

  public mask = [/^[a-zA-Z]+$/i, /^[a-zA-Z]+$/i, /^[a-zA-Z]+$/i, " ", /\d/, /\d/, /\d/, /^[a-zA-Z]+$/i];

  //@Optional() @Inject(MD_DIALOG_DATA) data: any
  constructor(private dialog: MatDialog, @Optional() @Inject(MAT_DIALOG_DATA) orderProperties: string,
              private snackBar: MatSnackBar, private firestore: FirestoreService) {
    // console.log("this is key ya order");
    // console.log(orderProperties);
    //   this.firestore.getOrder(orderProperties).subscribe(order=>{
    //     this.order = order;
    //     this.trucks = {};
    //     for (var key in this.order.trucks) {
    //           this.firestore.getTruck(key).subscribe(truck=>{
    //             // this.trucks.length=0;
    //             this.trucks[truck.$key]=truck;
    //           // console.log(this.trucks);
    //           });
    //      }
    // });

    // this.order = orderProperties['order'];
    // console.log("order from front load component");
    // console.log(this.order);
  }

  loadCompartments() { //saving driver details

    if (this.truck.driverName.length < 4 || this.truck.driverName == null) {
      this.showSnackbar("Please Enter Valid Driver Name before saving");
    } else if (this.truck.driverId.length < 4 || this.truck.driverId == null) {
      this.showSnackbar("Please Enter Valid Driver ID before saving");
    } else if (this.truck.truckReg == "" || this.truck.truckReg == null) {
      this.showSnackbar("Please Enter Number Plate before saving");
    } else {
      this.truck.driverName = this.truck.driverName.toUpperCase();
      this.truck.truckReg = this.truck.truckReg.toUpperCase();

      this.truck.orderRef = this.order.$key; //asign ref to truck details

      //create truck
      this.truck.stage = 4;
      this.truck.allowSms = this.order.allowSms;
      this.truck.agoQty = this.order.agoQty;
      this.truck.pmsQty = this.order.pmsQty;
      this.truck.ikQty = this.order.ikQty;
      this.truck.orderCompanyPhone = this.order.companyPhone;
      this.truck.orderContactName = this.order.contactName;
      this.truck.orderCreatedTime = this.order.createdTime;
      this.truck.orderCompanyName = this.order.companyName;
      this.truck.proTime = 45;
      this.truck.truckId = this.order.orderId + "-" + (this.order.trucks ? Object.keys(this.order.trucks).length + 1 : 1); //assign id
      this.truck.depotName = this.selectedDepot.name;
    }
    this.dialog.open(FrontCompartmentsComponent, {
      role: "dialog",
      data: (this.compileProperties(this.truck)),
      height: "auto",
      disableClose: true
      //width: '100%%',
    });
  }

  compileProperties(truck) {
    this.dialogProperties["truck"] = truck;
    this.dialogProperties["order"] = this.order;
    // this.dialogProperties["sections"]=this.dialogsections;
    return this.dialogProperties;
  }

  ngOnInit() {
    //get all depots
    // this.firestore.getallDepots().subscribe(depots=>{
    //   this.depots = depots;
    // });
  }

  setDepot(depot) {

    this.depotId = depot;
    this.truck.depot = this.depotId;
    //get specific depot
    // this.firestore.getDepot(this.depotId).subscribe(depot=>{
    //    this.selectedDepot = depot;
    //  });


  }

  showSnackbar(msg) {
    this.snackBar.open(msg, "Emkay Now", {duration: 2000});
  }
}

