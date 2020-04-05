import { Pipe, PipeTransform } from "@angular/core";
import { firestore } from "firebase";

@Pipe({
  name: "parseDate"
})
export class ParseDatePipe implements PipeTransform {

  transform(value: any): Date {
    const t = value as firestore.Timestamp;
    return t ? t.toDate() : null;
  }

}
