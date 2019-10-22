import {Component, OnInit} from "@angular/core";
import {MatSnackBar} from "@angular/material";
import {Router} from "@angular/router";

@Component({
  selector: "emkay-family",
  templateUrl: "./emkay-family.component.html",
  styleUrls: ["./emkay-family.component.scss"]
})
export class EmkayFamilyComponent implements OnInit {

  constructor(private snackBar: MatSnackBar, private router: Router) {
  }

  ngOnInit() {
  }

  logout() {
    // this.authService.logout();
    this.snackBar.open("You are logged out successfully", "Emkay Now ", {duration: 2000});
    this.router.navigate(["/"]);
  }
}
