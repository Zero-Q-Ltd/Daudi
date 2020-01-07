import { firestore } from 'firebase-admin';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
import { QboCofig } from '../../../models/Cloud/QboEnvironment';

/**
 * This fetches the omc config given the id
 * @param omcId 
 */
export function readQboConfig(omcId: string): Promise<DocumentSnapshot> {
    return configCollection(omcId)
        .get();
}

export function configCollection(omcId: string) {
    return firestore()
        .collection("omc")
        .doc(omcId)
        .collection("configs")
        .doc("qbo")
}
export function updateConfig(omcId: string, config: QboCofig) {
    return configCollection(omcId)
        .update(config)
}
