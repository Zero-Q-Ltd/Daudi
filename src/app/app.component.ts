import {Component, OnInit} from "@angular/core";
import {NavigationEnd, Router} from "@angular/router";
import {APPCONFIG} from "./admin/config";
import {AuthGuard} from "./guards/auth.guard"; //service
// 3rd
import "styles/material2-theme.scss";
import "styles/bootstrap.scss";
// custom
import "styles/layout.scss";
import "styles/theme.scss";
import "styles/ui.scss";
import "styles/app.scss";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]

    // providers: [LayoutService],
})

export class AppComponent implements OnInit {
    public AppConfig: any;

    constructor(private router: Router, public authguard: AuthGuard) {

    }

    ngOnInit() {
        this.AppConfig = APPCONFIG;
        const warningTitleCSS = "color:red; font-size:40px; font-weight: bold; -webkit-text-stroke: 1px black;";
        const warningDescCSS = "font-size: 18px;";
        console.log("%cStop !", warningTitleCSS);
        console.log("%cThis is a browser feature intended for developers. If someone told you to copy and paste something here to enable an Emkay feature or \"hack\" someone's account, it is a scam and may give them access to your account which may end up being banned!!!", warningDescCSS);
        console.log("%cSee https://www.emkaynow.com/terms for more information.", warningDescCSS);
        // Scroll to top on route change
        this.router.events.subscribe((evt) => {
            if (!(evt instanceof NavigationEnd)) {
                return;
            }
            document.body.scrollTop = 0;
        });
    }
}
