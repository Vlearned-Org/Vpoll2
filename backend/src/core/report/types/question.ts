import { QuestionReportData } from "../report.interface";
import { ReportUtils } from "./report.utils";
const Excel = require("exceljs");
const stream = require("stream");

export class QuestionReport {
  public static async generate(input: QuestionReportData) {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Question");
    ReportUtils.setHeader(worksheet, input);
    worksheet.getRow(6).values = ["No", "Name", "Contact", "Email", "Date", "Type", "Question"];
    worksheet.columns = [
      { key: "index", width: 10 },
      { key: "name", width: 20 },
      { key: "contact", width: 35 },
      { key: "email", width: 15 },
      { key: "date", width: 15 },
      { key: "type", width: 15 },
      { key: "question", width: 35 }
    ];
    input.data.questions.forEach((question, index) => {
      const user = input.data.users.find(u => u._id.toString() === question.userId.toString());
      const originalDate = new Date(question.createdAt);
      const offsetMinutes = -480;
      const adjustedDate = new Date(originalDate.getTime() - offsetMinutes * 60 * 1000);
      const row = {
        index: index + 1,
        name: user.name,
        contact: user.mobile,
        email: user.email,
        date: adjustedDate,
        type: question.data.roles.toString().toUpperCase(),
        question: question.data.question
      };
      worksheet.addRow(row);
    });
    const readStream = new stream.PassThrough();
    await workbook.xlsx.write(readStream);
    return readStream;
  }
}
