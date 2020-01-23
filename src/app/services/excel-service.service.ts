import {Injectable} from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})

export class ExcelService {
  constructor() {
  }

  public exportAsExcelFile(datasource: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datasource.map(data => {
      return this.flattenObject(data);
    }));
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    const excelBuffer: any = XLSX.write(workbook, {bookType: 'xlsx', type: 'array'});
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  private flattenObject(ob: any): any {
    const toReturn = {};

    for (const key in ob) {
      if (!ob.hasOwnProperty(key)) {
        continue;
      }
      if ((typeof ob[key]) === 'object') {
        const flatObject = this.flattenObject(ob[key]);
        for (const key2 in flatObject) {
          if (!flatObject.hasOwnProperty(key2)) {
            continue;
          }
          // this.logger.debug(`adding ${key + '.' + key2}:${flatObject[key2]}`);
          toReturn[key + '.' + key2] = flatObject[key2];
        }
      } else {
        // this.logger.debug(`adding ${key}:${ob[key]}`);
        toReturn[key] = ob[key];
      }
    }
    return toReturn;
  };

}

