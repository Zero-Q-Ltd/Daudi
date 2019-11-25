import { Injectable } from "@angular/core";
import { AdminService } from "./admin.service";
import { DepotService } from "./depot.service";
import { Depot, emptydepot } from "../../../models/depot/Depot";
import { Admin, emptyadmin } from "../../../models/admin/Admin";
import { AngularFireFunctions } from "@angular/fire/functions";
import { Config } from "protractor";
import { Environment } from "functions/src/models/Daudi/omc/Environments";
import { ConfigService } from "./config.service";
import { OmcService } from "../omc.service";
import { combineLatest } from "rxjs";
import { take } from "rxjs/operators";
import { OMC } from "../../../models/omc/OMC";

@Injectable({
  providedIn: "root"
})
export class InitService {

  constructor(
    private admin: AdminService,
    private depot: DepotService,
    private functions: AngularFireFunctions,
    private config: ConfigService,
    private omc: OmcService
  ) {
    // this.initDepots();

  }

  callableInit() {
    combineLatest([this.omc.currentOmc, this.config.omcconfig, this.config.environment, this.depot.alldepots]).pipe(take(1)).subscribe(val => {
      this.initCompany(val[0], val[1], val[2], val[3]);
    });
  }

  initDepots() {
    const depotnames = ["Oilcom", "Gulf", "Kisumu", "Eldoret", "VTTI", "Konza"];
    depotnames.forEach(name => {
      const tempdepot: Depot = { ...emptydepot, ...{ Name: name, Active: true } };
      this.depot.createDepot(tempdepot);
    });
  }

  initUser(user: firebase.User) {
    const temp: Admin = { ...emptyadmin };
    temp.profile.email = user.email;
    temp.profile.name = user.displayName;
    temp.profile.photoURL = user.photoURL;
    temp.Id = user.uid;
    this.admin.updateadmin(temp);
  }
  initCompany(omc: OMC, config: Config, environment: Environment, depots: Array<Depot>) {
    console.log("initialising company....");
    const data: { omc: OMC, config: Config, environment: Environment, depots: Array<Depot> } = {
      config,
      depots,
      environment,
      omc
    };
    return this.functions.httpsCallable("initCompany")(data).toPromise().then(response => { });
  }

}
