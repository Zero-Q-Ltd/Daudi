import { QuickBooks } from "../../libs/qbmain";
import { auth, firestore } from "firebase-admin";
import { Employee } from "../../models/Qbo/Employee";
import * as moment from "moment";
import { Admin, emptyadmin } from "../../models/Daudi/admin/Admin";
import { deepCopy } from "../../models/utils/deepCopy";
import { EmptyAssociatedUser } from "../../models/Daudi/admin/AssociatedUser";
import { toArray } from "../../models/utils/SnapshotUtils";
let allDbAdmins!: Array<Admin>;

/**
 * Fetches all the employees on qbo
 * Creates them as users on Daudi if they have emails, but their level has to be approved on the superadmin backend of Daudi
 * @param qbo
 */
export function syncAdmins(qbo: QuickBooks, omcId: string) {
  /**
   * Limit to 1000 customers for every sync operation
   */
  return qbo.findEmployees([{ Active: [true, false] }]).then((employees) => {
    const alladmins: Array<Employee> = employees.QueryResponse.Employee;
    const batchwrite = firestore().batch();

    return Promise.all(
      alladmins.map((employee) => {
        const qbAdmin = convertToDaudiadmin(employee, omcId, qbo.companyid);
        /**
         * make sure that the admin doesn't exist before creating
         */
        return getallAdmins().then((admins) => {
          allDbAdmins = toArray(emptyadmin, admins);
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
              firestore().collection("admins").doc(qbAdmin.Id),
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
                displayName: qbAdmin.profile.name,
              })
              .then((result) => {
                /**
                 * Commit for a batch write to Daudi
                 */
                console.log("successfully created Admin");
                console.log(result);
                qbAdmin.profile.uid = result.uid;
                return batchwrite.set(
                  firestore().collection("admins").doc(result.uid),
                  qbAdmin
                );
              })
              .catch((err) => {
                console.info("error creating account for");
                console.info(qbAdmin.profile.email);
                /**
                 * Probably this user exists, skip creating
                 */
                return auth()
                  .getUserByEmail(qbAdmin.profile.email)
                  .then((user) => {
                    /**
                     * Update the database and add the user
                     * delete any information that should not be overwritten
                     */
                    // delete qbAdmin.profile;
                    // delete qbAdmin.config;
                    return batchwrite.set(
                      firestore().collection("admins").doc(user.uid),
                      qbAdmin
                    );
                  });
              });
          } else {
            console.log("Skipping Employee without email");
            return true;
          }
        });
      })
    ).then((res) => {
      return batchwrite.commit();
    });
  });
}

function adminExists(adminEmail: string): Admin | null {
  if (
    allDbAdmins.some((admin) => {
      admin.profile.email === adminEmail;
    })
  ) {
    return allDbAdmins.filter((admin) => {
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
  omcId: string,
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
            PostalCode: "",
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
      email: employee.PrimaryEmailAddr ? employee.PrimaryEmailAddr.Address : "",
    },

    config: {
      omcId: omcId,
      level: null,
      qbo: {
        QbId: employee.Id,
        companyid: companyid,
      },
      approvedby: deepCopy(EmptyAssociatedUser),
      app: {
        depotid: null,
      },
      fcm: {
        subscriptions: {
          payment: null,
          truck: null,
        },
        tokens: {
          apk: null,
          web: null,
        },
      },
      type: null,
    },
    Active: employee.Active,
    Id: employee.EmployeeNumber ? employee.EmployeeNumber : "",
    status: {
      online: false,
      time: new Date(),
    },
  };
  return newadmin;
}

function getallAdmins() {
  //`settings.fcm.payment.live`, '===', true
  // return firestore().collection('admins').get();
  return firestore().collection("admins").get();
}
