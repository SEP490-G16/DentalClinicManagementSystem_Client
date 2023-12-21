import { Directive, HostListener, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCurrencyFormat]'
})
export class CurrencyFormatDirective {

  constructor(private el: ElementRef, private model: NgControl) {}

  @HostListener('input', ['$event.target.value'])
  onInputChange(value: string) {
    const numericValue = value.replace(/[^0-9]/g, ''); // Extract numeric value
    const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Format with commas

    // Check if valueAccessor is not null
    if (this.model.valueAccessor) {
      this.model.valueAccessor.writeValue(numericValue); // Update model with numeric value
    }

    this.el.nativeElement.value = formattedValue; // Update view with formatted value
  }
}
