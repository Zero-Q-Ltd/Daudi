
export interface AssociatedUser {
    uid: string;
    name: string;
    time: Timestamp;
}


export const inituser: AssociatedUser = {
    name: "",
    time: Timestamp.fromDate(new Date()),
    uid: ""
};


