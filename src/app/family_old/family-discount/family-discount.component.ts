import {Component, OnInit} from "@angular/core";
import {Companies, EmkayFamilyHistory, FuelPrices, Order} from "../../models/Global"; //get our interface
// import { FirebaseService } from '../services/firebase.service'; //get the service

@Component({
  selector: "family-discount",
  templateUrl: "./family-discount.component.html",
  styleUrls: ["./family-discount.component.scss"]
})
// export class FamilyDiscountComponent  {}
export class FamilyDiscountComponent implements OnInit {

  position = "left";
  position2 = "right";

  userEmail: string;
  userId: string;
  family: any[];
  familyId: string;
  oneFamily: Companies = {};
  history: EmkayFamilyHistory = {};

  orderCondition = false;
  key: string;
  order: Order = {
    companyName: "", contactName: "", companyPhone: 7, companyEmail: "", allowSms: true,
    pmsAmntloaded: 0, ikAmntloaded: 0, agoAmntloaded: 0, enteredByUser: "", enteredById: "",
    pmsQty: 0, agoQty: 0, ikQty: 0,
    pmsRp: 0, agoRp: 0, ikRp: 0,
    pmsTotal: 0, agoTotal: 0, ikTotal: 0, discountRequest: {},
    createdTime: 0,
    grandTotal: 0, stage: 0, family: true
  };
  fuelPrices: FuelPrices = {};
  id: string;
  isSales: boolean = false;
  dialogProperties: object = {}; //added to sent data via dialog
  allowSms: boolean = true;
  loggedIn: boolean;

//   constructor(private dialog: MatDialog,
//     // private orderService: FirebaseService,
//     private router: Router,
//     private snackBar: MatSnackBar, private authService: AuthService, ) {


//     authService.afState().subscribe(user => {
//        console.log(user)
//       this.userEmail = user.email;
//       this.userId = user.uid;
//       // console.log(this.userid);
//       if (user) {

//         this.orderService.isLoaded().subscribe(isLoaded => {
//           // console.log("bool "+isLoaded);
//           if (isLoaded) {
//             this.orderService.getPrices().subscribe(Prices => {
//               this.fuelPrices = Prices;
//               //console.log("fuels "+this.fuelPrices.pmsAvg);
//               this.order.pmsSp = this.order.pmsRp = this.fuelPrices.pmsPrice;
//               this.order.agoSp = this.order.agoRp = this.fuelPrices.agoPrice;
//               this.order.ikSp = this.order.ikRp = this.fuelPrices.ikPrice;
//             });
//             var userName = this.userEmail.split('@');

//             this.orderService.getSpecificFamily(userName[0]).subscribe(family_old => {
//               if (family_old.companyId != null) {
//                   this.orderService.getCompany(family_old.companyId).subscribe(company=>{
//                     // console.log(company)
//                     this.oneFamily = company
//                   })

//                 // console.log(this.oneFamily)
//               } else {
//                 this.router.navigate(['/family_old-profile']);
//                this.snackBar.open('We need some company details before you can place an order!', 'Emkay Now ', { duration: 2000, });
//               }

//             });
//             // console.log("Id outside the function loop "+this.familyId);
//           } else {
//             //  console.log("Not loaded");
//           }
//         });
//       }
//     });


//   }
  setSmsStatus(order) {
    if (order.allowSms = true) {
      order.allowSms = false;
    } else {
      order.allowSms = true;
    }
    //update order
    return this.allowSms = order.allowSms;
  }

//   compileProperties(order) {
//     this.dialogProperties["order"] = this.order;
//     // this.dialogProperties["sections"]=this.dialogsections;
//     return this.dialogProperties;
//   }

  ngOnInit() {


  }

  pmsTotal() {
    this.order.pmsTotal = (this.order.pmsQty * this.order.pmsSp);
    this.grandTotal();
  }

  agoTotal() {
    this.order.agoTotal = (this.order.agoQty * this.order.agoSp);
    this.grandTotal();
  }

  ikTotal() {
    this.order.ikTotal = (this.order.ikQty * this.order.ikSp);
    this.grandTotal();
  }

  grandTotal() {
    this.order.grandTotal = (this.order.agoTotal + this.order.pmsTotal + this.order.ikTotal);
  }

