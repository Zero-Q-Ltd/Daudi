import { firestore } from 'firebase-admin';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

/**
 * This fetches the omc config given the id
 * @param omcId 
 */
export function readStock(omcId: string, depotId: string, privateDepot: boolean): Promise<DocumentSnapshot> {
    return kpcStockCollection(omcId)
        .get();
}

export function kpcStockCollection(omcId: string) {
    return firestore()
        .collection("omc")
        .doc(omcId)
        .collection("stock")
        .doc("kpc");
}

export function privateStockCollection(omcId: string, depotId: string) {
    return firestore()
        .collection("omc")
        .doc(omcId)
        .collection("stock")
        .doc(depotId);
}
