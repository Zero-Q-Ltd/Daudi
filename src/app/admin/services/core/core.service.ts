import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import * as moment from "moment";
import { BehaviorSubject, combineLatest } from "rxjs";
import { distinctUntilChanged, skipWhile } from "rxjs/operators";
import { DaudiCustomer, emptyDaudiCustomer } from "../../../models/Daudi/customer/Customer";
import { Depot, emptydepot } from "../../../models/Daudi/depot/Depot";
import { DepotConfig, emptyDepotConfig } from "../../../models/Daudi/depot/DepotConfig";
import { emptyEntry, Entry } from "../../../models/Daudi/fuel/Entry";
import { FuelNamesArray } from "../../../models/Daudi/fuel/FuelType";
import { emptyConfig, OMCConfig } from "../../../models/Daudi/omc/Config";
import { Environment } from "../../../models/Daudi/omc/Environments";
import { emptyomc, OMC } from "../../../models/Daudi/omc/OMC";
import { QboEnvironment } from "../../../models/Daudi/omc/QboEnvironment";
import { EmptyOMCStock, OMCStock } from "../../../models/Daudi/omc/Stock";
import { emptyorder, Order } from "../../../models/Daudi/order/Order";
import { OrderStageIds, OrderStages } from "../../../models/Daudi/order/OrderStages";
import { AttachId } from "../../../shared/pipes/attach-id.pipe";
import { CustomerService } from "../customers.service";
import { EntriesService } from "../entries.service";
import { OrdersService } from "../orders.service";
import { AdminService } from "./admin.service";
import { ConfigService } from "./config.service";
import { DepotService } from "./depot.service";
import { OmcService } from "./omc.service";

@Injectable({
  providedIn: "root"
})
/**
 * This singleton keeps all the variables needed by the app to run and automatically keeps and manages the subscriptions
 */
export class CoreService {
  config: BehaviorSubject<OMCConfig> = new BehaviorSubject<OMCConfig>({ ...emptyConfig });
  environment: BehaviorSubject<Environment> = new BehaviorSubject<Environment>(Environment.sandbox);
  depots: BehaviorSubject<Array<Depot>> = new BehaviorSubject([]);
  customers: BehaviorSubject<Array<DaudiCustomer>> = new BehaviorSubject<Array<DaudiCustomer>>([]);
  omcs: BehaviorSubject<Array<OMC>> = new BehaviorSubject<Array<OMC>>([]);
  stock: BehaviorSubject<OMCStock> = new BehaviorSubject<OMCStock>({ ...EmptyOMCStock });
  currentOmc: BehaviorSubject<OMC> = new BehaviorSubject<OMC>(emptyomc);
  /**
   * Be careful when subscribing to this value because it will always emit a value
   */
  activedepot: BehaviorSubject<{ depot: Depot, config: DepotConfig }> = new BehaviorSubject({ depot: { ...emptydepot }, config: { ...emptyDepotConfig } });
  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, () => void> = new Map<string, () => void>();
  /**
   * keeps an updated copy of core variables fetch status
   */
  loaders = {
    depots: new BehaviorSubject<boolean>(true),
    depotConfig: new BehaviorSubject<boolean>(true),
    customers: new BehaviorSubject<boolean>(true),
    entries: new BehaviorSubject<boolean>(true),
    omc: new BehaviorSubject<boolean>(true),
    orders: new BehaviorSubject<boolean>(true)
  };
  depotEntries: {
    pms: BehaviorSubject<Array<Entry>>,
    ago: BehaviorSubject<Array<Entry>>,
    ik: BehaviorSubject<Array<Entry>>,
  } = {
      pms: new BehaviorSubject([]),
      ago: new BehaviorSubject([]),
      ik: new BehaviorSubject([])
    };

