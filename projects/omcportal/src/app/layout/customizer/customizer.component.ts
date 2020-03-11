import {Component, OnInit} from '@angular/core';
import {APPCONFIG} from '../../config';
import {LayoutService} from '../layout.service';

@Component({
  selector: 'my-app-customizer',
  templateUrl: './customizer.component.html',
  styleUrls: ['./customizer.component.scss']
})

export class AppCustomizerComponent implements OnInit {
  public AppConfig: any;

  constructor(private layoutService: LayoutService) {
  }

  ngOnInit() {
    this.AppConfig = APPCONFIG;
  }

  onLayoutChange = () => {
    this.layoutService.updateEChartsState(true);
  };
}
