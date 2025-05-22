import { StructuredData } from "./import-export.interface";

export class FileImportExportUtility {
  public static getColumnIndex(columns: Array<{ label: string; key: string }>, columnName: string): number {
    return columns.findIndex(col => col.key === columnName) + 1;
  }

  public static getColumnLabel(defaultColumns: Array<{ label: string; key: string }>, key: string) {
    return defaultColumns.find(col => col.key === key).label;
  }

  public static buildExcelToStructuredJson(excelData: Array<Array<any>>, columns: Array<{ label: string; key: string }>): Array<StructuredData> {
    return excelData
      .filter(row => row.length)
      .map(row => {
        return columns.reduce((newEmpObj, column, index) => {
          const data: string = row[index] ? (typeof row[index] === "string" ? row[index].trim() : row[index].toString()) : null;
          return { ...newEmpObj, [column.key]: data };
        }, {} as StructuredData);
      });
  }

  // public static formatExportDataByLocale(fileFormat: FileFormatsEnum, data: Array<StructuredData>, columns: Array<{ label: string; key: string }>) {
  //   if (fileFormat === FileFormatsEnum.csv || fileFormat === FileFormatsEnum.xls || fileFormat === FileFormatsEnum.xlsx) {
  //     if (data.length) {
  //       return data.map(doc => {
  //         return Object.keys(doc).reduce((docObj, key) => {
  //           return { ...docObj, [this.getColumnLabel(columns, key)]: doc[key] };
  //         }, {});
  //       });
  //     }
  //     return columns.reduce((nullObj, col) => {
  //       return { ...nullObj, [col.label]: null };
  //     }, {});
  //   }
  // }
}
