import {Component, OnInit} from "@angular/core";
import {FirestoreService} from "../services/firestore.service"; //get the service
import {MatDialog, MatSnackBar} from "@angular/material";
import {Companies, CompanyNames, FuelPrices, KraPins, Order} from "../../models/Global"; //get our interface
import {ActivatedRoute, Router} from "@angular/router";

import {FormControl} from "@angular/forms";
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {

  position = "left";
  position2 = "right";

  orderCondition = false;
  order: Order = {
    companyName: "", contactName: "", companyPhone: 7, companyEmail: "", allowSms: true,
    pmsAmntloaded: 0, ikAmntloaded: 0, agoAmntloaded: 0, enteredByUser: "", enteredById: "",
    pmsQty: 0, agoQty: 0, ikQty: 0,
    pmsRp: 0, agoRp: 0, ikRp: 0,
    pmsTotal: 0, agoTotal: 0, ikTotal: 0, discountRequest: {},
    createdTime: 0,
    grandTotal: 0, stage: 0
  };

  fuelPrices: FuelPrices = {};
  id: string;
  isSales: boolean = false;
  dialogProperties: object = {}; //added to sent data via dialog
  allowSms: boolean;
  loggedIn: boolean;

  companies: Companies = {};
  companyNames: CompanyNames = {};
  optionsArray: any[];
  options = []; //for dropdown list from db
  selectedCompanyArray: any = []; // for selected in order to pull company details
  company: any = [];
  isNewcompany: boolean = true;
  kraPin: KraPins = {};
  // autocomplete
  myControl: FormControl = new FormControl();
  filteredOptions: Observable<string[]>;

  constructor(private dialog: MatDialog, private firestore: FirestoreService, private snackBar: MatSnackBar,
              private router: Router, private route: ActivatedRoute) {
    //this.authService.loginAnonymously();
    this.id = this.route.snapshot.params["sales"];
    //this.route.params['sales']
    if (!this.id) {
      this.loggedIn = true;
    } else {
      this.loggedIn = false;
    }

    // this.firestore.getPrices().subscribe(Prices => {
    //   this.fuelPrices = Prices;
    //   //console.log("fuels "+this.fuelPrices.pmsAvg);
    //   this.order.pmsSp = this.order.pmsRp = this.fuelPrices.pmsPrice;
    //   this.order.agoSp = this.order.agoRp = this.fuelPrices.agoPrice;
    //   this.order.ikSp = this.order.ikRp = this.fuelPrices.ikPrice;
    // });

  }

  // end of autocomplete

  setSmsStatus(order) {
    if (order.allowSms = true) {
      order.allowSms = false;
    } else {
      order.allowSms = true;
    }
    //update order
    return this.allowSms = order.allowSms;
  }

  openLoadingDialog({value, valid}: { value: Order, valid: boolean }) {
    // console.log("clicked");
    if (!valid) {
      this.snackBar.open("Please correct the above Errors", "Emkay Now ", {duration: 2000});
    } else if ((this.order.pmsQty < 100 && this.order.pmsQty > 0) || (this.order.agoQty < 100 && this.order.agoQty > 0) || (this.order.ikQty < 100 && this.order.ikQty > 0)) {
      this.snackBar.open("Quantity cannot be less than 100L", "Emkay Now ", {duration: 2000});
    } else if (this.order.pmsQty == 0 && this.order.agoQty == 0 && this.order.ikQty == 0) {
      this.snackBar.open("At least one product must be filled!", "Emkay Now ", {duration: 2000});
    } else {
      this.order.companyName = this.order.companyName.toUpperCase(); //force to uppercase
      this.order.contactName = this.order.contactName.toUpperCase();//force to uppercase
      this.order.enteredByUser = this.order.companyName.toUpperCase(); //get who entered the value

      // var key = this.firestore.newOrder(this.order);
      // console.log("value after saving order");
      // console.log(key);
      this.snackBar.open("Order Successfully placed", "Emkay Now ", {duration: 2000});

      // this.dialog.open(FrontLoadComponent, {
      //   role: 'dialog',
      //   // data: (this.compileProperties(this.order)),
      //   data: (key),
      //   height: 'auto',
      //   disableClose: true
      //   //width: '100%%',
      // });
    }
    this.order = {};
  }

  openLoadingDialogWithDiscount({value, valid}: { value: Order, valid: boolean }) {
    // console.log("clicked");
    if (!valid) {
      this.snackBar.open("Please correct the above Errors", "Emkay Now ", {duration: 2000});
    } else if ((this.order.pmsQty < 100 && this.order.pmsQty > 0) || (this.order.agoQty < 100 && this.order.agoQty > 0) || (this.order.ikQty < 100 && this.order.ikQty > 0)) {
      this.snackBar.open("Quantity cannot be less than 100L", "Emkay Now ", {duration: 2000});
    } else if (this.order.pmsQty == 0 && this.order.agoQty == 0 && this.order.ikQty == 0) {
      this.snackBar.open("At least one product must be filled!", "Emkay Now ", {duration: 2000});
    } else {
      console.log("company status");
      console.log(this.isNewcompany);
      if (this.isNewcompany) {
        //add company to company node and company names
        this.companies.companyName = this.company.companyName.toUpperCase();
        this.companies.contactName = this.company.contactName.toUpperCase();
        this.companies.companyPhone = this.company.companyPhone;
        this.companies.companyEmail = this.company.companyEmail;
        this.companies.kraPin = this.company.kraPin.toUpperCase();
        this.companies.adminEmail = this.company.companyEmail;
        //save company details first
        // console.log(this.companies);
        //add company to the list of companies and get id
        // this.companyNames.companyId = this.firestore.addCompany(this.companies);


        this.companyNames.companyName = this.companies.companyName;
        //add to companyNames node
        // this.firestore.addCompanyNames(this.companyNames);


        //add to krapins
        this.kraPin.companyId = this.companyNames.companyId;
        this.kraPin.pin = this.companies.kraPin;
        // this.firestore.addKraPin(this.kraPin);


      }
      this.order.companyName = this.company.companyName;
      this.order.companyEmail = this.company.companyEmail;
      this.order.companyPhone = this.company.companyPhone;
      this.order.contactName = this.company.contactName;

      // this.order.enteredByUser = this.authService.getUser().displayName;
      // this.order.enteredById = this.authService.getUser().uid;
      this.order.companyName = this.order.companyName.toUpperCase(); //force to uppercase
      this.order.contactName = this.order.contactName.toUpperCase();//force to uppercase


      this.order.discountRequest = {
        pms: this.order.pmsSp,
        ago: this.order.agoSp,
        ik: this.order.ikSp
      };
      //save to db with discount req

      //console.log(this.order);
      // var key = this.firestore.newOrder(this.order);


      // console.log("value after saving order");
      // console.log(key);
      this.snackBar.open("Order Successfully placed", "Emkay Now ", {duration: 2000});

      // this.dialog.open(FrontLoadComponent, {
      //   role: 'dialog',
      //   // data: (this.compileProperties(this.order)),
      //   data: (key),
      //   height: 'auto',
      //   disableClose: true
      //   //width: '100%%',
      // });
    }
    this.order = {};
  }

  // openEmkayFamily(){
  //   this.dialog.open(EmkayFamilyComponent,{
  //     role: 'dialog',
  //     // data: (this.compileProperties(this.order)),
  //     // data: (key),
  //     height: 'auto',
  //     disableClose: true
  //     //width: '100%%',
  //   });
  // }
  compileProperties(order) {
    this.dialogProperties["order"] = this.order;
    // this.dialogProperties["sections"]=this.dialogsections;
    return this.dialogProperties;
  }

  ngOnInit() {
    this.id = this.route.snapshot.params["sales"];

    if (this.id == "sales") {
      this.isSales = true; // set this to allow user to enter discounted prices
      // console.log(this.isSales);
    } else {
      //not a valid url --- DO SOMETHING
      this.router.navigate(["/"]);
    }
    // this.firestore.getCompanyNames().subscribe(CompanyNames => {
    //   this.optionsArray = CompanyNames;
    //   for (var i = 0; i < this.optionsArray.length; i++) {
    //     this.options.push(this.optionsArray[i].companyName);// add company names to array for dropdown
    //   }
    // });
    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(""),
        map(val => this.filter(val))
      );

  }

  //autocomplete
  filter(val: string): string[] {
    return this.options.filter(option =>
      option.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

  getCompanyDetails(option) {
    console.log(option);
    //search through available company details
    for (var i = 0; i < this.optionsArray.length; i++) {
      if (option == this.optionsArray[i].companyName) {
        this.isNewcompany = false;
        this.selectedCompanyArray = this.optionsArray[i];
        //get company details from id
        // this.firestore.getCompany(this.selectedCompanyArray.companyId).subscribe(specificCompany=>{
        //   this.company = specificCompany;
        //   // this.order = specificCompany;
        // });
      }
    }
  }

  // end of autocomplete
  loginWithGoogle() {
    // this.authService.loginGoogle();
    // this.authService.afState().subscribe(state => {
    //   if (state) {
    //     this.loggedIn = true;
    //     this.router.navigate(['/family-profile']);
    //   }
    // });
  }

  loginWithGoogleDiscount() {
    // this.authService.loginGoogle();
    // this.authService.afState().subscribe(state => {
    //   if (state) {
    //     this.loggedIn = true;
    //     //allow making an order with discount

    //   }
    // });
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

  saveOrder({value, valid}: { value: Order, valid: boolean }) {

    if (this.order.companyName == "" || this.order.contactName == "" || this.order.companyPhone == 0 || this.order.companyEmail == "") {
      this.snackBar.open("Please correct the above Errors", "Emkay Now ", {duration: 2000});
    } else if ((this.order.pmsQty < 100 && this.order.pmsQty > 0) || (this.order.agoQty < 100 && this.order.agoQty > 0) || (this.order.ikQty < 100 && this.order.ikQty > 0)) {
      this.snackBar.open("Quantity cannot be less than 100L", "Emkay Now ", {duration: 2000});
    } else if (this.order.pmsQty == 0 && this.order.agoQty == 0 && this.order.ikQty == 0) {
      this.snackBar.open("At least one product must be filled!", "Emkay Now ", {duration: 2000});
    } else {
      this.order.enteredByUser = this.order.companyName.toUpperCase();
      this.order.companyName = this.order.companyName.toUpperCase(); //force to uppercase
      this.order.contactName = this.order.contactName.toUpperCase();//force to uppercase

      // this.firestore.newOrder(this.order);


      //console.log(value);
      this.snackBar.open("Order Successfully placed", "Emkay Now ", {duration: 2000});
      //reset to null empty values
      //navigate to home
      this.order = {};
      this.router.navigate(["/home"]);

    }


  }

  saveOrderWithDiscount({value, valid}: { value: Order, valid: boolean }) {
    if (!valid) {
      this.snackBar.open("Please correct the above Errors", "Emkay Now ", {duration: 2000});
    } else if ((this.order.pmsQty < 100 && this.order.pmsQty > 0) || (this.order.agoQty < 100 && this.order.agoQty > 0) || (this.order.ikQty < 100 && this.order.ikQty > 0)) {
      this.snackBar.open("Quantity cannot be less than 100L", "Emkay Now ", {duration: 2000});
    } else if (this.order.pmsQty == 0 && this.order.agoQty == 0 && this.order.ikQty == 0) {
      this.snackBar.open("At least one product must be filled!", "Emkay Now ", {duration: 2000});
    } else {
      console.log("company status");
      console.log(this.isNewcompany);
      if (this.isNewcompany) {
        //add company to company node and company names
        this.companies.companyName = this.company.companyName.toUpperCase();
        this.companies.contactName = this.company.contactName.toUpperCase();
        this.companies.companyPhone = this.company.companyPhone;
        this.companies.companyEmail = this.company.companyEmail;
        this.companies.kraPin = this.company.kraPin.toUpperCase();
        this.companies.adminEmail = this.company.companyEmail;
        //save company details first
        // console.log(this.companies);
        //add company to the list of companies and get id
        // this.companyNames.companyId = this.firestore.addCompany(this.companies);


        this.companyNames.companyName = this.companies.companyName;
        //add to companyNames node
        // this.firestore.addCompanyNames(this.companyNames);


        //add to krapins
        this.kraPin.companyId = this.companyNames.companyId;
        this.kraPin.pin = this.companies.kraPin;
        // this.firestore.addKraPin(this.kraPin);


      }
      this.order.companyName = this.company.companyName;
      this.order.companyEmail = this.company.companyEmail;
      this.order.companyPhone = this.company.companyPhone;
      this.order.contactName = this.company.contactName;

      // this.order.enteredByUser = this.authService.getUser().displayName;
      // this.order.enteredById = this.authService.getUser().uid;
      this.order.companyName = this.order.companyName.toUpperCase(); //force to uppercase
      this.order.contactName = this.order.contactName.toUpperCase();//force to uppercase


      this.order.discountRequest = {
        pms: this.order.pmsSp,
        ago: this.order.agoSp,
        ik: this.order.ikSp
      };
      //save to db with discount req
      // this.firestore.newOrder(this.order);


      //console.log(this.order);

      this.snackBar.open("Order Successfully placed", "Emkay Now ", {duration: 10000});

    }
    //reset to null empty values
    //stay in current page
    this.order = {};
    this.router.navigate(["/home/sales"]);

  }
}
