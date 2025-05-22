import * as moment from "moment";
import { ReportData } from "../report.interface";

export class ReportUtils {
  public static setHeader(sheet, input: ReportData<any>) {
    const DATE_FORMAT = "MMMM Do YYYY, h:mm:ss a"; // July 13th 2022, 5:47:37 pm
    const companyName = input.company.name;
    const companyAddress = input.company.information.address.readable();
    const eventName = `${input.company.name}-${input.event.name}`;
    const eventDate = `${moment(new Date( (new Date(input.event.startAt)).getTime() + 480 * 60 * 1000)).format(DATE_FORMAT)} - ${moment(new Date( (new Date(input.event.endAt)).getTime()+ 480 * 60 * 1000)).format(DATE_FORMAT)}`;
    sheet.mergeCells("B1:K1");
    sheet.mergeCells("B2:K2");
    sheet.mergeCells("B3:K3");
    sheet.mergeCells("B4:K4");
    sheet.mergeCells("B5:K5");
    sheet.getCell("B1").font = {
      name: "Arial Black",
      family: 2,
      size: 10
    };
    sheet.getCell("B1").font = {
      name: "Arial Black",
      family: 2,
      size: 10
    };
    sheet.getCell("B2").font = {
      name: "Arial Black",
      family: 2,
      size: 10
    };
    sheet.getCell("B3").font = {
      name: "Arial Black",
      family: 2,
      size: 10
    };
    sheet.getCell("B4").font = {
      name: "Arial Black",
      family: 2,
      size: 10
    };
    sheet.getCell("B5").font = {
      name: "Arial Black",
      family: 2,
      size: 10
    };
    sheet.getCell("B1").alignment = { vertical: "middle", horizontal: "center" };
    sheet.getCell("B2").alignment = { vertical: "middle", horizontal: "center" };
    sheet.getCell("B3").alignment = { vertical: "middle", horizontal: "center" };
    sheet.getCell("B4").alignment = { vertical: "middle", horizontal: "center" };

    sheet.getCell("B1").value = `${companyName}`;
    sheet.getCell("B2").value = `${companyAddress}`;
    sheet.getCell("B3").value = `${eventName}`;
    sheet.getCell("B4").value = `${eventDate}`;
  }
}
