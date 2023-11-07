import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'VNdateTimeFormat'
})
export class VNDateTimeFormatPipe implements PipeTransform {

  constructor(private datePipe: DatePipe) {}

  transform(value: string): string {
    const date = new Date(value);
    return this.datePipe.transform(date, 'HH:mm dd/MM/yyyy') || value;
  }
}
