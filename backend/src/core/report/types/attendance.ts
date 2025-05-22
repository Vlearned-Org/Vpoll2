import { Shareholder } from "@app/data/model";
import { RoleEnum } from "@vpoll-shared/enum";
import { AttendanceReportData, InviteeAttendanceRowData, ShareholderProxyAttendanceRowData , CorporateAttendanceRowData
,InviteeLeaveRowData,ShareholderProxyLeaveRowData,CorporateLeaveRowData} from "../report.interface";
import { ReportUtils } from "./report.utils";

const Excel = require("exceljs");
const stream = require("stream");

export class AttendanceReport {
  public static async generate(input: AttendanceReportData) {
    const { shareholderAttendance, proxyAttendance, inviteeAttendance ,corporateAttendance } = this.categoriesAttendance(input);
    const { shareholderLeave, proxyLeave, inviteeLeave ,corporateLeave } = this.categoriesLeave(input);
    const workbook = new Excel.Workbook();
    const shareholderAttendanceSheet = workbook.addWorksheet("Shareholder Attendance");
    const proxyAttendanceSheet = workbook.addWorksheet("Proxy Attendance");
    const inviteeAttendanceSheet = workbook.addWorksheet("Invitee Attendance");
    const corporateAttendanceSheet = workbook.addWorksheet("Corporate Representative Attendance");
    ReportUtils.setHeader(shareholderAttendanceSheet, input);
    ReportUtils.setHeader(proxyAttendanceSheet, input);
    ReportUtils.setHeader(inviteeAttendanceSheet, input);
    ReportUtils.setHeader(corporateAttendanceSheet, input);
    this.setSheetColumns(shareholderAttendanceSheet, proxyAttendanceSheet, inviteeAttendanceSheet,corporateAttendanceSheet);


    shareholderAttendance.forEach(att => shareholderAttendanceSheet.addRow(att));
    proxyAttendance.forEach(att => proxyAttendanceSheet.addRow(att));
    inviteeAttendance.forEach(att => inviteeAttendanceSheet.addRow(att));
    corporateAttendance.forEach(att => corporateAttendanceSheet.addRow(att));

    const readStream = new stream.PassThrough();
    await workbook.xlsx.write(readStream);
    return readStream;
  }

  private static setSheetColumns(shareholderAttendanceSheet, proxyAttendanceSheet, inviteeAttendanceSheet,corporateAttendanceSheet) {
    /*Column headers*/
    shareholderAttendanceSheet.getRow(5).values = ["No", "Shareholder Name", "Identification No", "Attend At","Leave At","Duration", "CDS", "Number of Shares"];
    proxyAttendanceSheet.getRow(5).values = ["No", "Proxy Name", "Identification No", "Attend At","Leave At","Duration", "CDS", "Number of Shares"];
    inviteeAttendanceSheet.getRow(5).values = ["No", "Invitee Name", "Mobile No", "Attend At", "Leave At","Duration"];
    corporateAttendanceSheet.getRow(5).values = ["No", "Representative Name", "Mobile No", "Attend At", "Leave At","Duration"];

    shareholderAttendanceSheet.columns = [
      { key: "index", width: 10 },
      { key: "name", width: 35 },
      { key: "nric", width: 20 },
      { key: "joinAt", width: 15 },
      { key: "leaveAt", width: 15 },
      { key: "duration", width: 15 },
      { key: "cds", width: 15 },
      { key: "numberOfShares", width: 18 }
    ];
    proxyAttendanceSheet.columns = [
      { key: "index", width: 10 },
      { key: "name", width: 35 },
      { key: "nric", width: 20 },
      { key: "joinAt", width: 15 },
      { key: "leaveAt", width: 15 },
      { key: "duration", width: 15 },
      { key: "cds", width: 15 },
      { key: "numberOfShares", width: 18 }
    ];
    inviteeAttendanceSheet.columns = [
      { key: "index", width: 10 },
      { key: "name", width: 35 },
      { key: "mobile", width: 20 },
      { key: "joinAt", width: 15 },
      { key: "leaveAt", width: 15 },
      { key: "duration", width: 15 },
    ];
    corporateAttendanceSheet.columns = [
      { key: "index", width: 10 },
      { key: "name", width: 35 },
      { key: "mobile", width: 20 },
      { key: "joinAt", width: 15 },
      { key: "leaveAt", width: 15 },
      { key: "duration", width: 15 },
    ];
  }

