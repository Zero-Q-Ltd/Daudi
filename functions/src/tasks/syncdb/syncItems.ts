import { QuickBooks } from "../../libs/qbmain";
import { Item } from "../../models/Qbo/Item";
import { firestore } from "firebase-admin";
import { Depot_, emptydepot } from "../../models/Daudi/Depot";
import { emptytaxconfig, taxconfig } from "../../models/Daudi/Taxconfig";
import { fuelTypes } from "../../models/common";

/**
 * An Item of type Category is the depot
 * A Category of name Tax Exempt is the config for tax exempt
 * All the Tax Exempt Items MUST be NONINVENTORY
 * @param qbo
 */
export function syncItems(qbo: QuickBooks) {
  return qbo.findItems([{ Active: [true, false] }]).then(esponse => {
    return getaaldepots().then(alldepots => {
      if (alldepots.empty) {
        return new Promise(resolve => {
          resolve(true);
        });
      } else {
        const alldepotdata = alldepots.docs.map(doc => doc.data() as Depot_);

        const allitems: Array<Item> = esponse.QueryResponse.Item;
        return Promise.all(
          allitems.map(async item => {
            switch (item.Type) {
              case "Inventory":
                /**
                 * Make sure this is a fuel of type pms, ago or Ik belonging to a specific depot
                 */
                if (
                  item.ParentRef &&
                  item.ParentRef.name &&
                  (item.Name.toLowerCase() === "pms" || "ago" || "ik")
                ) {
                  /**
                   * make sure that depot already exists, then update the fuelconfig
                   * This is used when creating an order to reference the correct item Id
                   * Every depot has an indepedent config becase the items must belong to that specific category(depot)
                   */
                  return await firestore()
                    .collection("depots")
                    .doc(item.ParentRef.value)
                    .get()
                    .then(async depotnapshot => {
                      if (!depotnapshot.exists) {
                        console.log("depot doesnt exist, escaping");
                        return null;
                      }
                      console.log("updating price config");
                      const fuelconfig = depotnapshot.data().fuelconfig
                        ? {
                          pms: depotnapshot.data().fuelconfig
                            ? depotnapshot.data().fuelconfig.pms
                            : 0,
                          ago: depotnapshot.data().fuelconfig
                            ? depotnapshot.data().fuelconfig.ago
                            : 0,
                          ik: depotnapshot.data().fuelconfig
                            ? depotnapshot.data().fuelconfig.ik
                            : 0
                        }
                        : {
                          pms: 0,
                          ago: 0,
                          ik: 0
                        };
                      fuelconfig[item.Name.toLowerCase() as fuelTypes] = item.Id || null;
                      return await firestore()
                        .collection("depots")
                        .doc(item.ParentRef.value.toString())
                        .update({ fuelconfig: fuelconfig });
                    });
                } else {
                  return null;
                }
              case "NonInventory":
                /**
                 * Make sure it belongs to a depot
                 */
                if (item.ParentRef) {
                  /**
                   * make sure that depot already exists, then update the tax config
                   */
                  console.log("updating tax config");
                  const depot = firestore()
                    .collection("depots")
                    .doc(item.ParentRef.value);
                  return firestore().runTransaction(t => {
                    return t.get(depot).then(doc => {
                      console.log(doc.data());
                      if (!doc.exists) {
                        return null;
                      }
                      const newtaxconfig: taxconfig = (doc.data()
                        .taxconfig as taxconfig) || { ...emptytaxconfig };
                      newtaxconfig[resolvefueltype(item.Name.toLowerCase())] = {
                        MetaData: item.MetaData,
                        nonTax: item.UnitPrice,
                        QbId: item.Id
                      };
                      t.update(depot, { taxconfig: newtaxconfig });
                    });
                  });
                } else {
                  console.log(
                    "This item does not belong to a depot, escaping......"
                  );
                  return null;
                }
              case "Category":
                /**
                 * Olny create the depot if it doesnt exist and avoid overwriting any data
                 * Dont create a depot names vat exempt
                 */
                if (!alldepotdata.find(depot => depot.Id === item.Id)) {
                  const newDepot_: Depot_ = Object.assign(
                    { ...emptydepot },
                    item
                  );
                  newDepot_.Active = true;
                  newDepot_.sandbox = qbo.sandbox;
                  newDepot_.companyId = qbo.companyid;
                  console.log("Creating new Depot_");
                  return await firestore()
                    .collection("depots")
                    .doc(item.Id)
                    .set(newDepot_);
                } else {
                  /**
                   * Update the depot in case any info has changed
                   */
                  return firestore()
                    .collection("depots")
                    .doc(item.Id)
                    .update(item);
                }
              case "Group":
                console.log("Ignoring Group Inventory item");
                return null;
              case "Service":
                console.log("Ignoring service Inventory item");
                return null;
            }
          })
        );
      }
    });
  });
}

