import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: "countdown"
})
export class CountdownPipe implements PipeTransform {

    transform(value: any, args?: any): any {
        return null;
    }

}
