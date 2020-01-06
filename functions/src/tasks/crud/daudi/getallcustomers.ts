import { firestore } from "firebase-admin";
export function getallcustomers(omcId: string) {
    return firestore()
        .collection("omc")
        .doc(omcId)
        .collection("customers")
        .get();
}
