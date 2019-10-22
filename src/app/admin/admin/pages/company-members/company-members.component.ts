import {Component, Inject, OnInit} from "@angular/core";
import * as moment from "moment";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material"; //added dialog data receive

@Component({
  selector: "company-members",
  templateUrl: "./company-members.component.html",
  styleUrls: ["./company-members.component.scss"]
})
export class CompanyMembersComponent implements OnInit {
  members: any = [];
  family: any = [];
  position = "above"; //for tooltip

  constructor(@Inject(MAT_DIALOG_DATA) private companyId: string, private dialog: MatDialog) {
    // console.log(companyId);
    // this.firestore.getCompanyUsers(companyId).subscribe(member=>{
    //   this.members = member;
    //  // console.log(this.members)
    //   //get specific info

    //   for(var i=0; i<this.members.length ; i++){
    //     this.firestore.getSpecificFamily(this.members[i].email).subscribe(family_old=>{
    //      this.family_old.push(family_old)
    //   })

    //   }
    //   console.log("family_old apa")
    // console.log(this.family_old)
    // })
    // this.firebaseService.getbatchhistory(batchId).subscribe(trucks =>{
    //   this.trucks = trucks
    // })

  }

  getimage(image) {
    // console.log(image)
    if (image) {
      return image;
    } else {
      return "/assets/images/EmkayLogoBMP.svg";
    }
  }

  getStatus(status) {
    // console.log(image)
    if (status) {
      return "Approved";
    } else {
      return "Revoked!";
    }
  }

  ngOnInit() {
  }

  creationtime(time) {
    return moment(time).format('MMMM Do YYYY, h:mm a');
  }
}
