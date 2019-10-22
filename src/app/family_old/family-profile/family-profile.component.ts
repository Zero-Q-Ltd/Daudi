import {Component, OnInit} from "@angular/core";
import {Companies, CompanyNames, EmkayFamily} from "../../models/Global"; //get our interface
import {Router} from "@angular/router";
import {FirestoreService} from "../services/firestore.service"; //get the service
import {MatSnackBar} from "@angular/material";
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs";

@Component({
  selector: "family-profile",
  templateUrl: "./family-profile.component.html",
  styleUrls: ["./family-profile.component.scss"]
})

export class FamilyProfileComponent implements OnInit {
  allFamilies: any[];
  oneFamily: any = {};
  userid: string;
  userEmail: string;
  familyId: string;
  newUser: boolean = false;
  loadButton: boolean = true;

  family: EmkayFamily = {};
  newFamily: any = {
    email: "", companyId: ""
  };
  companies: Companies = {};
  tempCompanies = [];
  companyNames: CompanyNames = {};
  optionsArray: any[];
  options = []; //for dropdown list from db
  selectedCompanyArray: any = [];
  isAdmin: boolean = false;
  isMember: boolean = false;
  familyMember: EmkayFamily = {};

  //for KRA mask
  public mask = [/^[a-zA-Z]+$/i, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /^[a-zA-Z]+$/i];
  // autocomplete
  myControl: FormControl = new FormControl();
  filteredOptions: Observable<string[]>;

  constructor(private router: Router,
              private snackBar: MatSnackBar, private firestore: FirestoreService) {


  }

  // end of autocomplete
  // save({ value, valid }: { value: Companies, valid: boolean }) {
  //   //  console.log(valid);
  //   //  console.log(value);

  //   if (!valid) {
  //     this.snackBar.open("Please correct the above errors");
  //   } else {

  //     this.companies.companyName = this.companies.companyName.toUpperCase();
  //     this.companies.contactName = this.companies.contactName.toUpperCase();
  //     this.companies.kraPin = this.companies.kraPin.toUpperCase();
  //     this.companies.adminEmail=this.authService.getUser().email;
  //     this.companies.adminUid = this.authService.getUser().uid;
  //     this.companies.verified = false;
  //     //check if pin is uniq
  //     // this.firestore.getKRAPins().subscribe(pins=>{
  //     //   for(var i =0; i<pins.length; i++){
  //     //     if(this.companies.kraPin == pins[i].pin){
  //     //       this.snackBar.open('Please Enter a valid KRA PIN', 'Emkay Now ', { duration: 4000, });
  //     //       return
  //     //     }
  //     //   }
  //     // })
  //     //save company details first
  //     console.log(this.companies);
  //     //add company to the list of companies and get id
  //     this.companyNames.companyId = this.firestore.addCompany(this.companies);
  //     this.companyNames.companyName = this.companies.companyName;
  //     //add to companyNames node
  //     this.firestore.addCompanyNames(this.companyNames);

  //     this.family_old.createdByEmail = this.authService.getUser().email;
  //     this.family_old.createdByUid = this.authService.getUser().uid;
  //     this.family_old.photoURL = this.authService.getUser().photoURL;
  //     this.family_old.userName = this.authService.getUser().displayName;
  //     this.family_old.companyName = this.companies.companyName.toUpperCase();
  //     this.family_old.companyId = this.companyNames.companyId;
  //     var nameInEmail = this.companies.adminEmail.split('@');
  //     console.log(nameInEmail[0]);
  //     this.family_old.email = nameInEmail[0];

  //     console.log("family_old iko apa");
  //     console.log(this.family_old)
  //     //save family_old details
  //     this.firestore.addEmkayFamily(this.family_old);


  //     this.snackBar.open("Details successfully added!", "EmkayNow", { duration: 3000, });
  //     // this.router.navigate(['/family_old-discount']);
  //   }

  // }

  // update({ value, valid }: { value: EmkayFamily, valid: boolean }) {
  //   //  console.log(valid);
  //   //  console.log(value);
  //   if (!valid) {
  //     this.snackBar.open("Please correct the above errors");
  //   } else {
  //     this.firestore.updateCompanies(this.companies.$key, this.companies);
  //     this.snackBar.open("Details successfully updated!", "EmkayNow", { duration: 3000, });

  //   }
  // }
  // updateProfile(family_old) {
  //   this.firestore.updateCompanies(this.companies.$key, this.companies);
  //   this.snackBar.open("Details successfully updated!", "EmkayNow", { duration: 3000, });

  // }
  ngOnInit() {
  }

