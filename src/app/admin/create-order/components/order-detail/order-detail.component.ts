import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-order-detail",
  templateUrl: "./order-detail.component.html",
  styleUrls: ["./order-detail.component.scss"]
})
export class OrderDetailComponent implements OnInit {
  @Input
    constructor() { }

  ngOnInit() {
  }

}