  openLoadingDialogWithDiscount({value, valid}: { value: Order, valid: boolean }) {
  }

//   openLoadingDialogWithDiscount({ value, valid }: { value: Order, valid: boolean }) {
//     // console.log("clicked");
//     if (!valid) {
//       this.snackBar.open('Please correct the above Errors', 'Emkay Now ', { duration: 2000, });
//     } else if ((this.order.pmsQty < 100 && this.order.pmsQty > 0) || (this.order.agoQty < 100 && this.order.agoQty > 0) || (this.order.ikQty < 100 && this.order.ikQty > 0)) {
//       this.snackBar.open('Quantity cannot be less than 100L', 'Emkay Now ', { duration: 2000, });
//     } else if (this.order.pmsQty == 0 && this.order.agoQty == 0 && this.order.ikQty == 0) {
//       this.snackBar.open('At least one product must be filled!', 'Emkay Now ', { duration: 2000, });
//     } else {
//       this.order.enteredByUser = this.authService.getUser().displayName;
//       this.order.enteredById = this.authService.getUser().uid;
//       this.order.companyName = this.oneFamily.companyName.toUpperCase(); //force to uppercase
//       this.order.contactName = this.oneFamily.contactName.toUpperCase();
//       this.order.companyEmail = this.oneFamily.companyEmail;
//       this.order.companyPhone = this.oneFamily.companyPhone;

//       this.order.discountRequest = {
//         pms: this.order.pmsSp,
//         ago: this.order.agoSp,
//         ik: this.order.ikSp
//       }
//       var key = this.orderService.newOrder(this.order);
//       // console.log("value after saving order");
//       // console.log(key);
//       this.snackBar.open('Order Successfully placed', 'Emkay Now ', { duration: 2000, });

//       this.dialog.open(FrontLoadComponent, {
//         role: 'dialog',
//         // data: (this.compileProperties(this.order)),
//         data: (key),
//         height: 'auto',
//         disableClose: true
//         //width: '100%%',
//       });
//       //add order details to emkayFamily History
//        //assign order key tobe uniq key in history
//        this.history.stage = 1;
//        this.history.companyId=this.oneFamily.$key;
//        this.history.pmsQty = this.order.pmsQty;
//        this.history.agoQty = this.order.agoQty;
//        this.history.ikQty = this.order.ikQty;
//        this.history.totalAmount=(this.order.agoTotal+this.order.ikTotal+this.order.pmsTotal);
//        this.history.createdByUid = this.userId;
//        this.history.createdByUser=this.order.companyName.toUpperCase();

//        this.orderService.addEmkayFamilyHistory(this.history, this.key);
//     }
//     this.order = {};
//   }
  saveOrderWithDiscount({value, valid}: { value: Order, valid: boolean }) {
  }

//   saveOrderWithDiscount({ value, valid }: { value: Order, valid: boolean }) {
//     if (!valid) {
//       this.snackBar.open('Please correct the above Errors', 'Emkay Now ', { duration: 2000, });
//     } else if ((this.order.pmsQty < 100 && this.order.pmsQty > 0) || (this.order.agoQty < 100 && this.order.agoQty > 0) || (this.order.ikQty < 100 && this.order.ikQty > 0)) {
//       this.snackBar.open('Quantity cannot be less than 100L', 'Emkay Now ', { duration: 2000, });
//     } else if (this.order.pmsQty == 0 && this.order.agoQty == 0 && this.order.ikQty == 0) {
//       this.snackBar.open('At least one product must be filled!', 'Emkay Now ', { duration: 2000, });
//     } else {
//       this.order.enteredByUser = this.authService.getUser().displayName;
//       this.order.enteredById = this.authService.getUser().uid;
//       this.order.companyName = this.oneFamily.companyName.toUpperCase(); //force to uppercase
//       this.order.contactName = this.oneFamily.contactName.toUpperCase();
//       this.order.companyEmail = this.oneFamily.companyEmail;
//       this.order.companyPhone = this.oneFamily.companyPhone;
//       this.order.discountRequest = {
//         pms: this.order.pmsSp,
//         ago: this.order.agoSp,
//         ik: this.order.ikSp
//       }
//       //save to db with discount req
//      console.log(this.order)
//       this.key = this.orderService.newOrder(this.order);
//       console.log(this.key);
//       console.log(this.oneFamily);
//        //add order details to emkayFamily History
//        //assign order key tobe uniq key in history
//       this.history.stage = 1;
//       this.history.companyId=this.oneFamily.$key;
//       this.history.pmsQty = this.order.pmsQty;
//       this.history.agoQty = this.order.agoQty;
//       this.history.ikQty = this.order.ikQty;
//       this.history.totalAmount=(this.order.agoTotal+this.order.ikTotal+this.order.pmsTotal);
//       this.history.createdByUid = this.userId;
//       this.history.createdByUser=this.userEmail;
//       console.log(this.history);
//       this.orderService.addEmkayFamilyHistory(this.history, this.key);
//       //console.log(this.order);

//       this.snackBar.open('Order Successfully placed', 'Emkay Now ', { duration: 10000, });

//     }
//     //reset to null empty values
//     //stay in current page
//     this.order = {}


//   }

}
