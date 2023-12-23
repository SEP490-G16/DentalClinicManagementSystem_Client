import * as unorm from 'unorm';
export class Normalize{

  static  normalizeDiacritics(input: string): string {
     // Chuẩn hóa chuỗi sử dụng NFD và loại bỏ các dấu thanh điệu
     let normalized = unorm.nfd(input).replace(/[\u0300-\u036f]/g, '');

     // Thay thế Đ và đ bằng D và d
     normalized = normalized.replace(/Đ/g, 'D').replace(/đ/g, 'd');

     return normalized;
  }
}
