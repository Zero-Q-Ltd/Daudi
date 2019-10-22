import {Component, OnInit} from "@angular/core";
import {Companies, EmkayFamily} from "../../models/Global"; //get our interface
import {Router} from "@angular/router";
import {FirestoreService} from "../services/firestore.service"; //get the service
import {MatSnackBar} from "@angular/material";

@Component({
  selector: "family-members",
  templateUrl: "./family-members.component.html",
  styleUrls: ["./family-members.component.scss"]
})
export class FamilyMembersComponent implements OnInit {
  userEmail: string;
  company: Companies;
  tempCompanies = [];
  companies: Companies = {};
  isAdmin: boolean = false;
  members = [];

  verified = [
    {value: true, viewValue: "Approved"},
    {value: false, viewValue: "Not Approved"}
  ];

  constructor(private router: Router,
              private snackBar: MatSnackBar, private firestore: FirestoreService) {

  }

  ngOnInit() {
  }

  // ngOnInit() {
  //   this.authService.afState().subscribe(user => {
  //     if (user) {
  //       // console.log(user);
  //       this.userEmail = user.email;
  //       // console.log(this.userEmail)
  //       this.firestore.isLoaded().subscribe(isLoaded=>{
  //         if(isLoaded){
  //           //must be an admin to proceed
  //           this.firestore.getCompanies().subscribe(Companies => {
  //             // console.log(Companies)
  //             this.tempCompanies = Companies;
  //             for(var i=0; i<this.tempCompanies.length; i++){
  //               if(this.tempCompanies[i].adminEmail === this.userEmail){ //if theres a match assign the admin to the company
  //                 this.companies = this.tempCompanies[i];

  //               }
  //             }
  //             // console.log(this.companies)
  //             if(this.companies.adminEmail == null){
  //               this.ShowSnackbar("You are not authorised to access this page", 5000);
  //              this.router.navigate(['/family_old-discount']);
  //             }else{
  //               //get all family_old members and list them here
  //               // this.members = this.companies.users;
  //               this.firestore.getCompanyUsers(this.companies.$key).subscribe(users=>{
  //                for(var i = 0; i<users.length; i++){
  //                  this.firestore.getSpecificFamily(users[i].email).subscribe(familyMember=>{
  //                   this.members.push(familyMember);
  //                  })

  //                }
  //               //  console.log("members here")
  //               //   console.log(this.members);
  //               })

  //             }
  //         });

  //       }
  //     });

  //   }else {

  //       this.ShowSnackbar('You are not logged in!', 6000)
  //     }
  //   });
  // }
  ShowSnackbar(message, time) {
    return this.snackBar.open(message, "Emkay Now", {duration: time});
  }

  getimage(image) {
    // console.log(image)
    if (image) {
      return image;
    } else {
      return "/assets/images/EmkayLogoBMP.svg";
    }
  }

  getStatus(status: boolean) {
    if (status == true) {
      return "Approved";
    } else {
      return "Not Approved";
    }
  }

  access(member: EmkayFamily) {
    //update member
    //  console.log("updated")
    // console.log(member)
    // this.firestore.updateEmkayFamily(member.$key, member)
    this.snackBar.open("Family updated!", "Emkay Now ", {duration: 2000});
    //reset array toavoid duplicates
    //  this.router.navigate(['family_old-members'])
  }
}
