import { Timestamp } from "@google-cloud/firestore";


export interface Meta {
    date: Timestamp;
    adminId: string;
}

export const emptyMeta: Meta = {
    adminId: null,
    date: Timestamp.now()
};
