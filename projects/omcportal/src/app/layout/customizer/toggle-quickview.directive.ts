import {AfterViewInit, Directive, ElementRef, Input} from '@angular/core';

declare var jquery: any;
declare var $: any;

@Directive({selector: '[myToggleQuickview]'})

export class ToggleQuickviewDirective implements AfterViewInit {
  @Input() myToggleQuickview: string;

  el: ElementRef;

  constructor(el: ElementRef) {
    this.el = el;
  }

  ngAfterViewInit() {
    const $el = $(this.el.nativeElement);
    const $body = $('#body');
    const target = this.myToggleQuickview;
    let qvClass = 'quickview-open';

    if (target) {
      qvClass = qvClass + '-' + target;
    }

    $el.on('click', (e) => {
      $body.toggleClass(qvClass);
      e.preventDefault();
    });
  }
}
