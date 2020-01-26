import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { DaudiCustomer, emptyDaudiCustomer } from 'app/models/Daudi/customer/Customer';
import { Depot, emptydepot } from 'app/models/Daudi/depot/Depot';
import { DepotConfig, emptyDepotConfig } from 'app/models/Daudi/depot/DepotConfig';
import { emptyEntry, Entry } from 'app/models/Daudi/fuel/Entry';
import { FuelNamesArray } from 'app/models/Daudi/fuel/FuelType';
import { AdminConfig, emptyConfig } from 'app/models/Daudi/omc/AdminConfig';
import { emptyomc, OMC } from 'app/models/Daudi/omc/OMC';
import { EmptyOMCStock, OMCStock } from 'app/models/Daudi/omc/Stock';
import { emptyorder, Order } from 'app/models/Daudi/order/Order';
import { OrderStageIds, OrderStages } from 'app/models/Daudi/order/OrderStages';
import { toArray, toObject } from 'app/models/utils/SnapshotUtils';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, skipWhile } from 'rxjs/operators';
import { CustomerService } from '../customers.service';
import { EntriesService } from '../entries.service';
import { OrdersService } from '../orders.service';
import { AdminConfigService } from './admin-config.service';
import { AdminService } from './admin.service';
import { DepotService } from './depot.service';
import { OmcService } from './omc.service';
import { StocksService } from './stocks.service';

@Injectable({
  providedIn: 'root'
})
/**
 * This singleton keeps all the variables needed by the app to run and automatically keeps and manages the subscriptions
 */
