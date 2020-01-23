import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-reason',
  templateUrl: './reason.component.html',
  styleUrls: ['./reason.component.scss']
})
export class ReasonComponent implements OnInit {
  reasoncontrol = new FormControl('', [Validators.required, Validators.minLength(15)]);

  constructor(public dialogRef: MatDialogRef<ReasonComponent>) {
  }

  ngOnInit() {
  }

  closeDialog() {
    if (this.reasoncontrol.valid) {
      this.dialogRef.close(this.reasoncontrol.value);
    }
  }

}