  fueltypesArray = FuelNamesArray;
  orders: {
    [key in OrderStages]: BehaviorSubject<Array<Order>>
  } = {
      1: new BehaviorSubject<Array<Order>>([]),
      2: new BehaviorSubject<Array<Order>>([]),
      3: new BehaviorSubject<Array<Order>>([]),
      4: new BehaviorSubject<Array<Order>>([]),
      5: new BehaviorSubject<Array<Order>>([]),
      6: new BehaviorSubject<Array<Order>>([])
    };
  queuedorders = new BehaviorSubject([]);

  constructor(
    private db: AngularFirestore,
    private configService: ConfigService,
    private depotService: DepotService,
    private omc: OmcService,
    private orderService: OrdersService,
    private attachId: AttachId,
    private customerService: CustomerService,
    private entriesService: EntriesService,
    private adminservice: AdminService) {
    this.adminservice.observableuserdata
      .pipe(distinctUntilChanged())
      .subscribe(admin => {
        this.subscriptions.set("configSubscription", this.configService.configCollection(admin.config.omcId)
          .onSnapshot(t => {
            // console.log(t.data());
            this.config.next(this.attachId.transformObject<OMCConfig>(emptyConfig, t));
            /**
             * Fetch OMC's and depots after the main config has been loaded
             */
            this.getOmcs();
            this.getDepots();
          }));
      });

    /**
     * fetch the pipeline every time the depot changes
     */

    combineLatest([this.activedepot.pipe(skipWhile(t => !t.depot.Id)),
    this.currentOmc.pipe(skipWhile(t => !t.Id))]).subscribe(() => {
      this.getOrdersPipeline();
      this.getallcustomers();
      this.fetchActiveEntries();
    });

  }

  getDepots() {
    this.loaders.depots.next(true);
    this.subscriptions.set("alldepots", this.depotService
      .depotsCollection()
      .where("Active", "==", true)
      .orderBy("Name", "asc")
      .onSnapshot((data) => {
        this.unsubscribeAll();
        /**
         * Only subscribe to depot when the user data changes
         */
        this.depots.next(this.attachId.transformArray<Depot>(emptydepot, data));
        this.loaders.depots.next(false);
        const tempdepot: Depot = this.depots.value[0];
        /**
         * Trigger a depot change if this is the first load
         */
        if (this.depots.value.find(depot => depot.Id === this.activedepot.value.depot.Id)) {
          this.changeactivedepot(this.depots.value.find(depot => depot.Id === this.activedepot.value.depot.Id));
        } else {
          this.changeactivedepot(tempdepot);
        }

      })
    );
  }

  getOmcs() {
    this.subscriptions.set("omcs", this.omc.omcCollection()
      .orderBy("name", "asc")
      .onSnapshot(data => {
        // console.log("OMC data fetched");
        this.omcs.next(this.attachId.transformArray<OMC>(emptyomc, data));
        this.omcs.value.forEach(co => {
          if (co.Id === this.adminservice.userdata.config.omcId) {
            /**
             * make the pipeline subscription Only once
             */
            if (this.currentOmc.value.Id !== this.adminservice.userdata.config.omcId) {
              console.log("Current OMC found");
              this.currentOmc.next(co);
            }
            this.currentOmc.next(co);
          }
        });

      }));
  }
  /**
   * This is just an accessor to the function
   */
  createId() {
    return this.db.createId();
  }

  getallcustomers() {
    this.loaders.customers.next(true);
    this.subscriptions.set("allcustomers", this.customerService.customerCollection(this.currentOmc.value.Id)
      .where("environment", "==", this.environment.value)
      .onSnapshot(data => {
        this.loaders.customers.next(false);
        this.customers.next(this.attachId.transformArray<DaudiCustomer>(emptyDaudiCustomer, data));
      }));
  }
  /**
   *
   * @param envString
   */
  getEnvironment(envString?: Environment): QboEnvironment {
    if (!envString) {
      return this.config.value.Qbo[this.environment.value];
    } else {
      return this.config.value.Qbo[envString];
    }
  }

