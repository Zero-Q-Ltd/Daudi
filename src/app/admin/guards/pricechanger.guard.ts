import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Admin } from "../../models/Admin";
import { DepotsService } from "../services/depots.service";
import { AdminsService } from "../services/admins.service";
import { NotificationService } from "../../shared/services/notification.service";

@Injectable({
  providedIn: "root"
})
export class PricechangerGuard implements CanActivate {
  constructor(private depotserviice: DepotsService, private adminservice: AdminsService, private router: Router, private notification: NotificationService) {

  }

  canActivate(next: ActivatedRouteSnapshot, activated: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    console.log(next, activated);
    return this.adminservice.observableuserdata.pipe(
      map((userdata: Admin) => {
        if (userdata && Number(userdata.config.level) <= 5) {
          return true;
        } else {
          this.router.navigate(["/admin/editprice"]);
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
}
