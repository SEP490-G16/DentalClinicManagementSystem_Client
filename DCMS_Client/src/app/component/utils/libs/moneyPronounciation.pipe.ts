// number-to-words.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberToWords'
})
export class NumberToWordsPipe implements PipeTransform {
  transform(value: string | number): string {
    // Chuyển đổi giá trị sang số nếu là chuỗi
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (numericValue === 0) {
      return 'Không đồng';
    }

    const units = ['', 'nghìn', 'triệu', 'tỷ'];
    const numArray = numericValue.toString().split('').reverse().map(Number);

    let words = '';
    let unitIndex = 0;

    for (let i = 0; i < numArray.length; i += 3) {
      const chunk = numArray.slice(i, i + 3);
      const chunkWords = this.convertChunkToWords(chunk);

      if (chunkWords !== '') {
        words = chunkWords + ' ' + units[unitIndex] + ' ' + words;
      }

      unitIndex++;
    }

    return (words.charAt(0).toUpperCase() + words.slice(1).toLowerCase()).trim() + ' đồng';
  }
  private convertChunkToWords(chunk: number[]): string {
    const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    const teens = ['mười', 'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm', 'mười sáu', 'mười bảy', 'mười tám', 'mười chín'];

    let chunkWords = '';

    for (let i = 0; i < chunk.length; i++) {
      const digit = chunk[i];

      if (digit !== 0) {
        if (i === 0) {
          // Special handling for "lăm" (5) after "mươi" (10)
          if (chunk.length > 1 && chunk[1] == 1 && digit == 5) {
            chunkWords = 'lăm ' + chunkWords;
          } else {
            chunkWords = ones[digit] + ' ' + chunkWords;
          }
        } else if (i === 1) {
          if (digit === 1) {
            chunkWords = teens[chunk[i - 1]] + ' ' + chunkWords;
          } else {
            chunkWords = ones[digit] + ' mươi ' + chunkWords;
          }
        } else if (i === 2) {
          chunkWords = ones[digit] + ' trăm ' + chunkWords;
        }
      }
    }

    return chunkWords;
  }

}
