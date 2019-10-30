import * as moment from "moment";
import {olddata} from "./oldordersdata";
import {Order, Truck} from "../../models/Global";
import {Order} from "../../models/order/Order";
import {Truck} from "../../models/order/Truck"; // import our interface
const allorders = [];

export function syncdb(firestore) {
  for (let i = 0; i <= 380; i++) {
    let tempdate = moment().subtract(i, "days");
    // console.log(moment(tempdate).format('w'))
    // I have to start in the opposite direction because of the way data is displayed on the axis
    // this.daysofweek[13 - i] = `${moment(tempdate).format('dddd').substring(0, 3)}-${moment(tempdate).format('D')}`
    // console.log(olddata[moment(tempdate).format('YYYY')][(Number(moment(tempdate).format('M')) - 1)][Number(moment(tempdate).format('D'))-1])
    // console.log(olddata)
    // console.log(moment(tempdate).format('YYYY'),(Number(moment(tempdate).format('M')) - 1),moment(tempdate).format('D'))
    if (olddata[moment(tempdate).format("YYYY")][(Number(moment(tempdate).format("M")) - 1)] && olddata[moment(tempdate).format("YYYY")][(Number(moment(tempdate).format("M")) - 1)][moment(tempdate).format("D")]) {
      const datedata = olddata[moment(tempdate).format("YYYY")][(Number(moment(tempdate).format("M")) - 1)][moment(tempdate).format("D")].orders;
      // console.log(datedata)
      for (let key in datedata) {
        // console.log(datedata[key])
        if (datedata[key]) {
          allorders[key] = datedata[key];
          // console.log(originalorder)
          // console.log(changedorder)
          let orderdate = datedata[key].createdTime;
          for (let subkey in datedata[key].trucks) {
            // console.log(key)
            // console.log(subkey)
            let truckdata;
            if (olddata[moment(orderdate).format("YYYY")]
              [Number(moment(orderdate).format("M")) - 1]
              [moment(orderdate).format("D")].trucks) {
              console.log("Something");
              truckdata = olddata[moment(orderdate).format("YYYY")][Number(moment(orderdate).format("M")) - 1][moment(orderdate).format("D")].trucks[subkey];
            } else {
              console.log("empty");
              truckdata = null;
            }

            let originaltruck: Truck = truckdata;
            let originalorder: Order = allorders[key];
            // console.log(datedata[originaltruck.orderRef])
            if (truckdata) {
              console.log("were in");

              let changedorder: Order = {
                QbId: null,
                InvoiceId: originalorder.so ? originalorder.so : null,
                Id: originaltruck.orderRef ? originaltruck.orderRef : null,
                company: {
                  krapin: null,
                  QbId: null,
                  name: originaltruck.orderCompanyName ? originaltruck.orderCompanyName : null,
                  Id: null,
                  phone: (originaltruck.orderCompanyPhone) ? (originaltruck.orderCompanyPhone.toString()) : null,
                  contact: {
                    name: originaltruck.orderContactName ? originaltruck.orderContactName : null,
                    phone: (originaltruck.orderCompanyPhone) ? (originaltruck.orderCompanyPhone.toString()) : null,
                    email: null
                  }
                },
                loaded: true,
                stage: originalorder.stage ? originalorder.stage : null,
                origin: originalorder.family ? "family" : "backend",
                orderId: originalorder.orderId ? originalorder.orderId : null,
                notifications: {
                  allowsms: false,
                  allowemail: false
                },
                config: {
                  depot: {
                    name: "Oilcom",
                    Id: "36"
                  },
                  sandbox: true,
                  companyid: null
                },
                truck: Object.keys(originalorder.trucks),
                fuel: {
                  pms: {
                    QbId: null,
                    qty: originalorder.pmsQty,
                    priceconfig: {
                      price: originalorder.discountApproved ? originalorder.discountApproved.pms : originalorder.pmsSp,
                      retailprice: originalorder.pmsRp ? originalorder.pmsRp : 0,
                      nonTax: 0,
                      difference: 0,
                      minsp: 0,
                      total: 0,
                      nonTaxtotal: 0,
                      taxAmnt: 0,
                      taxablePrice: 0,
                      taxQbId: null,
                      nonTaxprice: 0,
                      taxableAmnt: 0
                    }

                  },
                  ago: {
                    QbId: null,
                    qty: originalorder.agoQty,
                    priceconfig: {
                      price: originalorder.discountApproved ? originalorder.discountApproved.ago : originalorder.agoSp,
                      retailprice: originalorder.agoRp ? originalorder.agoRp : 0,
                      nonTax: 0,
                      difference: 0,
                      minsp: 0,
                      total: 0,
                      nonTaxtotal: 0,
                      taxAmnt: 0,
                      taxablePrice: 0,
                      taxQbId: null,
                      nonTaxprice: 0,
                      taxableAmnt: 0
                    }
                  },
                  ik: {
                    QbId: null,
                    qty: originalorder.ikQty,
                    priceconfig: {
                      price: originalorder.discountApproved ? originalorder.discountApproved.ik : originalorder.ikSp,
                      retailprice: originalorder.ikRp ? originalorder.ikRp : 0,
                      nonTax: 0,
                      difference: 0,
                      minsp: 0,
                      total: 0,
                      nonTaxtotal: 0,
                      taxAmnt: 0,
                      taxablePrice: 0,
                      taxQbId: null,
                      nonTaxprice: 0,
                      taxableAmnt: 0
                    }
                  }

                },
                discount: {
                  approved: {
                    approved: !!originalorder.discountApproved,
                    user: {
                      uid: null,
                      name: originalorder.approvedBy ? originalorder.approvedBy : null,
                      time: null
                    },
                    data: null
                  },
                  request: {
                    pms: originalorder.discountApproved ? originalorder.discountApproved.pms : originalorder.pmsSp,
                    ago: originalorder.discountApproved ? originalorder.discountApproved.ago : originalorder.agoSp,
                    ik: originalorder.discountApproved ? originalorder.discountApproved.ik : originalorder.ikSp
                  }
                },
                stagedata: {

                  1: {
                    user: {
                      uid: originalorder.enteredById,
                      name: originalorder.enteredByUser,
                      time: firestore.Timestamp.fromMillis(originalorder.createdTime)
                    },
                    data: null
                  },
                  2: {
                    user: {
                      uid: originalorder.soCreatedBy ? originalorder.soCreatedBy : null,
                      name: originalorder.soUsername ? originalorder.soUsername : null,
                      time: originalorder.soCreatedAt ? firestore.Timestamp.fromMillis(originalorder.soCreatedAt) : null
                    },
                    data: originalorder.so ? originalorder.so : null
                  },
                  3: {
                    user: {
                      uid: originalorder.bankRefcreatedBy ? originalorder.bankRefcreatedBy : null,
                      name: originalorder.bankRefUsername ? originalorder.bankRefUsername : null,
                      time: originalorder.bankRefcreatedTime ? firestore.Timestamp.fromMillis(originalorder.bankRefcreatedTime) : null
                    },
                    data: originalorder.bankRef ? originalorder.bankRef : null
                  },
                  4: null,
                  5: {
                    user: {
                      uid: originalorder.completedBy ? originalorder.completedBy : null,
                      name: originalorder.completedByUsername ? originalorder.completedByUsername : null,
                      time: originalorder.completedAt ? firestore.Timestamp.fromMillis(originalorder.completedAt) : null
                    },
                    data: null
                  },
                  6: {
                    user: {
                      uid: originalorder.deletedBy ? originalorder.deletedBy : null,
                      name: originalorder.deletedByUser ? originalorder.deletedByUser : null,
                      time: originalorder.deletedAt ? firestore.Timestamp.fromMillis(originalorder.deletedAt).toDate() : null
                    },
                    data: null
                  }
                }
              };
              // var pmsids = originaltruck.pmsBatch.split('-')
              let changedtruck: Truck = {
                stage: 4,
                truckId: originaltruck.truckId ? originaltruck.truckId : null,
                numberplate: originaltruck.truckReg ? originaltruck.truckReg : null,
                company: {
                  QbId: null,
                  name: originaltruck.orderCompanyName ? originaltruck.orderCompanyName : null,
                  contactname: originaltruck.orderContactName ? originaltruck.orderContactName : null,
                  phone: originaltruck.orderCompanyPhone ? originaltruck.orderCompanyPhone.toString() : null,
                  Id: null
                },
                driverid: originaltruck.driverId ? originaltruck.driverId : null,
                drivername: originaltruck.driverName ? originaltruck.driverName : null,
                Id: subkey,
                isPrinted: false,
                frozen: false,
                config: {
                  depot: {
                    name: "Oilcom",
                    Id: "36"
                  },
                  sandbox: true,
                  companyid: null
                },
                notifications: {
                  allowsms: false,
                  allowemail: false
                },
                orderdata: {
                  QbID: originaltruck.orderSo ? originaltruck.orderSo : null,
                  OrderID: originaltruck.orderRef ? originaltruck.orderRef : null
                },
                fuel: {
                  pms: {
                    qty: originaltruck.pmsQty ? originaltruck.pmsQty : 0,
                    batches: {
                      0:
                        {
                          Name: (originaltruck.pmsBatch && (originaltruck.pmsBatch.indexOf("-") > -1)) ? (originaltruck.pmsBatch.split("-")[0]) : originaltruck.pmsBatch ? originaltruck.pmsBatch : null,
                          Id: (originaltruck.pmsbatchkey && (originaltruck.pmsbatchkey.indexOf("#") > -1)) ? originaltruck.pmsbatchkey.split("#")[0] : originaltruck.pmsbatchkey ? originaltruck.pmsbatchkey : null,
                          observed: 0,
                          qty: originaltruck.pmsbatchdiff ? originaltruck.pmsQty - originaltruck.pmsbatchdiff : null
                        },
                      1: {
                        Name: (originaltruck.pmsBatch && (originaltruck.pmsBatch.indexOf("-") > -1)) ? originaltruck.pmsBatch.split("-")[1] : null,
                        Id: (originaltruck.pmsbatchkey && (originaltruck.pmsbatchkey.indexOf("#") > -1)) ? originaltruck.pmsbatchkey.split("#")[1] : null,
                        observed: 0,
                        qty: originaltruck.pmsbatchdiff ? originaltruck.pmsbatchdiff : 0
                      }
                    }
                  },
                  ago: {
                    qty: originaltruck.agoQty ? originaltruck.agoQty : 0,
                    batches: {
                      0: {
                        Name: (originaltruck.agoBatch && (originaltruck.agoBatch.indexOf("-") > -1)) ? originaltruck.agoBatch.split("-")[0] : originaltruck.agoBatch ? originaltruck.agoBatch : null,
                        Id: (originaltruck.agobatchkey && (originaltruck.agobatchkey.indexOf("#") > -1)) ? originaltruck.agobatchkey.split("#")[0] : originaltruck.agobatchkey ? originaltruck.agobatchkey : null,
                        observed: 0,
                        qty: originaltruck.agobatchdiff ? originaltruck.agoQty - originaltruck.agobatchdiff : null
                      },
                      1: {
                        Name: (originaltruck.agoBatch && (originaltruck.agoBatch.indexOf("-") > -1)) ? originaltruck.agoBatch.split("-")[1] : null,
                        Id: (originaltruck.agobatchkey && (originaltruck.agobatchkey.indexOf("#") > -1)) ? originaltruck.agobatchkey.split("#")[1] : null,
                        observed: 0,
                        qty: originaltruck.agobatchdiff ? originaltruck.agobatchdiff : 0
                      }
                    }
                  },
                  ik: {
                    qty: originaltruck.ikQty ? originaltruck.ikQty : 0,
                    batches: {
                      0: {
                        Name: (originaltruck.ikBatch && (originaltruck.ikBatch.indexOf("-") > -1)) ? originaltruck.ikBatch.split("-")[0] : originaltruck.ikBatch ? originaltruck.ikBatch : null,
                        Id: (originaltruck.ikbatchkey && (originaltruck.ikbatchkey.indexOf("#") > -1)) ? originaltruck.ikbatchkey.split("#")[0] : originaltruck.ikbatchkey ? originaltruck.ikbatchkey : null,
                        observed: 0,
                        qty: originaltruck.ikbatchdiff ? originaltruck.ikQty - originaltruck.ikbatchdiff : null
                      }, 1: {
                        Name: (originaltruck.ikBatch && (originaltruck.ikBatch.indexOf("-") > -1)) ? originaltruck.ikBatch.split("-")[1] : null,
                        Id: (originaltruck.ikbatchkey && (originaltruck.ikbatchkey.indexOf("#") > -1)) ? originaltruck.ikbatchkey.split("#")[1] : null,
                        observed: 0,
                        qty: originaltruck.ikbatchdiff ? originaltruck.ikbatchdiff : 0
                      }
                    }
                  }
                },
                stagedata: {
                  0: {
                    user: {
                      uid: originaltruck.createdBy ? originaltruck.createdBy : null,
                      name: originaltruck.userName ? originaltruck.userName : null,
                      time: originaltruck.createdTime ? firestore.Timestamp.fromMillis(originaltruck.createdTime) : null
                    },
                    data: null
                  },
                  1: {
                    user: {
                      uid: originaltruck.proBy ? originaltruck.proBy : null,
                      name: originaltruck.probyUname ? originaltruck.probyUname : null,
                      time: originaltruck.proAt ? firestore.Timestamp.fromMillis(originaltruck.proAt) : null
                    },
                    data: {
                      expiry: [{
                        time: "0.45",
                        timestamp: originaltruck.proAt ? firestore.Timestamp.fromMillis(originaltruck.proAt) : null
                      }]
                    }
                  },
                  2: {
                    user: {
                      uid: originaltruck.queBy ? originaltruck.queBy : null,
                      name: originaltruck.quebyUname ? originaltruck.quebyUname : null,
                      time: originaltruck.queAt ? firestore.Timestamp.fromMillis(originaltruck.queAt) : null
                    },
                    data: {
                      expiry: [{
                        time: originaltruck.queTime ? originaltruck.queTime : null,
                        timestamp: originaltruck.queExpiry ? firestore.Timestamp.fromMillis(originaltruck.queExpiry) : null
                      }]
                    }
                  },
                  3: {
                    user: {
                      uid: originaltruck.loadBy ? originaltruck.loadBy : null,
                      name: originaltruck.loadbyUname ? originaltruck.loadbyUname : null,
                      time: originaltruck.loadAt ? firestore.Timestamp.fromMillis(originaltruck.loadAt) : null
                    },
                    data: {
                      expiry: [{
                        time: originaltruck.loadTime ? originaltruck.loadTime : null,
                        timestamp: originaltruck.loadAt ? firestore.Timestamp.fromMillis(originaltruck.loadAt) : null
                      }]
                    }
                  },
                  4: {
                    user: {
                      uid: originaltruck.doneBy ? originaltruck.doneBy : null,
                      name: originaltruck.donebyUname ? originaltruck.donebyUname : null,
                      time: originaltruck.doneAt ? firestore.Timestamp.fromMillis(originaltruck.doneAt) : null
                    },
                    data: {
                      seals: {
                        range: originaltruck.sealNumbers ? originaltruck.sealNumbers : null,
                        broken: null
                      }
                    }
                  }
                },
                compartments: [
                  {
                    fueltype: (originaltruck.c1 && originaltruck.c1.indexOf("=")) ? originaltruck.c1.split("=")[0] : originaltruck.c1 ? originaltruck.c1 : null,
                    qty: (originaltruck.c1 && originaltruck.c1.indexOf("=")) ? Number(originaltruck.c1.split("=")[1]) : originaltruck.c1 ? Number(originaltruck.c1) : null
                  },
                  {
                    fueltype: (originaltruck.c2 && originaltruck.c2.indexOf("=")) ? originaltruck.c2.split("=")[0] : originaltruck.c2 ? originaltruck.c2 : null,
                    qty: (originaltruck.c2 && originaltruck.c2.indexOf("=")) ? Number(originaltruck.c2.split("=")[1]) : originaltruck.c2 ? Number(originaltruck.c2) : null
                  },
                  {
                    fueltype: (originaltruck.c3 && originaltruck.c3.indexOf("=")) ? originaltruck.c3.split("=")[0] : originaltruck.c3 ? originaltruck.c3 : null,
                    qty: (originaltruck.c3 && originaltruck.c3.split("=")[1]) ? Number(originaltruck.c3.split("=")[1]) : originaltruck.c3 ? Number(originaltruck.c3) : null
                  },
                  {
                    fueltype: (originaltruck.c4 && originaltruck.c4.indexOf("=")) ? originaltruck.c4.split("=")[0] : originaltruck.c4 ? originaltruck.c4 : null,
                    qty: (originaltruck.c4 && originaltruck.c4.split("=")[1]) ? Number(originaltruck.c4.split("=")[1]) : originaltruck.c4 ? Number(originaltruck.c4) : null
                  },
                  {
                    fueltype: (originaltruck.c5 && originaltruck.c5.indexOf("=")) ? originaltruck.c5.split("=")[0] : originaltruck.c5 ? originaltruck.c5 : null,
                    qty: (originaltruck.c5 && originaltruck.c5.split("=")[1]) ? Number(originaltruck.c5.split("=")[1]) : originaltruck.c5 ? Number(originaltruck.c5) : null
                  },
                  {
                    fueltype: (originaltruck.c6 && originaltruck.c6.indexOf("=")) ? originaltruck.c6.split("=")[0] : originaltruck.c6 ? originaltruck.c6 : null,
                    qty: (originaltruck.c6 && originaltruck.c6.split("=")[1]) ? Number(originaltruck.c6.split("=")[1]) : originaltruck.c6 ? Number(originaltruck.c6) : null
                  },
                  {
                    fueltype: (originaltruck.c7 && originaltruck.c7.indexOf("=")) ? originaltruck.c7.split("=")[0] : originaltruck.c7 ? originaltruck.c7 : null,
                    qty: (originaltruck.c7 && originaltruck.c7.split("=")[1]) ? Number(originaltruck.c7.split("=")[1]) : originaltruck.c7 ? Number(originaltruck.c7) : null
                  }
                ]
              };
              // console.log('co', changedorder)
              // console.log('ot', originaltruck)
              // console.log('ct', changedtruck)
              if (changedorder && originaltruck.orderRef && changedtruck) {
                try {
                  // console.log(originaltruck)
                  firestore.copytofirestore(changedorder, changedtruck);
                } catch (err) {
                  console.error(err);
                }
              }
            } else {
              // console.log('empty')
            }
            // })
          }

        }
      }

    }

  }
}