  // ngOnInit() {
  //   this.authService.afState().subscribe(state => {
  //     if (state) {
  //       // console.log(this.authService.getUser());
  //       this.userid = this.authService.getUser().uid;
  //       this.userEmail = this.authService.getUser().email; //user email
  //       //run through companies email and see if he/she is the admin
  //       this.firestore.getCompanies().subscribe(Companies => {
  //         this.tempCompanies = Companies;
  //         // console.log(this.tempCompanies)
  //        //loop through this companies and see if theres a match of the adminEmail
  //         for(var i=0; i<this.tempCompanies.length; i++){
  //           if(this.tempCompanies[i].adminEmail == this.userEmail){ //if theres a match assign the admin to the company
  //             this.companies = this.tempCompanies[i];
  //             this.isAdmin = true; //set the system to know admin is true
  //             this.newUser =false;
  //             this.loadButton=false;
  //              //add uuid to the companies node ie uid of logged in admin -- update company
  //           this.companies.adminUid =  this.userid;
  //           this.firestore.updateCompanies(this.companies.$key, this.companies);

  //           }
  //         }
  //         if(this.isAdmin == false){
  //           // console.log("tuko apa si admin");
  //           //look for the users email and get the company Id look on the emkay family_old node
  //           var userName = this.userEmail.split('@');
  //           console.log(userName[0]);
  //           //traverse or go through all emkay family_old members
  //           //list families
  //           this.firestore.getSpecificFamily(userName[0]).subscribe(family_old=>{

  //             // console.log("family_old is here")
  //           console.log(family_old)
  //           if(family_old.email !=null){
  //             this.isMember = true;
  //             this.loadButton=false;
  //             this.newUser=false;


  //             this.firestore.getCompany(family_old.companyId).subscribe(company=>{
  //               this.companies = company;
  //               //update users details on emkay family_old
  //              this.familyMember.uid =  this.authService.getUser().uid;
  //              this.familyMember.email = this.authService.getUser().email; //user email
  //              this.familyMember.photoURL = this.authService.getUser().photoURL;
  //              this.familyMember.userName = this.authService.getUser().displayName;
  //             //  this.familyMember.companyId = this.companies.$key;
  //              this.familyMember.companyName = this.companies.companyName;
  //             this.firestore.updateEmkayFamily(userName[0], this.familyMember);

  //             });

  //             this.snackBar.open('Welcome, your company is already registered you can proceed to make an order!', 'Emkay Now ', { duration: 6000, });
  //             // this.router.navigate(['family_old-discount']);


  //           }else{
  //             this.newUser= true;
  //         this.loadButton = false;
  //           }
  //           });

  //         }

  //         // if(this.isAdmin === false && this.isMember===false){
  //         //   console.log("member is not an admin or a member hence new user");
  //         // }else{
  //         //   console.log("issorait")
  //         // }
  //       })
  //       this.firestore.getCompanyNames().subscribe(CompanyNames => {
  //         this.optionsArray = CompanyNames;
  //         for (var i = 0; i < this.optionsArray.length; i++) {
  //           this.options.push(this.optionsArray[i].companyName);// add company names to array for dropdown
  //         }
  //       })
  //     } else {
  //       //  console.log("logged in");
  //       this.snackBar.open('You are Not logged In!', 'Emkay Now ', { duration: 6000, });
  //     }
  //   });
  //   this.filteredOptions = this.myControl.valueChanges
  //     .pipe(
  //     startWith(''),
  //     map(val => this.filter(val))
  //     );
  // }
  filter(val: string): string[] {
    return this.options.filter(option =>
      option.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

  //add member to emkay family_old
  // addFamily(newFamily) {
  //   this.newFamily.companyId = this.companies.$key;
  //   var nameInEmail = this.newFamily.email.split('@');
  //   console.log(nameInEmail);
  //   console.log(nameInEmail[0]);
  //   this.newFamily.email = nameInEmail[0]
  //   if(nameInEmail[1] !='gmail.com'){
  //     this.snackBar.open('User must have a gmail account!', 'Emkay Now ', { duration: 6000, });
  //   }else{
  //     this.newFamily.approved =true
  //      this.firestore.addEmkayFamily(this.newFamily);
  //      //add family_old to company list of users
  //      this.firestore.addFamilyToCompany(this.newFamily.companyId, this.newFamily );
  //    this.newFamily={};
  //    this.snackBar.open('Member successfully added to your company!', 'Emkay Now ', { duration: 6000, });
  //   // console.log(this.newFamily);
  //   }

  //  }
  // getCompanyDetails(option){
  //   console.log(option);
  //   //search through available company details
  //   for (var i = 0; i < this.optionsArray.length; i++) {
  //     if (option == this.optionsArray[i].companyName) {
  //       this.selectedCompanyArray = this.optionsArray[i];
  //       // console.log("patikana");
  //       // console.log(this.selectedCompanyArray);
  //       //get company details from id
  //       this.firestore.getCompany(this.selectedCompanyArray.companyId).subscribe(specificCompany=>{
  //         this.companies = specificCompany;
  //       });
  //     } else {
  //       //create a new company since no company found
  //     }
  //   }
  // }

}
