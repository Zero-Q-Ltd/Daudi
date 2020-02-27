import { firestore } from 'firebase-admin';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

/**
 * This fetches the omc config given the id
 * @param omcId 
 */
export function readDepot(depotId: string): Promise<DocumentSnapshot> {
    return depotCollection(depotId)
        .get();
}

export function depotCollection(depotId: string) {
    return firestore()
        .collection("depots")
        .doc(depotId);
}