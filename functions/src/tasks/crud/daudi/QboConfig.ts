import { firestore } from 'firebase-admin';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
import { QboCofig, EmptyQboConfig } from '../../../models/Cloud/QboEnvironment';
import { createQbo } from '../../sharedqb';
import { toObject } from '../../../models/utils/SnapshotUtils';
import { QuickBooks } from '../../../libs/qbmain';

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
export function ReadAndInstantiate(omcId): Promise<{ config: QboCofig, qbo: QuickBooks }> {
    return new Promise<{ config: QboCofig, qbo: QuickBooks }>((resolve, reject) => {
        return readQboConfig(omcId).then(async snapshot => {
            const config = toObject(EmptyQboConfig, snapshot)
            const qbo = await createQbo(omcId, config, config.sandbox)
            resolve({ config, qbo })
        }).catch(e => {
            reject(e)
        })
    })
}
