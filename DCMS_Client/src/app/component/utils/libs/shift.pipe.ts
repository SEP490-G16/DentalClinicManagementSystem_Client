// src/app/time-format.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'timeFormat2' })
export class TimeFormatPipe implements PipeTransform {
  transform(value: string, args?: any): string {
    if (!value) return ''; // Handle empty value case

    // Parse the timestamp to a moment object, assuming the value is a unix timestamp
    let time = moment.unix(parseInt(value));

    // Define your morning and afternoon shift start times
    const morningShiftStart = moment('07:30', 'HH:mm');
    const afternoonShiftStart = moment('12:50', 'HH:mm');

    // Format the moment object to a time string
    let formattedTime = time.format('HH:mm');

    // Compare the formatted time to your shift start times
    if (formattedTime === morningShiftStart.format('HH:mm')) {
      return 'Ca Sáng'; // Replace with what you want to display
    } else if (formattedTime === afternoonShiftStart.format('HH:mm')) {
      return 'Ca Chiều'; // Replace with what you want to display
    }

    return ''; // If not matching any shift, return empty string
  }
}
