import { firestore } from "firebase";
export interface User {
    uid: string;
    name: string;
    time: firestore.Timestamp;
}
