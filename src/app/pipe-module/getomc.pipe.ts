import { Pipe, PipeTransform } from "@angular/core";
import { OmcService } from "../admin/services/core/omc.service";

@Pipe({
  name: "getomc"
})
export class GetomcPipe implements PipeTransform {

  constructor(private omc: OmcService) {

  }

  transform(omcid: string): any {
    if (this.omc.omcs.value.filter(omc => {
      return omc.Id === omcid;
    }).length !== 0) {
      return this.omc.omcs.value.filter(admin => {
        return admin.Id === omcid;
      })[0].name;
    } else {
      return "";
    }
  }

}
