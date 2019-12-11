import { MyTimestamp } from "../../firestore/firestoreTypes";


export interface AssociatedUser {
    uid: string;
    name: string;
    time: MyTimestamp;
}


export const inituser: AssociatedUser = {
    name: "",
    time: null,
    uid: ""
};


