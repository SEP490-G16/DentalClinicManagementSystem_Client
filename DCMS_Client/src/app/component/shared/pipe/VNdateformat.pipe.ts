import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'vnDateTimeFormat'
})
export class vnDateTimeFormatPipe implements PipeTransform {

  constructor(private datePipe: DatePipe) {}

  transform(value: string, includeTime: boolean = true): string {
    if (!value || value === 'Invalid Date') {
      return value;
    }

    const date = new Date(value);

    if (includeTime) {
      return this.datePipe.transform(date, 'HH:mm dd/MM/yyyy') || value;
    } else {
      return this.datePipe.transform(date, 'dd/MM/yyyy') || value;
    }
  }
}
