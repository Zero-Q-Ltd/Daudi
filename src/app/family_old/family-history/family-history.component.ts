import {Component, OnInit} from "@angular/core";
import {EmkayFamily} from "../../models/Global"; //get our interface
import {Router} from "@angular/router";
import {FirestoreService} from "../services/firestore.service"; //get the service
import {MatSnackBar} from "@angular/material";

@Component({
  selector: "family-history",
  templateUrl: "./family-history.component.html",
  styleUrls: ["./family-history.component.scss"]
})
export class FamilyHistoryComponent implements OnInit {
  position = "above";
  allOrders: any[];
  oneFamily: any = {};
  userid: string;
  userEmail: string;
  name: any;
  familyId: string;
  newUser: boolean;
  history: any = [];
  myOrders: any[];
  family: EmkayFamily;
  companyId: string;

  constructor(private router: Router,
              private snackBar: MatSnackBar,
              private firebaseService: FirestoreService
  ) {

    //     authService.afState().subscribe(state=>{
    //       if (state){
    //         console.log("history")
    //         this.userid = this.authService.getUser().uid;
    //         this.userEmail= this.authService.getUser().email;
    //         this.name[0] = this.userEmail.split('@')
    //          this.firebaseService.getSpecificFamily(this.name[0]).subscribe(family_old=>{
    //             this.family_old = family_old;
    //             this.companyId = this.family_old.companyId;
    //         })

    //          //get order history
    //           this.firebaseService.getFamilyHistory(this.companyId).subscribe(history=>{
    //            this.history = history;
    //            console.log(history)
    //          })
    //         }
    //       else {
    //         //  console.log("logged in");
    //         this.snackBar.open('You are Not logged In!', 'Emkay Now ', { duration: 6000, });
    //       }
    //     });
  }

  ngOnInit() {
  }

}