  /**
   * Chnages the values of the activeDepot if the value provided is different
   * @param {Depot} depot
   */
  changeactivedepot(depot: Depot) {
    // this.depotService
    //   .depotConfigCollection(this.adminservice.userdata.config.omcId)
    //   .add(emptyDepotConfig);
    this.loaders.depotConfig.next(true);
    if (JSON.stringify(depot) !== JSON.stringify(this.activedepot.value)) {
      this.subscriptions.set("currentDepotConfig", this.depotService
        .depotConfigCollection(this.adminservice.userdata.config.omcId)
        .where("environment", "==", this.environment.value)
        .where("depotId", "==", depot.Id)
        .onSnapshot(configData => {
          if (!configData.empty) {
            /**
             * Only one config SHOULD exist per environment, hence safe to take first value
             */
            if (configData.docs.length > 1) {
              console.error("Multiple Configs found for the same Depot");
            }
            const config: DepotConfig = { ...emptyDepotConfig, ...configData.docs[0].data(), ...{ depotId: configData.docs[0].id } };
            console.log("changing to:", depot.Name, config.depotId, config.Id);
            this.activedepot.next({ depot, config });
            this.loaders.depotConfig.next(false);
          } else {
            console.log("this depot doesnt have a valid config");
            this.activedepot.next({ depot, config: { ...emptyDepotConfig } });
            this.loaders.depotConfig.next(false);
          }
        })
      );

    }
  }
  /**
   * Unsubscribes from all subscriptions made within this service
   */
  unsubscribeAll() {
    this.subscriptions.forEach(value => {
      if (!value) { return; }
      value();
    });
  }


  /**
   * Fetches all orders and trucks Relevant to the header
   */
  getOrdersPipeline() {
    /**
     * reset the trucks and orders array when this function is invoked
     */
    this.loaders.orders.next(true);
    this.orders[1].next([]);
    this.orders[2].next([]);
    this.orders[3].next([]);
    this.orders[4].next([]);
    this.orders[5].next([]);
    this.orders[6].next([]);
    // const orderSubscription
    OrderStageIds.forEach(stage => {

      /**
       * cancel any previous queries
       */
      if (this.subscriptions.get(`orders${stage}`)) {
        this.subscriptions.get(`orders${stage}`)();
      }

      const subscriprion = this.orderService.ordersCollection(this.currentOmc.value.Id)
        .where("stage", "==", stage)
        .where("config.depot.id", "==", this.activedepot.value.depot.Id)
        .orderBy("stagedata.1.user.time", "asc")
        .onSnapshot(Data => {
          /**
           * reset the array at the postion when data changes
           */
          this.orders[stage].next([]);

          this.orders[stage].next(this.attachId.transformArray<Order>(emptyorder, Data));
          this.loaders.orders.next(false);
        });

      this.subscriptions.set(`orders${stage}`, subscriprion);
    });

    const startofweek = moment().startOf("week").toDate();
    /**
     * Fetch completed orders
     */
    const stage5subscriprion = this.orderService.ordersCollection(this.currentOmc.value.Id)
      .where("stage", "==", 5)
      .where("config.depot.id", "==", this.activedepot.value.depot.Id)
      .where("stagedata.1.user.time", "<=", startofweek)
      .orderBy("stagedata.1.user.time", "asc")
      .onSnapshot(Data => {
        /**
         * reset the array at the postion when data changes
         */
        this.orders[5].next([]);

        this.orders[5].next(this.attachId.transformArray<Order>(emptyorder, Data));
        this.loaders.orders.next(false);
      });

    this.subscriptions.set(`orders${5}`, stage5subscriprion);
  }


  fetchActiveEntries() {
    this.loaders.entries.next(true);
    this.fueltypesArray.forEach(fuelType => {
      this.subscriptions.set("entries", this.entriesService.entryCollection(this.currentOmc.value.Id)
        .where("active", "==", true)
        .where("fuelType", "==", fuelType)
        .onSnapshot(data => {
          this.loaders.entries.next(false);
          this.depotEntries[fuelType].next(this.attachId.transformArray<Entry>(emptyEntry, data));
        }));
    });
  }
}
