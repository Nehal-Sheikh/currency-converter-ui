import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appCurrencyHighlight]',
  standalone: true
})
export class CurrencyHighlightDirective implements OnChanges {
  @Input() triggerValue: any;

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['triggerValue'] && !changes['triggerValue'].firstChange) {
      this.el.nativeElement.classList.add('highlight-flash');
      setTimeout(() => {
        this.el.nativeElement.classList.remove('highlight-flash');
      }, 1000);
    }
  }
}

