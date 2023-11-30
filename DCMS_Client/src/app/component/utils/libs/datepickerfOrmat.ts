import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Injectable } from '@angular/core';

function padNumber(value: number): string {
  return `0${value}`.slice(-2);
}

@Injectable()
export class NgbDateCustomParserFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    if (value) {
      const dateParts = value.trim().split('/');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        const year = parseInt(dateParts[2], 10);

        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          return { day, month, year };
        }
      }
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    if (date) {
      const day = date.day ? padNumber(date.day) : '';
      const month = date.month ? padNumber(date.month) : '';
      const year = date.year ? date.year.toString() : '';
      return `${day}/${month}/${year}`;
    }
    return '';
  }
}
