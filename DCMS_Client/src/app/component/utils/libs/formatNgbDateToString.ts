import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export class FormatNgbDate {

  static formatNgbDateToString(date: NgbDateStruct): string {
    if (!date) return ''; // or return null; depending on how you want to handle null dates

    const pad = (number: number) => number < 10 ? `0${number}` : number;
    return `${date.year}-${pad(date.month)}-${pad(date.day)}`;
  }

  static pad(number: number) {
    return (number < 10) ? `0${number}` : number;
  }

}
