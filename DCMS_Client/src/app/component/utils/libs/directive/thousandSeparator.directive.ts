import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appCurrencyFormat]'
})
export class CurrencyFormatDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event:any) {
    const initalValue = this.el.nativeElement.value;
    this.el.nativeElement.value = initalValue.replace(/[^0-9]*/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if ( initalValue !== this.el.nativeElement.value) {
      event.stopPropagation();
    }
  }

}
