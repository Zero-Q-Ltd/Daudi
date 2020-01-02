import { Pipe, PipeTransform } from "@angular/core";
import { QuerySnapshot } from "@angular/fire/firestore";


export class AttachId {

  public transformArray<T>(emptyValue: T, data: any): T[] {
    return data.docs.map(d => {
      console.log(d.id);
      return {
        ...emptyValue, ...d.data(), ...{ Id: d.id },
      };
    });
  }

  public transformObject<T>(emptyValue: T, d: any): T {
    return {
      ...emptyValue, ...d.data(), ...{ Id: d.id }
    };
  }
}
