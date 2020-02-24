import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-depot',
  templateUrl: './confirm-depot.component.html',
  styleUrls: ['./confirm-depot.component.scss']
})
export class ConfirmDepotComponent implements OnInit {
  typedname = '';

  constructor(@Inject(MAT_DIALOG_DATA) public depotname?: string) {
  }

  @HostListener('paste', ['$event']) blockPaste(e: KeyboardEvent) {
    e.preventDefault();
  }

  ngOnInit() {
  }

}