  private static categoriesAttendance(input: AttendanceReportData): {
    shareholderAttendance: ShareholderProxyAttendanceRowData[];
    proxyAttendance: ShareholderProxyAttendanceRowData[];
    inviteeAttendance: InviteeAttendanceRowData[];
    corporateAttendance: CorporateAttendanceRowData[];
  } {
    let shareholderIndex = 0;
    let proxyIndex = 0;
    let inviteeIndex = 0;
    let corporateIndex = 0;
    let shareholderAttendance: ShareholderProxyAttendanceRowData[] = [];
    let proxyAttendance: ShareholderProxyAttendanceRowData[] = [];
    let inviteeAttendance: InviteeAttendanceRowData[] = [];
    let corporateAttendance: CorporateAttendanceRowData[] = [];
    for (let att of input.data.attendance) {
      if (att.data.role === RoleEnum.SHAREHOLDER) {
        const shareholder = input.data.shareholders.find(shareholder => shareholder._id.toString() === att.data.ref.toString());

        const leavedatas = input.data.leave.filter(leavedata => leavedata.data.ref.toString() === shareholder._id.toString());
        let leavedata;
        // Check if there are any matches
        if (leavedatas.length > 0) {
          // Sort the matches by the `leaveAt` datetime in descending order
          leavedatas.sort((a, b) => new Date(b.data.leaveAt).getTime() - new Date(a.data.leaveAt).getTime());

          // The item with the latest datetime will be the first item in the sorted array
          leavedata = leavedatas[0];

          // Now, `latestLeaveData` contains the item with the latest `leaveAt` datetime
          console.log('Latest Leave Data:', leavedata);
        } else {
          leavedata = leavedatas[0];
          console.log('No matching leave data found.');
        }
        
      // Calculate the duration in milliseconds
      const joinTime = new Date(att.data.joinAt).getTime();
      const leaveTime = leavedata && leavedata.data && leavedata.data.leaveAt
      ? new Date(leavedata.data.leaveAt).getTime()
      : new Date(input.event.endAt).getTime();
      const durationInMilliseconds = leaveTime - joinTime;

      // Convert duration to hours and minutes
      const durationHours = Math.floor(durationInMilliseconds / (60 * 60 * 1000));
      const durationMinutes = Math.floor((durationInMilliseconds % (60 * 60 * 1000)) / (60 * 1000));

      // Now, `latestLeaveData` contains the item with the latest `leaveAt` datetime
      console.log('Latest Leave Data:', leavedata);

        shareholderIndex++;
        const originalDate = new Date(att.data.joinAt);
        const offsetMinutes = -480;
        const adjustedDate = new Date(originalDate.getTime() - offsetMinutes * 60 * 1000);

        const originalDate2 = leavedata && leavedata.data && leavedata.data.leaveAt
        ? new Date(leavedata.data.leaveAt)
        : new Date(input.event.endAt);
        const offsetMinutes2 = -480;
        const adjustedDate2 = new Date(originalDate2.getTime() - offsetMinutes2 * 60 * 1000);        

        shareholderAttendance.push({
          index: shareholderIndex,
          name: shareholder.name,
          nric: shareholder.identityNumber,
          joinAt: adjustedDate,
          leaveAt:adjustedDate2,
          duration: `${durationHours} hours ${durationMinutes} minutes`,
          cds: shareholder.cds,
          numberOfShares: shareholder.numberOfShares
          
        });
      } else if (att.data.role === RoleEnum.PROXY) {
        const proxy = input.data.proxies.find(prox => prox._id.toString() === att.data.ref.toString());

        const leavedatas = input.data.leave.filter(leavedata => leavedata.data.ref.toString() === proxy._id.toString());
        let leavedata;
        // Check if there are any matches
        if (leavedatas.length > 0) {
          // Sort the matches by the `leaveAt` datetime in descending order
          leavedatas.sort((a, b) => new Date(b.data.leaveAt).getTime() - new Date(a.data.leaveAt).getTime());

          // The item with the latest datetime will be the first item in the sorted array
          leavedata = leavedatas[0];

          // Now, `latestLeaveData` contains the item with the latest `leaveAt` datetime
          console.log('Latest Leave Data:', leavedata);
        } else {
          leavedata = leavedatas[0];
          console.log('No matching leave data found.');
        }

              // Calculate the duration in milliseconds
        const joinTime = new Date(att.data.joinAt).getTime();
        const leaveTime = leavedata && leavedata.data && leavedata.data.leaveAt
        ? new Date(leavedata.data.leaveAt).getTime()
        : new Date(input.event.endAt).getTime();
        const durationInMilliseconds = leaveTime - joinTime;

        // Convert duration to hours and minutes
        const durationHours = Math.floor(durationInMilliseconds / (60 * 60 * 1000));
        const durationMinutes = Math.floor((durationInMilliseconds % (60 * 60 * 1000)) / (60 * 1000));

        // Now, `latestLeaveData` contains the item with the latest `leaveAt` datetime
        console.log('Latest Leave Data:', leavedata);

        proxyIndex++;
        const originalDate = new Date(att.data.joinAt);
        const offsetMinutes = -480;
        const adjustedDate = new Date(originalDate.getTime() - offsetMinutes * 60 * 1000);

        const originalDate2 = leavedata && leavedata.data && leavedata.data.leaveAt
        ? new Date(leavedata.data.leaveAt)
        : new Date(input.event.endAt);
        const offsetMinutes2 = -480;
        const adjustedDate2 = new Date(originalDate2.getTime() - offsetMinutes2 * 60 * 1000);    
        proxyAttendance.push({
          index: proxyIndex,
          name: proxy.name,
          nric: proxy.identityNumber,
          joinAt: adjustedDate,
          leaveAt:adjustedDate2,
          duration: `${durationHours} hours ${durationMinutes} minutes`,
          cds: (proxy.shareholderId as Shareholder).cds,
          numberOfShares: proxy.allocatedShares
          
        });
      } else if (att.data.role === RoleEnum.INVITEE) {
        const invitee = input.data.invitees.find(invitee => invitee._id.toString() === att.data.ref.toString());
        const leavedatas = input.data.leave.filter(leavedata => leavedata.data.ref.toString() === invitee._id.toString());
        let leavedata;
        // Check if there are any matches
        if (leavedatas.length > 0) {
          // Sort the matches by the `leaveAt` datetime in descending order
          leavedatas.sort((a, b) => new Date(b.data.leaveAt).getTime() - new Date(a.data.leaveAt).getTime());

          // The item with the latest datetime will be the first item in the sorted array
          leavedata = leavedatas[0];

          // Now, `latestLeaveData` contains the item with the latest `leaveAt` datetime
          console.log('Latest Leave Data:', leavedata);
        } else {
          leavedata = leavedatas[0];
          console.log('No matching leave data found.');
        }

              // Calculate the duration in milliseconds
        const joinTime = new Date(att.data.joinAt).getTime();
        const leaveTime = leavedata && leavedata.data && leavedata.data.leaveAt
        ? new Date(leavedata.data.leaveAt).getTime()
        : new Date(input.event.endAt).getTime();
        const durationInMilliseconds = leaveTime - joinTime;

        // Convert duration to hours and minutes
        const durationHours = Math.floor(durationInMilliseconds / (60 * 60 * 1000));
        const durationMinutes = Math.floor((durationInMilliseconds % (60 * 60 * 1000)) / (60 * 1000));

        // Now, `latestLeaveData` contains the item with the latest `leaveAt` datetime
        console.log('Latest Leave Data:', leavedata);

        
        inviteeIndex++;
        const originalDate = new Date(att.data.joinAt);
        const offsetMinutes = -480;
        const adjustedDate = new Date(originalDate.getTime() - offsetMinutes * 60 * 1000);

        const originalDate2 = leavedata && leavedata.data && leavedata.data.leaveAt
        ? new Date(leavedata.data.leaveAt)
        : new Date(input.event.endAt);
        const offsetMinutes2 = -480;
        const adjustedDate2 = new Date(originalDate2.getTime() - offsetMinutes2 * 60 * 1000);    
        inviteeAttendance.push({ index: inviteeIndex, name: invitee.name, mobile: invitee.mobile, joinAt: adjustedDate,leaveAt:adjustedDate2,duration: `${durationHours} hours ${durationMinutes} minutes` });
      }else if (att.data.role === RoleEnum.CORPORATE) {
        const corporate = input.data.corporates.find(corporate => corporate._id.toString() === att.data.ref.toString());
        const leavedatas = input.data.leave.filter(leavedata => leavedata.data.ref.toString() === corporate._id.toString());
        let leavedata;
        // Check if there are any matches
        if (leavedatas.length > 0) {
          // Sort the matches by the `leaveAt` datetime in descending order
          leavedatas.sort((a, b) => new Date(b.data.leaveAt).getTime() - new Date(a.data.leaveAt).getTime());

          // The item with the latest datetime will be the first item in the sorted array
          leavedata = leavedatas[0];

          // Now, `latestLeaveData` contains the item with the latest `leaveAt` datetime
          console.log('Latest Leave Data:', leavedata);
        } else {
          leavedata = leavedatas[0];
          console.log('No matching leave data found.');
        }
        // Calculate the duration in milliseconds
        const joinTime = new Date(att.data.joinAt).getTime();
        const leaveTime = leavedata && leavedata.data && leavedata.data.leaveAt
        ? new Date(leavedata.data.leaveAt).getTime()
        : new Date(input.event.endAt).getTime();
        const durationInMilliseconds = leaveTime - joinTime;

        // Convert duration to hours and minutes
        const durationHours = Math.floor(durationInMilliseconds / (60 * 60 * 1000));
        const durationMinutes = Math.floor((durationInMilliseconds % (60 * 60 * 1000)) / (60 * 1000));

        // Now, `latestLeaveData` contains the item with the latest `leaveAt` datetime
        console.log('Latest Leave Data:', leavedata);



        corporateIndex++;
        const originalDate = new Date(att.data.joinAt);
        const offsetMinutes =-480;
        const adjustedDate = new Date(originalDate.getTime() - offsetMinutes * 60 * 1000);

        const originalDate2 = leavedata && leavedata.data && leavedata.data.leaveAt
        ? new Date(leavedata.data.leaveAt)
        : new Date(input.event.endAt);
        const offsetMinutes2 = -480;
        const adjustedDate2 = new Date(originalDate2.getTime() - offsetMinutes2 * 60 * 1000);    
        corporateAttendance.push({ index: corporateIndex, name: corporate.name, mobile: corporate.mobile, joinAt: adjustedDate,leaveAt:adjustedDate2 ,duration: `${durationHours} hours ${durationMinutes} minutes`});
      }
    }

    return {
      shareholderAttendance,
      proxyAttendance,
      inviteeAttendance,
      corporateAttendance
    };
  }
  private static categoriesLeave(input: AttendanceReportData): {
    shareholderLeave: ShareholderProxyLeaveRowData[];
    proxyLeave: ShareholderProxyLeaveRowData[];
    inviteeLeave: InviteeLeaveRowData[];
    corporateLeave: CorporateLeaveRowData[];
  } {
    let shareholderIndex = 0;
    let proxyIndex = 0;
    let inviteeIndex = 0;
    let corporateIndex = 0;
    let shareholderLeave: ShareholderProxyLeaveRowData[] = [];
    let proxyLeave: ShareholderProxyLeaveRowData[] = [];
    let inviteeLeave: InviteeLeaveRowData[] = [];
    let corporateLeave: CorporateLeaveRowData[] = [];
    for (let att of input.data.leave) {
      if (att.data.role === RoleEnum.SHAREHOLDER) {
        const shareholder = input.data.shareholders.find(shareholder => shareholder._id.toString() === att.data.ref.toString());
        shareholderIndex++;
        const originalDate = new Date(att.data.leaveAt);
        const offsetMinutes = -480;
        const adjustedDate = new Date(originalDate.getTime() - offsetMinutes * 60 * 1000);
        shareholderLeave.push({
          index: shareholderIndex,
          name: shareholder.name,
          nric: shareholder.identityNumber,
          leaveAt: adjustedDate,
          cds: shareholder.cds,
          numberOfShares: shareholder.numberOfShares
        });
      } else if (att.data.role === RoleEnum.PROXY) {
        const proxy = input.data.proxies.find(prox => prox._id.toString() === att.data.ref.toString());
        proxyIndex++;
        const originalDate = new Date(att.data.leaveAt);
        const offsetMinutes = -480;
        const adjustedDate = new Date(originalDate.getTime() - offsetMinutes * 60 * 1000);
        proxyLeave.push({
          index: proxyIndex,
          name: proxy.name,
          nric: proxy.identityNumber,
          leaveAt: adjustedDate,
          cds: (proxy.shareholderId as Shareholder).cds,
          numberOfShares: proxy.allocatedShares
        });
      } else if (att.data.role === RoleEnum.INVITEE) {
        const invitee = input.data.invitees.find(invitee => invitee._id.toString() === att.data.ref.toString());
        inviteeIndex++;
        const originalDate = new Date(att.data.leaveAt);
        const offsetMinutes = -480;
        const adjustedDate = new Date(originalDate.getTime() - offsetMinutes * 60 * 1000);
        inviteeLeave.push({ index: inviteeIndex, name: invitee.name, mobile: invitee.mobile, leaveAt: adjustedDate });
      }else if (att.data.role === RoleEnum.CORPORATE) {
        const corporate = input.data.corporates.find(corporate => corporate._id.toString() === att.data.ref.toString());
        corporateIndex++;
        const originalDate = new Date(att.data.leaveAt);
        const offsetMinutes =-480;
        const adjustedDate = new Date(originalDate.getTime() - offsetMinutes * 60 * 1000);
        corporateLeave.push({ index: corporateIndex, name: corporate.name, mobile: corporate.mobile, leaveAt: adjustedDate });
      }
    }

    return {
      shareholderLeave,
      proxyLeave,
      inviteeLeave,
      corporateLeave
    };
  }


}
