import { QuickBooks } from "../../libs/qbmain";
import { auth, firestore } from "firebase-admin";
import { Employee } from "../../models/Qbo/Employee";
import * as moment from "moment";
import { Admin } from "../../models/Daudi/admin/Admin";
import { deepCopy } from "../../models/utils/deepCopy";
import { EmptyAssociatedUser } from "../../models/Daudi/admin/AssociatedUser";
let allDbAdmins!: Array<Admin>;

/**
 * Fetches all the employees on qbo
 * Creates them as users on Daudi if they have emails, but their level has to be approved on the superadmin backend of Daudi
 * @param qbo
 */
export function syncAdmins(qbo: QuickBooks) {
  /**
   * Limit to 1000 customers for every sync operation
   */
  return qbo.findEmployees([{ Active: [true, false] }]).then(employees => {
    const alladmins: Array<Employee> = employees.QueryResponse.Employee;
    const batchwrite = firestore().batch();

    return Promise.all(
      alladmins.map(employee => {
        const qbAdmin = convertToDaudiadmin(
          employee,
          qbo.sandbox,
          qbo.companyid
        );
        /**
         * make sure that the admin doesn't exist before creating
         */
        return getallAdmins().then(admins => {
          allDbAdmins = admins.docs.map(ad => {
            const adm: Admin = ad.data() as Admin;
            adm.Id = ad.id;
            return adm;
          });
          /**
           * Update currently existing Admins
           * Use email as primary key
           */
          const adminexists = adminExists(qbAdmin.profile.email);
          if (adminexists) {
            /**
             * only update some fields
             */
            return batchwrite.update(
              firestore()
                .collection("admins")
                .doc(qbAdmin.Id),
              updateAdminFiields(qbAdmin, adminexists)
            );
          } else if (qbAdmin.profile.email) {
            /**
             * Create new Admin
             */
            /**
             * create the user with the specified email
             */

            return auth()
              .createUser({
                email: qbAdmin.profile.email,
                emailVerified: false,
                disabled: false,
                displayName: qbAdmin.profile.name
              })
              .then(result => {
                /**
                 * Commit for a batch write to Daudi
                 */
                console.log("successfully created Admin");
                console.log(result);
                qbAdmin.profile.uid = result.uid;
                batchwrite.update(
                  firestore()
                    .collection("admins")
                    .doc(result.uid),
                  qbAdmin
                );
                /**
                 * Update QBO
                 */

                employee.EmployeeNumber = result.uid;
                /**
                 * Somehow qbo throws an error if this field is missing, even if the original request didnt have it
                 */
                if (!employee.FamilyName) {
                  employee.FamilyName = "Empty";
                }
                return qbo.updateEmployee(employee);
              })
              .catch(err => {
                console.info("error creating account for");
                console.info(qbAdmin.profile.email);
                /**
                 * Probably this user exists, skip creating
                 */
                return auth()
                  .getUserByEmail(qbAdmin.profile.email)
                  .then(user => {
                    /**
                     * Update the database and add the user
                     * delete any information that should not be overwritten
                     */
                    delete qbAdmin.profile;
                    delete qbAdmin.config;
                    batchwrite.update(
                      firestore()
                        .collection("admins")
                        .doc(user.uid),
                      qbAdmin
                    );
                    /**
                     * Update qbos
                     */
                    employee.EmployeeNumber = user.uid;
                    if (!employee.FamilyName) {
                      employee.FamilyName = "Empty";
                    }
                    return qbo.updateEmployee(employee);
                  });
              });
          } else {
            console.log("Skipping Employee without email");
            return true;
          }
        });
      })
    ).then(res => {
      return batchwrite.commit();
    });
  });
}

function adminExists(adminEmail: string): Admin | null {
  if (
    allDbAdmins.filter(admin => {
      admin.profile.email === adminEmail;
    })
  ) {
    return allDbAdmins.filter(admin => {
      admin.profile.email === adminEmail;
    })[0];
  } else {
    return null;
  }
}

function updateAdminFiields(qbAdmin: Admin, dbAdmin: Admin): Admin {
  dbAdmin.profile = qbAdmin.profile;
  dbAdmin.Active = qbAdmin.Active;
  return qbAdmin;
}

function convertToDaudiadmin(
  employee: Employee,
  sandbox: boolean,
  companyid: string
): Admin {
  console.log("converting employee to Admin");
  const newadmin: Admin = {
    profile: {
      address: employee.PrimaryAddr
        ? employee.PrimaryAddr
        : {
            City: "",
            Id: "",
            CountrySubDivisionCode: "",
            Line1: "",
            PostalCode: ""
          },
      bio: null,
      dob: employee.BirthDate ? employee.BirthDate : "",
      gender: employee.Gender ? employee.Gender : "Male",
      phone: employee.PrimaryPhone
        ? employee.PrimaryPhone.FreeFormNumber.replace(/-|\s/g, "").substr(
            employee.PrimaryPhone.FreeFormNumber.length - 9
          )
        : "",
      photoURL: null,
      uid: null,
      name: employee.DisplayName,
      email: employee.PrimaryEmailAddr ? employee.PrimaryEmailAddr.Address : ""
    },

    config: {
      omcId: null,
      level: null,
      qbo: {
        QbId: employee.Id,
        companyid: companyid
      },
      approvedby: deepCopy(EmptyAssociatedUser),
      app: {
        depotid: null
      },
      fcm: {
        subscriptions: {
          payment: null,
          truck: null
        },
        tokens: {
          apk: null,
          web: null
        }
      },
      type: null
    },
    Active: employee.Active,
    Id: employee.EmployeeNumber ? employee.EmployeeNumber : "",
    status: {
      online: false,
      time: new Date()
    }
  };
  return newadmin;
}

function getallAdmins() {
  //`settings.fcm.payment.live`, '===', true
  // return firestore().collection('admins').get();
  return firestore()
    .collection("admins")
    .get();
}
