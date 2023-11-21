import * as moment from 'moment-timezone';
import 'moment/locale/vi';

export class ConvertTimestamp {
  static dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf() /1000;
    return timestamp;
  }
}
