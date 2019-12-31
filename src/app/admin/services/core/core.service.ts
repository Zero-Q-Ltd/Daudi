import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AdminService } from "./admin.service";
import { BehaviorSubject } from "rxjs";
import { Config, emptyConfig, QboEnvironment } from "../../../models/Daudi/omc/Config";
import { Admin } from "../../../models/Daudi/admin/Admin";
import { Environment } from "../../../models/Daudi/omc/Environments";
import { Depot, emptydepot } from "../../../models/Daudi/depot/Depot";
import { distinctUntilChanged } from "rxjs/operators";
import { DepotConfig, emptyDepotConfig } from "../../../models/Daudi/depot/DepotConfig";
import { ConfigService } from "./config.service";
import { DepotService } from "./depot.service";

@Injectable({
  providedIn: "root"
})
export class CoreService {
  omcconfig: BehaviorSubject<Config> = new BehaviorSubject<Config>({ ...emptyConfig });
  environment: BehaviorSubject<Environment> = new BehaviorSubject<Environment>(Environment.sandbox);
  alldepots: BehaviorSubject<Array<Depot>> = new BehaviorSubject([]);

  /**
   * Be careful when subscribing to this value because it will always emit a value
   */
  activedepot: BehaviorSubject<{ depot: Depot, config: DepotConfig }> = new BehaviorSubject({ depot: { ...emptydepot }, config: { ...emptyDepotConfig } });


  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();

  constructor(
    private db: AngularFirestore,
    private configService: ConfigService,
    private depotService: DepotService,
    private adminservice: AdminService) {
    this.adminservice.observableuserdata
      .subscribe(admin => {
        if (admin) {
          this.subscriptions.set("configSubscription", this.configService.fetchConfig(admin).subscribe(t => this.omcconfig.next(t)));
        }
      });

    /**
     * Only subscribe to depot when the user data changes
     */
    this.adminservice.observableuserdata
      .pipe(distinctUntilChanged())
      .subscribe(admin => {
        if (admin) {
          this.unsubscribeAll();
          this.subscriptions.set("alldepots", this.depotService
            .fetchDepots(ref => ref.where("Active", "==", true).
              orderBy("Name", "asc"))
            .subscribe(alldepots => {
              const tempdepot: Depot = alldepots[0];

              if (alldepots.find(depot => depot.Id === this.activedepot.value.depot.Id)) {
                this.changeactivedepot(alldepots.find(depot => depot.Id === this.activedepot.value.depot.Id));
              } else {
                this.changeactivedepot(tempdepot);
              }
              this.alldepots.next(alldepots);
            })
          );
        }
      });
  }
  /**
   *
   * @param envString
   */
  getEnvironment(envString?: Environment): QboEnvironment {
    if (!envString) {
      return this.omcconfig.value.Qbo[this.environment.value];
    } else {
      return this.omcconfig.value.Qbo[envString];
    }
  }

  /**
   *
   * @param {Depot} depot
   */
  changeactivedepot(depot: Depot) {
    if (JSON.stringify(depot) !== JSON.stringify(this.activedepot.value)) {
      const config = this.omcconfig.value.depotconfig[this.environment.value].find(t => {
        // console.log(t.depotId);
        // console.log(depot.Id);
        // console.log(t.depotId === depot.Id);
        return t.depotId === depot.Id;
      }) || { ...emptyDepotConfig };
      console.log("changing to:", depot, config);
      this.activedepot.next({ depot, config: { ...emptyDepotConfig, ...config } });
    } else {
      return;
    }


  }
  /**
   * Unsubscribes from all subscriptions made within this service
   */
  unsubscribeAll() {
    this.subscriptions.forEach(value => {
      value();
    });
  }
}
