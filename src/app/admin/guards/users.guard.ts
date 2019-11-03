import { map, take } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { Admin } from "../../models/admin/Admin";
import { NotificationService } from "../../shared/services/notification.service";
import { AdminService } from "../services/core/admin.service";
import { DepotService } from "../services/core/depot.service"; // get our service

@Injectable()
export class UsersGuard implements CanActivate {
  constructor(private depotserviice: DepotService, private adminservice: AdminService, private router: Router, private notification: NotificationService) {

  }

  canActivate(next: ActivatedRouteSnapshot, activated: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.adminservice.observableuserdata.pipe(
      take(1),
      map((userdata: Admin) => {
        console.log(next, activated);
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
  // checkUrl(url: string, user: Admin_): boolean {
  //   const urlSegments = url.split("/");
  //   switch (urlSegments) {
  //     case:
  //       return this.checkPermission();
  //       break;
  //     default:
  //   }
  // }
  // checkPermission(urlsegment: string, user: Admin_): boolean {

  // }


}
