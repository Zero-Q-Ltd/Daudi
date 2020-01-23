import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import * as $ from 'jquery';
import 'jquery-slimscroll';

@Directive({
  selector: '[mySlimScroll]'
})
export class SlimScrollDirective implements AfterViewInit {
  el: ElementRef;
  @Input() scrollHeight: string;

  constructor(el: ElementRef) {
    this.el = el;
  }

  ngAfterViewInit() {
    const $el = $(this.el.nativeElement);

    ($el).slimScroll({
      height: this.scrollHeight || '100%'
    });
  }
}