/**
 * uses the current depot config to calculate two prices with a margin
 * since the current selling price is already Inc of VAT, assume that adding VAT will not vary the price more than 10Kes, which forms
 * our upper limit, used to calculate our lower limit which is 10KES less
 * These two prices are used to generate 2 values to allow the use of the equation of a straight line to calculate prices in future
 */
function generatetaxconfig(depotdata: Depot_, item: Item): taxconfig {
  console.log(depotdata);
  const fueltype = resolvefueltype(item.Name.toLowerCase());

  const upperpricelimit = depotdata.currentpriceconfig.ago.price - 6;
  const lowerpricelimit = upperpricelimit - 10; //This was a shorter code to type

  const upperlimitdiff = calculateVAT(upperpricelimit, item.UnitPrice);
  const lowerlimitdiff = calculateVAT(lowerpricelimit, item.UnitPrice);

  const equation = createequation(
    { x: upperpricelimit + upperlimitdiff, y: upperlimitdiff },
    { x: lowerpricelimit + lowerlimitdiff, y: lowerlimitdiff }
  );
  //Avoid errors I dont undertand origins
  depotdata.taxconfig = Object.assign(
    { ...emptytaxconfig },
    depotdata.taxconfig
  );
  depotdata.taxconfig[fueltype].formula.m = equation.m;
  depotdata.taxconfig[fueltype].formula.c = equation.c;
  depotdata.taxconfig[fueltype].formula.calculationvars = [
    { x: upperpricelimit, y: upperlimitdiff },
    {
      x: lowerpricelimit,
      y: lowerlimitdiff
    }
  ];
  depotdata.taxconfig.ago.nonTax = item.UnitPrice;
  depotdata.taxconfig.ago.MetaData = item.MetaData;
  depotdata.taxconfig.ago.QbId = item.Id;
  console.log("updated tax config......");
  console.log(depotdata.taxconfig);
  return depotdata.taxconfig;
}

function calculateVAT(originalprice: number, vatexcempt: number): number {
  return (originalprice - vatexcempt) * 0.08;
}

type co_ordinate = {
  x: number;
  y: number;
};

/**
 * generates values required for the formula y = mx+c to work
 */
function createequation(
  point1: co_ordinate,
  point2: co_ordinate
): { m: number; c: number } {
  const m = getslopeFromTwoPoints(point1, point2);
  const c = point1.y - m * point1.x;
  return { m, c };
}

function getslopeFromTwoPoints(point1: co_ordinate, point2: co_ordinate) {
  return (point1.y - point2.y) / (point1.x - point2.x);
}

function resolvefueltype(fuelstring: string): string {
  if (fuelstring.indexOf("pms") !== -1) {
    return "pms";
  } else if (fuelstring.indexOf("ago") !== -1) {
    return "ago";
  } else if (fuelstring.indexOf("ik") !== -1) {
    return "ik";
  } else {
    throw new Error("This fuel type is not valid");
  }
}

function getaaldepots() {
  return firestore()
    .collection("depots")
    .get();
}
