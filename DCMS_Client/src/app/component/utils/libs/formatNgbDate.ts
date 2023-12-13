import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import 'moment/locale/vi';

export class FormatNgbDate {

  static formatNgbDateToString(date: NgbDateStruct): string {
    if (!date) return ''; // or return null; depending on how you want to handle null dates

    const pad = (number: number) => number < 10 ? `0${number}` : number;
    return `${date.year}-${pad(date.month)}-${pad(date.day)}`;
  }

  static pad(number: number) {
    return (number < 10) ? `0${number}` : number;
  }


  static formatNgbDateToVNString(date: NgbDateStruct): string {
    if (!date) return ''; // or return null; depending on how you want to handle null dates

    const pad = (number: number) => number < 10 ? `0${number}` : number;
    return `${pad(date.day)}/${pad(date.month)}/${date.year}`;
  }

  static timestampToNgbDate(timestamp: number): NgbDateStruct {
    const date = moment.unix(timestamp).tz('Asia/Ho_Chi_Minh');
    return { year: date.year(), month: date.month() + 1, day: date.date() };
  }

}
