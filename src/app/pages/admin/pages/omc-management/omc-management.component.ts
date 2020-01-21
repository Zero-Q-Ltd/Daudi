import {Component, OnInit} from "@angular/core";
import {OmcService} from "../../../services/core/omc.service";

@Component({
    selector: "app-omc-management",
    templateUrl: "./omc-management.component.html",
    styleUrls: ["./omc-management.component.scss"]
})
export class OmcManagementComponent implements OnInit {

    constructor(private omcservice: OmcService) {
    }

    ngOnInit() {
    }

}
