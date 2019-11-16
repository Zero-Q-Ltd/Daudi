import { firestore } from "firebase-admin";

export interface Meta {
    date: firestore.Timestamp;
    adminId: string;
}
