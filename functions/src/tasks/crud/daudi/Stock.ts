import { firestore } from 'firebase-admin';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

/**
 * This fetches the omc config given the id
 * @param omcId 
 */
export function readStock(omcId: string): Promise<DocumentSnapshot> {
    return stockCollection(omcId)
        .get();
}

export function stockCollection(omcId) {
    return firestore()
        .collection("omc")
        .doc(omcId)
        .collection("stock")
        .doc("kpc")
}
