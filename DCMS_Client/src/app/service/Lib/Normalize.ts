import * as unorm from 'unorm';
export class Normalize{

  static  normalizeDiacritics(input: string): string {
    return unorm.nfd(input).replace(/[\u0300-\u036f]/g, '');
  }
}
