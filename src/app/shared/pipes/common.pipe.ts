import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: "common"
})
export class CommonPipe implements PipeTransform {

    transform(value: any, args?: any): any {
        return null;
    }

}
