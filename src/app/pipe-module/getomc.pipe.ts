import { Pipe, PipeTransform } from "@angular/core";
import { CoreService } from "../admin/services/core/core.service";

@Pipe({
  name: "getomc"
})
export class GetomcPipe implements PipeTransform {

  constructor(private core: CoreService) {

  }

  transform(omcid: string): any {
    if (this.core.omcs.value.filter(omc => {
      return omc.Id === omcid;
    }).length !== 0) {
      return this.core.omcs.value.filter(admin => {
        return admin.Id === omcid;
      })[0].name;
    } else {
      return "";
    }
  }

}
