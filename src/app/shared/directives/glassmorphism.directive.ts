import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appGlassmorphism]',
  standalone: true
})
export class GlassmorphismDirective implements OnInit {
  @Input() opacity = 0.7;
  @Input() blur = 12;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    const style = this.el.nativeElement.style;
    style.background = `rgba(30, 41, 59, ${this.opacity})`;
    style.backdropFilter = `blur(${this.blur}px)`;
    style.webkitBackdropFilter = `blur(${this.blur}px)`;
    style.border = '1px solid rgba(255, 255, 255, 0.08)';
    style.borderRadius = '24px';
  }
}
