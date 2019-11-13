import { Injectable } from "@angular/core";
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { AdminService } from "../core/admin.service";
import { OmcService } from "../omc.service";
import { PricesService } from "../prices.service";

@Injectable()
export class LoginResolver implements Resolve<Observable<string>> {
  initualised;

  constructor(private adminservice: AdminService, private omcservice: OmcService, private prices: PricesService) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<string> | Observable<Observable<string>> | Promise<Observable<string>> {

  }
}
