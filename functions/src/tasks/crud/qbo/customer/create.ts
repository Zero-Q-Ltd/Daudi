// import { Customer } from "../../../../models/Qbo/Customer";
// import { createQbo } from "../../../sharedqb";
// import { firestore } from "firebase-admin";

// export function createCustomer(customerdata: Company) {
//   const newCustomer: Customer = {
//     FullyQualifiedName: customerdata.name,
//     DisplayName: customerdata.contact.name,
//     CompanyName: customerdata.name,
//     BillAddr: {
//       Lat: customerdata.location.latitude,
//       Long: customerdata.location.longitude
//     },
//     PrimaryEmailAddr: {
//       Address: customerdata.contact.email
//     },
//     Notes: customerdata.krapin,
//     // PrimaryTaxIdentifier: customerdata.krapin,
//     PrimaryPhone: {
//       FreeFormNumber: customerdata.contact.phone
//     }
//   };
//   return createQbo(customerdata.companyId).then(result => {
//     const qbo = result;
//     return qbo.createCustomer(newCustomer).then(innerresult => {
//       console.log(innerresult);
//       customerdata.QbId = innerresult.Customer.Id;
//       return firestore()
//         .collection("companies")
//         .doc(customerdata.QbId)
//         .set(customerdata)
//         .then(() => {
//           return customerdata;
//         });
//     });
//   });
// }
