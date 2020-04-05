import {Component, OnInit} from "@angular/core";
import {APPCONFIG} from "../../config";

@Component({
  selector: "my-app-footer",
  styles: [],
  templateUrl: "./footer.component.html"
})

export class AppFooterComponent implements OnInit {
  public AppConfig: any;

  ngOnInit() {
    this.AppConfig = APPCONFIG;
  }
}
