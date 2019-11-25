import { firestore } from "firebase";

export interface Meta {
    date: firestore.Timestamp;
    adminId: string;
}