export class CoreService {
  adminConfig: BehaviorSubject<AdminConfig> = new BehaviorSubject<AdminConfig>({ ...emptyConfig });
  depots: BehaviorSubject<Depot[]> = new BehaviorSubject([]);
  customers: BehaviorSubject<DaudiCustomer[]> = new BehaviorSubject<DaudiCustomer[]>([]);
  omcs: BehaviorSubject<OMC[]> = new BehaviorSubject<OMC[]>([]);
  stock: BehaviorSubject<OMCStock> = new BehaviorSubject<OMCStock>({ ...EmptyOMCStock });
  currentOmc: BehaviorSubject<OMC> = new BehaviorSubject<OMC>(emptyomc);
  /**
   * Be careful when subscribing to this value because it will always emit a value
   */
  activedepot: BehaviorSubject<{ depot: Depot, config: DepotConfig }> = new BehaviorSubject({
    depot: { ...emptydepot },
    config: { ...emptyDepotConfig }
  });
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
    orders: new BehaviorSubject<boolean>(true),
    stock: new BehaviorSubject<boolean>(true)
  };
  depotEntries: {
    pms: BehaviorSubject<Entry[]>,
    ago: BehaviorSubject<Entry[]>,
    ik: BehaviorSubject<Entry[]>,
  } = {
      pms: new BehaviorSubject([]),
      ago: new BehaviorSubject([]),
      ik: new BehaviorSubject([])
    };

  fueltypesArray = FuelNamesArray;
  orders: {
    [key in OrderStages]: BehaviorSubject<Order[]>
  } = {
      1: new BehaviorSubject<Order[]>([]),
      2: new BehaviorSubject<Order[]>([]),
      3: new BehaviorSubject<Order[]>([]),
      4: new BehaviorSubject<Order[]>([]),
      5: new BehaviorSubject<Order[]>([]),
      6: new BehaviorSubject<Order[]>([])
    };
  queuedorders = new BehaviorSubject([]);
  omcId: string;

  constructor(
    private db: AngularFirestore,
    private adminConfigService: AdminConfigService,
    private depotService: DepotService,
    private omc: OmcService,
    private orderService: OrdersService,
    private customerService: CustomerService,
    private entriesService: EntriesService,
    private stockService: StocksService,
    private adminservice: AdminService) {
    this.adminservice.observableuserdata
      .pipe(distinctUntilChanged())
      .subscribe(admin => {
        this.unsubscribeAll();
        this.subscriptions.set('configSubscription', this.adminConfigService.configDoc(admin.config.omcId)
          .onSnapshot(t => {
            const config = toObject(emptyConfig, t);
            // this.duplicate(admin.config.omcId, "configs", "admin", { adminTypes: config.adminTypes });
            // this.duplicate(admin.config.omcId, "values", "config", { adminTypes: t.data().adminTypes });

            this.omcId = admin.config.omcId;
            this.adminConfig.next(config);
            /**
             * Fetch OMC's and depots after the main config has been loaded
             */
            this.getOmcs();
            this.getDepots();
            this.getallcustomers();
            this.getStocks();
          }));
      });

    /**
     * fetch the pipeline every time the depot changes
     */
    this.activedepot.pipe(skipWhile(t => !t.depot.Id)).subscribe((t) => {
      this.getOrdersPipeline(t.depot.Id);
      this.fetchActiveEntries();
    });
  }

  duplicate(name: string, id: string, doc, omcId?: string) {
    if (omcId) {
      return this.db.firestore.collection('omc')
        .doc(omcId)
        .collection(name)
        .doc(id)
        .set(doc);
    } else {
      return this.db.firestore.collection(name)
        .doc(id)
        .set(doc);
    }
  }

  getStocks() {
    this.loaders.stock.next(true);
    this.subscriptions.set('stock', this.stockService.stockDoc(this.omcId)
      .onSnapshot(t => {
        this.stock.next(toObject(EmptyOMCStock, t));
        this.loaders.stock.next(false);
      }));
  }

  /**
   * Fetches all the active depots
   */
  getDepots() {
    this.loaders.depots.next(true);
    this.subscriptions.set('alldepots', this.depotService
      .depotsCollection()
      .where('Active', '==', true)
      .orderBy('Name', 'asc')
      .onSnapshot((data) => {
        /**
         * Only subscribe to depot when the user data changes
         */
        this.depots.next(toArray(emptydepot, data));
        // this.depots.value.map(depot => {
        //   this.duplicate("depots", depot.Id, depot);
        // });
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

  /**
   * fetches all omc's and filters the one belonging the the currently logged in user
   */
  getOmcs() {
    this.subscriptions.set('omcs', this.omc.omcCollection()
      .orderBy('name', 'asc')
      .onSnapshot(data => {
        this.omcs.next(toArray(emptyomc, data));
        this.omcs.value.forEach(co => {
          if (co.Id === this.omcId) {
            console.log('Current OMC found');
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

  /**
   * fetches all active customers belonging the OMC
   */
  getallcustomers() {
    this.loaders.customers.next(true);
    this.subscriptions.set('allcustomers', this.customerService.customerCollection(this.omcId)
      .onSnapshot(data => {
        this.loaders.customers.next(false);
        this.customers.next(toArray(emptyDaudiCustomer, data));
      }));
  }

  /**
   * Chnages the values of the activeDepot if the value provided is different
   * @param {Depot} depot
   */
  changeactivedepot(depot: Depot) {
    // this.depotService
    //   .depotConfigCollection(this.omcId)
    //   .add(emptyDepotConfig);
    this.loaders.depotConfig.next(true);
    if (JSON.stringify(depot) !== JSON.stringify(this.activedepot.value)) {
      this.subscriptions.set('currentDepotConfig', this.depotService
        .depotConfigDoc(this.omcId, depot.Id)
        .onSnapshot(t => {
          if (t.exists) {
            const config: DepotConfig = toObject(emptyDepotConfig, t);
            console.log('changing to:', depot.Name, config.depotId, config.Id);
            this.activedepot.next({ depot, config });
            this.loaders.depotConfig.next(false);
          } else {
            console.log('this depot doesnt have a valid config');
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
      if (!value) {
        return;
      }
      value();
    });
  }

  /**
   * Fetches all orders and trucks Relevant to the header
   */
  getOrdersPipeline(depotId: string) {
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

      const subscriprion = this.orderService.ordersCollection(this.omcId)
        .where('stage', '==', stage)
        .where('config.depot.id', '==', depotId)
        .orderBy('orderStageData.1.user.date', 'asc')
        .onSnapshot(Data => {
          /**
           * reset the array at the postion when data changes
           */
          this.orders[stage].next([]);
          this.orders[stage].next(toArray(emptyorder, Data));
          this.loaders.orders.next(false);
        });

      this.subscriptions.set(`orders${stage}`, subscriprion);
    });

    const startofweek = moment().startOf('week').toDate();
    /**
     * Fetch completed orders
     */
    const stage5subscriprion = this.orderService.ordersCollection(this.omcId)
      .where('stage', '==', 5)
      .where('config.depot.id', '==', depotId)
      .where('orderStageData.1.user.date', '<=', startofweek)
      .orderBy('orderStageData.1.user.date', 'asc')
      .onSnapshot(Data => {
        /**
         * reset the array at the postion when data changes
         */
        this.orders[5].next([]);

        this.orders[5].next(toArray(emptyorder, Data));
        this.loaders.orders.next(false);
      });

    this.subscriptions.set(`orders${5}`, stage5subscriprion);
  }

  /**
   * Fetches the active entries
   * Checks whether its a private depot or not
   */
  fetchActiveEntries() {
    this.loaders.entries.next(true);
    this.fueltypesArray.forEach(fuelType => {
      let queryvalue = this.entriesService.entryCollection(this.omcId)
        .where('active', '==', true)
        .where('fuelType', '==', fuelType);
      /**
       * Filter by depot if its a privtae depot
       */
      if (this.activedepot.value.depot.config.private) {
        queryvalue = queryvalue.where('depot.Id', '==', this.activedepot.value.depot.Id);
      }
      this.subscriptions.set('entries', queryvalue
        .onSnapshot(data => {
          this.loaders.entries.next(false);
          this.depotEntries[fuelType].next(toArray(emptyEntry, data));
        }));
    });
  }
}
