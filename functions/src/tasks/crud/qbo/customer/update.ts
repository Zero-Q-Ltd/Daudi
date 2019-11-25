// import { createQbo } from "../../../sharedqb";
// import { Customer } from "../../../../models/Qbo/Customer";
// import { Company_ } from "../../../../models/Daudi/Company";

// export function updateCustomer(customerdata: Company_) {
//   return createQbo(customerdata.companyId).then(result => {
//     const qbo = result;

//     console.log(result);
//     const editedCustomer: Customer = {
//       FullyQualifiedName: customerdata.name,
//       DisplayName: customerdata.contact.name,
//       CompanyName: customerdata.name,
//       BillAddr: {
//         Lat: customerdata.location.latitude,
//         Long: customerdata.location.longitude
//       },
//       // BillAddr : customerdata.location
//       PrimaryEmailAddr: {
//         Address: customerdata.contact.email
//       },
//       Id: customerdata.QbId,
//       /**
//        * Assign something for synctoken
//        */
//       Notes: customerdata.krapin,
//       // PrimaryTaxIdentifier: customerdata.krapin,
//       PrimaryPhone: {
//         FreeFormNumber: customerdata.contact.phone
//       },
//       sparse: true
//     };
//     return qbo.getCustomer(customerdata.QbId).then(customerdataresponse => {
//       let customer = customerdataresponse.Customer as Customer;
//       customer = Object.assign(customer, editedCustomer);
//       return qbo.updateCustomer(customer);
//     });
//     // return resolver('Nothing to resolve');
//   });
// }
