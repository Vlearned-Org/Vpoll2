import { Proxy, Shareholder } from "@app/data/model";
import { VoterTypeEnum } from "@vpoll-shared/enum";
import { ProxyConsolidatedReportData } from "../report.interface";
import { ReportUtils } from "./report.utils";

const Excel = require("exceljs");
const stream = require("stream");

export class ProxyConsolidatedVotingReport {
  public static async generate(input: ProxyConsolidatedReportData) {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Proxy Voting Consolidated");
    ReportUtils.setHeader(worksheet, input);

    const resolutions = input.event.resolutions;
    worksheet.getRow(6).values = [
      "No",
      "Shareholder Identification No",
      "Shareholder Name",
      "Shareholder CDS",
      ...resolutions.map(r => `${r.type} R${r.index}`),
      "Proxy as Chairman",
      "Chairman as 2nd Proxy",
      "Proxy Name",
      "Proxy Identification No",
      "Proxy Shares",
      "Proxy Email"
    ];
    worksheet.columns = [
      { key: "index", width: 10 },
      { key: "shareholderNric", width: 20 },
      { key: "shareholderName", width: 35 },
      { key: "shareholderCds", width: 15 },
      ...resolutions.map(r => ({ key: r.type+r.index, width: 10 })),
      { key: "proxyAsChairman", width: 10 },
      { key: "chairmanAs2ndproxy", width: 10 },
      { key: "proxyName", width: 35 },
      { key: "proxyNric", width: 20 },
      { key: "proxyShares", width: 18 },
      { key: "proxyEmail", width: 18 }
    ];
    input.data.forEach((voting, index) => {
      const shareholder = voting.shareholderId as Shareholder;
      const proxy = voting.proxyId as Proxy;
      const row = {
        index: index + 1,
        shareholderNric: shareholder.identityNumber,
        shareholderName: shareholder.name,
        shareholderCds: shareholder.cds,
        proxyAsChairman: voting.voterType === VoterTypeEnum.CHAIRMAN ? "YES" : "NO",
        chairmanAs2ndproxy : proxy.voteSetting.chairmanVoteOnBehalf,
        proxyName: proxy.name,
        proxyNric: proxy.identityNumber,
        proxyShares: proxy.allocatedShares,
        proxyEmail: proxy.email
      };
      resolutions.forEach(reso => {
        const voteEntry = voting.result.find(entry => entry.resolutionId.toString() === reso._id.toString());
        row[reso.type+reso.index] = voteEntry.response;
        console.log(reso.index);
      });
      worksheet.addRow(row);
    });

    const readStream = new stream.PassThrough();
    await workbook.xlsx.write(readStream);
    return readStream;
  }
}
