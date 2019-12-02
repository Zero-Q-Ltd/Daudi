import { firestore } from "firebase";


export interface Meta {
    date: firestore.Timestamp;
    adminId: string;
}

export const emptyMeta: Meta = {
    adminId: null,
    date: firestore.Timestamp.now()
};