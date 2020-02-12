import { firestore } from 'firebase-admin';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

/**
 * This fetches the omc config given the id
 * @param omcId 
 */
export function readStock(omcId: string, depotId: string, privateDepot: boolean): Promise<DocumentSnapshot> {
    return stockCollection(omcId, depotId, privateDepot)
        .get();
}

export function stockCollection(omcId: string, depotId: string, privateDepot: boolean) {
    if (privateDepot) {
        return firestore()
            .collection("omc")
            .doc(omcId)
            .collection("stock")
            .doc(depotId);
    } else {
        return firestore()
            .collection("omc")
            .doc(omcId)
            .collection("stock")
            .doc('kpc');
    }
}
