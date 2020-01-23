import { MyTimestamp } from '../../firestore/firestoreTypes';

export interface DaudiMeta {
    date: MyTimestamp;
    adminId: string;
}

export const emptyMeta: DaudiMeta = {
    adminId: null,
    date: MyTimestamp.now()
};
