// import { QuickBooks } from "../../libs/qbmain";
// import { auth, firestore } from "firebase-admin";
// import { Employee } from "../../models/Qbo/Employee";
// import { inituser } from "../../models/common";
// import * as moment from "moment";
// import { Admin } from "../../models/Daudi/admin/Admin";
// let allDbAdmins!: Array<Admin>;

// /**
//  * Fetches all the employees on qbo
//  * Creates them as users on Daudi if they have emails, but their level has to be approved on the superadmin backend of Daudi
//  * @param qbo
//  */
// export function syncAdmins(qbo: QuickBooks) {
//   /**
//    * Limit to 1000 customers for every sync operation
//    */
//   return qbo.findEmployees([{ Active: [true, false] }]).then(employees => {
//     const alladmins: Array<Employee> = employees.QueryResponse.Employee;
//     const batchwrite = firestore().batch();

//     return Promise.all(
//       alladmins.map(employee => {
//         const qbAdmin = convertToDaudiadmin(
//           employee,
//           qbo.sandbox,
//           qbo.companyid
//         );
//         /**
//          * make sure that the admin doesn't exist before creating
//          */
//         return getallAdmins().then(admins => {
//           allDbAdmins = admins.docs.map(ad => {
//             const adm: Admin = ad.data() as Admin;
//             adm.Id = ad.id;
//             return adm;
//           });
//           /**
//            * Update currently existing Admins
//            * Use email as primary key
//            */
//           const adminexists = adminExists(qbAdmin.data.email);
//           if (adminexists) {
//             /**
//              * only update some fields
//              */
//             return batchwrite.update(
//               firestore()
//                 .collection("admins")
//                 .doc(qbAdmin.Id),
//               updateAdminFiields(qbAdmin, adminexists)
//             );
//           } else if (qbAdmin.data.email) {
//             /**
//              * Create new Admin
//              */
//             /**
//              * create the user with the specified email
//              */

//             return auth()
//               .createUser({
//                 email: qbAdmin.data.email,
//                 emailVerified: false,
//                 disabled: false,
//                 displayName: qbAdmin.data.name
//               })
//               .then(result => {
//                 /**
//                  * Commit for a batch write to Daudi
//                  */
//                 console.log("successfully created Admin");
//                 console.log(result);
//                 qbAdmin.data.uid = result.uid;
//                 batchwrite.update(
//                   firestore()
//                     .collection("admins")
//                     .doc(result.uid),
//                   qbAdmin
//                 );
//                 /**
//                  * Update QBO
//                  */

//                 employee.EmployeeNumber = result.uid;
//                 /**
//                  * Somehow qbo throws an error if this field is missing, even if the original request didnt have it
//                  */
//                 if (!employee.FamilyName) {
//                   employee.FamilyName = "Empty";
//                 }
//                 return qbo.updateEmployee(employee);
//               })
//               .catch(err => {
//                 console.info("error creating account for");
//                 console.info(qbAdmin.data.email);
//                 /**
//                  * Probably this user exists, skip creating
//                  */
//                 return auth()
//                   .getUserByEmail(qbAdmin.data.email)
//                   .then(user => {
//                     /**
//                      * Update the database and add the user
//                      * delete any information that should not be overwritten
//                      */
//                     delete qbAdmin.data;
//                     delete qbAdmin.config;
//                     batchwrite.update(
//                       firestore()
//                         .collection("admins")
//                         .doc(user.uid),
//                       qbAdmin
//                     );
//                     /**
//                      * Update qbos
//                      */
//                     employee.EmployeeNumber = user.uid;
//                     if (!employee.FamilyName) {
//                       employee.FamilyName = "Empty";
//                     }
//                     return qbo.updateEmployee(employee);
//                   });
//               });
//           } else {
//             console.log("Skipping Employee without email");
//             return true;
//           }
//         });
//       })
//     ).then(res => {
//       return batchwrite.commit();
//     });
//   });
// }

// function adminExists(adminEmail: string): Admin | null {
//   if (
//     allDbAdmins.filter(admin => {
//       admin.data.email === adminEmail;
//     })
//   ) {
//     return allDbAdmins.filter(admin => {
//       admin.data.email === adminEmail;
//     })[0];
//   } else {
//     return null;
//   }
// }

// function updateAdminFiields(qbAdmin: Admin, dbAdmin: Admin): Admin {
//   dbAdmin.profiledata = qbAdmin.profiledata;
//   dbAdmin.Active = qbAdmin.Active;
//   return qbAdmin;
// }

// function convertToDaudiadmin(
//   employee: Employee,
//   sandbox: boolean,
//   companyid: string
// ): Admin {
//   console.log("converting employee to Admin");
//   const newadmin: Admin = {
//     data: {
//       photoURL: "",
//       uid: "",
//       name: employee.DisplayName,
//       email: employee.PrimaryEmailAddr ? employee.PrimaryEmailAddr.Address : ""
//     },
//     profiledata: {
//       address: employee.PrimaryAddr
//         ? employee.PrimaryAddr
//         : {
//           City: "",
//           Id: "",
//           CountrySubDivisionCode: "",
//           Line1: "",
//           PostalCode: ""
//         },
//       bio: "",
//       gender: employee.Gender ? employee.Gender : "Male",
//       dob: employee.BirthDate ? employee.BirthDate : "",
//       phone: employee.PrimaryPhone
//         ? employee.PrimaryPhone.FreeFormNumber.replace(/-|\s/g, "").substr(
//           employee.PrimaryPhone.FreeFormNumber.length - 9
//         )
//         : ""
//     },
//     qbconfig: {
//       QbId: employee.Id,
//       companyid: companyid,
//       sandbox: sandbox
//     },
//     fcmtokens: {
//       web: "",
//       apk: ""
//     },
//     config: {
//       viewsandbox: sandbox,
//       depotdata: {
//         depotid: "",
//         depotname: ""
//       },
//       approvedby: inituser
//     },
//     settings: {
//       fcm: {
//         payment: {
//           sandbox: sandbox,
//           live: !sandbox
//         },
//         trueck: {
//           sandbox: sandbox,
//           live: !sandbox
//         }
//       }
//     },
//     Active: employee.Active,
//     Id: employee.EmployeeNumber ? employee.EmployeeNumber : "",
//     status: {
//       online: false,
//       time: firestore.Timestamp.fromDate(new Date())
//     }
//   };
//   return newadmin;
// }

// function getallAdmins() {
//   //`settings.fcm.payment.live`, '===', true
//   // return firestore().collection('admins').get();
//   return firestore()
//     .collection("admins")
//     .get();
// }
