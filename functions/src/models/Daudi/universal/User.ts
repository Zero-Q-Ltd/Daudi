import { firestore } from "firebase-admin";
export interface User {
    uid: string;
    name: string;
    time: firestore.Timestamp;
}
