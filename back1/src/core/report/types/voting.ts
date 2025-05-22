import { Proxy, Resolution, Shareholder } from "@app/data/model";
import { VoterTypeEnum } from "@vpoll-shared/enum";
import { VotingReportData } from "../report.interface";
import { ReportUtils } from "./report.utils";

const Excel = require("exceljs");
const stream = require("stream");

export class VotingReport {
  public static async generate(input: VotingReportData) {
    const workbook = new Excel.Workbook();
    this.buildMainPage(workbook, input);

    input.event.resolutions.forEach(resolution => {
      this.buildResolutionPage(workbook, resolution, input);
    });

    const readStream = new stream.PassThrough();
    await workbook.xlsx.write(readStream);
    return readStream;
  }

  private static buildMainPage(workbook, input: VotingReportData) {
    const mainWorksheet = workbook.addWorksheet("Resolutions");
    ReportUtils.setHeader(mainWorksheet, input);
    this.setMainColumn(mainWorksheet);
    
    mainWorksheet.pageSetup = {
      fitToPage: true, 
      fitToWidth: 1,
      fitToHeight: 1
    };
    input.data.results.sort((a, b) => a.index - b.index);
    input.data.results.forEach(result => {
      const row = {
        index: result.index,
        resoTitle: result.type +" "+result.index,
        // resoType: result.type,
        forUnits: result.for.unit,
        forPercent: result.for.percentage,
        forRecords: result.for.record,
        againstUnits: result.against.unit,
        againstPercent: result.against.percentage,
        againstRecords: result.against.record,
        totalUnits: result.totalSharesExcludeAbstain,
        totalPercent: result.for.percentage + result.against.percentage,
        totalRecords: result.for.record + result.against.record,
        result: result.result
      };
      mainWorksheet.addRow(row);
    });
    this.applyStyles(mainWorksheet);
  }

  private static applyStyles(worksheet) {
    // Apply styles starting from row 6
    worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
      if (rowNumber >= 6) { // Starts applying styles from row 6
        row.eachCell({ includeEmpty: true }, function(cell) {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }
    });
  }

  private static buildResolutionPage(workbook, resolution: Resolution, input: VotingReportData) {
    const worksheet = workbook.addWorksheet(`${resolution.type} Resolution ${resolution.index}`);
    worksheet.pageSetup = {
      fitToPage: true, 
      fitToWidth: 1,
      fitToHeight: 1
    };
    ReportUtils.setHeader(worksheet, input);
    worksheet.getRow(6).values = [
      "No",
      "CDS",
      "Vote By",
      "Vote For",
      "Number Of Shares",
      "Vote By Chairman",
      "Vote Type",
      "ShareHolder Type",
      "Large Shareholder"
    ];
    worksheet.columns = [
      { key: "index", width: 5 },
      { key: "cds", width: 18 },
      { key: "voteBy", width: 30 },
      { key: "voteFor", width: 30 },
      { key: "noOfShares", width: 15 },
      { key: "voteByChairman", width: 18 },
      { key: "voteType", width: 15 },
      { key: "shareholderType", width: 18 },
      { key: "largeShareholder", width: 18 }
    ];
    input.data.votings.forEach((vote, index) => {
      const shareholder = vote.shareholderId as Shareholder;
      let voteBy;
      if (vote.voterType === VoterTypeEnum.SHAREHOLDER) {
        voteBy = shareholder.name;
      } else {
        const proxy = vote.proxyId as Proxy;
        voteBy = proxy.name;
      }

      const entry = vote.result.find(entry => entry.resolutionId.toString() === resolution._id.toString());
      const row = {
        index: index + 1,
        cds: shareholder.cds,
        voteBy,
        voteFor: shareholder.name,
        noOfShares: entry.numberOfShares,
        voteByChairman: vote.voterType === VoterTypeEnum.CHAIRMAN ? "YES" : "NO",
        voteType: entry.response,
        shareholderType: vote.voterType,
        largeShareholder: shareholder.isLargeShareholder ? "YES" : "NO"
      };
      worksheet.addRow(row);
    });
  }

  private static setMainColumn(sheet) {
    sheet.mergeCells("A6:A7");
    sheet.mergeCells("B6:B7");
    // sheet.mergeCells("C6:C7");
    sheet.mergeCells("C6:E6");
    sheet.mergeCells("F6:H6");
    sheet.mergeCells("I6:K6");
    sheet.mergeCells("L6:L7");
    sheet.getCell("A6").value = "No";
    sheet.getCell("B6").value = "Resolution";
    // sheet.getCell("C6").value = "Resolution Type";
    sheet.getCell("C6").value = "Voted For";
    sheet.getCell("C7").value = "Units";
    sheet.getCell("D7").value = "%";
    sheet.getCell("E7").value = "Records";
    sheet.getCell("F6").value = "Voted Against";
    sheet.getCell("F7").value = "Units";
    sheet.getCell("G7").value = "%";
    sheet.getCell("H7").value = "Records";
    sheet.getCell("I6").value = "Total";
    sheet.getCell("I7").value = "Units";
    sheet.getCell("J7").value = "%";
    sheet.getCell("K7").value = "Records";
    sheet.getCell("L6").value = "Result";

    sheet.columns = [
      { key: "index", width: 5 },
      { key: "resoTitle", width: 15 },
      // { key: "resoType", width: 15 },
      { key: "forUnits", width: 15 },
      { key: "forPercent", width: 10 },
      { key: "forRecords", width: 10 },
      { key: "againstUnits", width: 15 },
      { key: "againstPercent", width: 10 },
      { key: "againstRecords", width: 10 },
      { key: "totalUnits", width: 15 },
      { key: "totalPercent", width: 10 },
      { key: "totalRecords", width: 10 },
      { key: "result", width: 20 }
    ];
  }
}
