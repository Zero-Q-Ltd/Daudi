import { WhereFilterOp } from "@google-cloud/firestore";
import { FieldPath } from "@angular/fire/firestore";

export interface FirestoreQuery {
    fieldPath: string | FieldPath;
    opStr: WhereFilterOp;
    value: any;
}
