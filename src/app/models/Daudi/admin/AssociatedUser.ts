import { MyTimestamp } from "../../firestore/firestoreTypes";
import { Meta } from "../universal/Meta";


export interface AssociatedUser extends Meta {
    name: string;
}


export const EmptyAssociatedUser: AssociatedUser = {
    name: "",
    adminId: "",
    date: MyTimestamp.now()
};


