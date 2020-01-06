import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { combineLatest, Observable } from "rxjs";
import { Admin } from "../../models/Daudi/admin/Admin";
import { NotificationService } from "../../shared/services/notification.service";
import { AdminService } from "../services/core/admin.service";
import { RouteData } from "../../models/Daudi/navigation/RouteData";
import { map } from "rxjs/operators";
import { CoreService } from "../services/core/core.service";

@Injectable()
export class UsersGuard implements CanActivate {
  constructor(
    private adminservice: AdminService,
    private router: Router,
    private core: CoreService,
    private notification: NotificationService) {

  }
  boolean;
  canActivate(next: ActivatedRouteSnapshot, activated: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return combineLatest([
      this.adminservice.observableuserdata,
      this.core.adminConfig
    ])
      .pipe(map(s => {
        console.log(next, activated);

        const data: RouteData = next.data as RouteData;
        if (data.configurable) {
          return this.checkPermission(next.routeConfig.path, s[0], s[0]);
        } else {
          return true;
        }
      }));
    return this.adminservice.observableuserdata.pipe(
      map((userdata: Admin) => {
        if (userdata) {
          return true;
        } else {
          this.router.navigate(["/admin/login"]);
          this.notification.notify({
            body: "You are not authenticated to view this page",
            duration: 3000,
            alert_type: "warning",
            title: "Warning"
          });
          return false;
        }
      }));
  }
  // checkUrl(url: string, user: Admin): boolean {
  //   const urlSegments = url.split("/");
  //   switch (urlSegments) {
  //     case:
  //       return this.checkPermission();
  //       break;
  //     default:
  //   }
  // }

  checkPermission(urlsegment: string, user: Admin, permissions) {
    return true;
  }


}
