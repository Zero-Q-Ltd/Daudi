import { OMC } from "../../../../models/Daudi/omc/OMC";
import { Config } from "../../../../models/Daudi/omc/Config";
import { createQbo } from "../../../sharedqb";
import { firestore } from "firebase-admin";
import { Environment } from "../../../../models/Daudi/omc/Environments";
import { Depot } from "../../../../models/Daudi/depot/Depot";
import { Class } from "../../../../models/Qbo/Class";
import { QuickBooks } from "../../../../libs/qbmain";

/**
 * This is the generl initialization process for every tax configuration there is
 * Child methods are called by this primary one, because they are al under the same category
 * @param omc 
 * @param config 
 * @param environment 
 */
export function initTax(omc: OMC, config: Config, environment: Environment, qbo: QuickBooks) {

}