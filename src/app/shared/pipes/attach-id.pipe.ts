import { Pipe, PipeTransform } from "@angular/core";
import { QuerySnapshot } from "@angular/fire/firestore";


export class AttachId {

  public transformArray<T>(emptyValue: T, data: any): T[] {
    if (!data) {
      return [];
    }
    return data.docs.map(d => {
      return {
        ...emptyValue, ...d.data(), ...{ Id: d.id },
      };
    });
  }

  public transformObject<T>(emptyValue: T, d: any): T {
    if (!d) {
      return null;
    }
    return {
      ...emptyValue, ...d.data(), ...{ Id: d.id }
    };
  }
}
