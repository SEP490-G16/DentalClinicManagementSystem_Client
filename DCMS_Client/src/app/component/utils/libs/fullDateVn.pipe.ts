import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'fullDateVn'
})
export class FullDateVnPipe implements PipeTransform {

  constructor(private datePipe: DatePipe) {}

  transform(value: Date): string {
    const formattedDate = this.datePipe.transform(value, 'dd/MM/yyyy', 'Asia/Ho_Chi_Minh');
    return formattedDate ?? '';
  }
}
