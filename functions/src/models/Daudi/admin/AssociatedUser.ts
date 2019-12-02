import { firestore } from "firebase-admin";

export type AssociatedUser = {
    uid: string;
    name: string;
    time: firestore.Timestamp;
};


export const inituser: AssociatedUser = {
    name: "",
    time: firestore.Timestamp.fromDate(new Date()),
    uid: ""
};


