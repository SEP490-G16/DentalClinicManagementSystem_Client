import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'viDateRange'
})
export class ViDateRangePipe implements PipeTransform {

  constructor(private datePipe: DatePipe) {}

  transform(value: Date, args?: any): string {
    let firstDayOfWeek = new Date(value);
    firstDayOfWeek.setDate(value.getDate() - value.getDay() + (value.getDay() === 0 ? -6 : 1)); // Điều chỉnh nếu chủ nhật là ngày đầu tiên của mảng

    let lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

    let firstDayFormatted = this.datePipe.transform(firstDayOfWeek, 'dd-MM-yyyy', 'Asia/Ho_Chi_Minh');
    let lastDayFormatted = this.datePipe.transform(lastDayOfWeek, 'dd-MM-yyyy', 'Asia/Ho_Chi_Minh');

    return `${firstDayFormatted} - ${lastDayFormatted}`;
  }
}
