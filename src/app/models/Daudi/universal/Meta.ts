import {MyTimestamp} from "../../firestore/firestoreTypes";

export interface Meta {
    date: MyTimestamp;
    adminId: string;
}

export const emptyMeta: Meta = {
    adminId: null,
    date: MyTimestamp.now()
};
