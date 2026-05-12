import { Directive, ElementRef, Input, OnChanges, SimpleChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appSkeleton]',
  standalone: true
})
export class SkeletonLoaderDirective implements OnChanges {
  @Input('appSkeleton') isLoading = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isLoading']) {
      if (this.isLoading) {
        this.renderer.addClass(this.el.nativeElement, 'skeleton-shimmer');
      } else {
        this.renderer.removeClass(this.el.nativeElement, 'skeleton-shimmer');
      }
    }
  }
}

