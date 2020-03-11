import {EChartOption} from 'echarts';

export const CHARTCONFIG = {
  primary: 'rgba(33,150,243,.85)', // $mk-primary
  success: 'rgba(102,187,106,.85)', // #66BB6A
  info: 'rgba(0,188,212,.85)', // #00BCD4
  infoAlt: 'rgba(126,87,194,.85)', // #7E57C2
  warning: 'rgba(255,202,40,.85)', // #FFCA28
  danger: 'rgba(233,75,59,.85)', // #E94B3B
  gray: 'rgba(221,221,221,.3)',
  pms: '#ff6347',
  ago: '#ffc107',
  ik: '#654321',
  textColor: '#989898',
  splitLineColor: 'rgba(0,0,0,.05)',
  splitAreaColor: ['rgba(250,250,250,0.035)', 'rgba(200,200,200,0.1)']
};

export interface FuelBoundstats {
  pms: EChartOption;
  ago: EChartOption;
  ik: EChartOption;
}
