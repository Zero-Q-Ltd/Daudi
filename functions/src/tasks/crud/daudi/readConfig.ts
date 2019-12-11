import { firestore } from 'firebase-admin';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
/**
 * This fetches the omc config given the id
 * @param omcId 
 */
export function readConfig(omcId: string): Promise<DocumentSnapshot> {
    return firestore()
        .collection("omc")
        .doc(omcId)
        .collection("config")
        .doc("main")
        .get();
}