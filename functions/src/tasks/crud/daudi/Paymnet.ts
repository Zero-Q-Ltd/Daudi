import { firestore } from 'firebase-admin';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
import { QboCofig, EmptyQboConfig } from '../../../models/Cloud/QboEnvironment';
import { createQbo } from '../../sharedqb';
import { toObject } from '../../../models/utils/SnapshotUtils';
import { QuickBooks } from '../../../libs/qbmain';


export function paymentDoc(omcId: string, paymentId: string) {
    return firestore()
        .collection("omc")
        .doc(omcId)
        .collection("payments")
        .doc(paymentId)
}