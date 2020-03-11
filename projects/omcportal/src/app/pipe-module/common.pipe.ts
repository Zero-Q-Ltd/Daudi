import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'maptoArray'
})
export class MaptoArrayPipe implements PipeTransform {

  transform(map): any[] {
    console.log(Array.from(map.values()));
    if (map) {
      return Array.from(map.values());
    } else {
      return [];
    }
  }

}

@Pipe({
  name: 'formatOrders',
  pure: false
})
export class FormatOrdersPipe implements PipeTransform {
  transform(map, stage: 1 | 2 | 3 | 4 | 5 | 6 | 7): any {
    // console.log(map)
    // if (map ? map[activedepot].prices ?
    //   map[activedepot].prices.pricedetail ?
    //     map[activedepot].prices.pricedetail.price : false : false : false) {
    //   // console.log('object present')
    //   let size = map[activedepot].prices.pricedetail.price.length
    //   // console.log(size)
    //   if (size < 1) return null
    //   if(exampledata === 'price') return map[activedepot].prices.pricedetail.price[size - 1][exampledata]
    //   return map[activedepot].prices.pricedetail.price[size - 1][exampledata][objectext]
    // }
    // else {
    //   return 0
    // }
  }

}
