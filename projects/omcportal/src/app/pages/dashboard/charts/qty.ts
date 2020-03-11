import {CHARTCONFIG} from './charts.config';

export let fuelgauge = {
  pms: {
    name: 'PMS',
    title: {
      text: 'AVAILABLE PMS',
      left: 'center',
      textStyle: {
        fontWeight: 'bolder',
        color: CHARTCONFIG.pms,
        shadowColor: '#fff',
        shadowBlur: 10
      }
    },
    tooltip: {
      formatter: '{a} <br/>{b} : {c}'
    },
    toolbox: {
      feature: {
        saveAsImage: {show: true, title: 'Save Image'}
      }
    },
    series: [
      {
        axisLine: {
          lineStyle: {
            color: [[0.2, '#E46A7C'], [1, CHARTCONFIG.pms]],

            // color: [[0.29, 'lime'], [0.86, '#1e90ff'], [1, '#ff4500']],
            width: 5,
            shadowColor: '#fff',
            shadowBlur: 10
          }
        },
        axisLabel: {
          textStyle: {
            fontSize: 14,
            fontWeight: 'bolder',
            color: CHARTCONFIG.ik,
            shadowColor: '#fff',
            shadowBlur: 10
          }
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: 'auto',
            shadowColor: '#fff',
            shadowBlur: 10
          }
        },
        splitLine: {
          length: 20,
          lineStyle: {
            width: 3,
            color: 'c',
            shadowColor: '#fff',
            shadowBlur: 10
          }
        },
        pointer: {
          width: 5,
          shadowColor: '#fff',
          shadowBlur: 5
        },
        title: {
          offsetCenter: [0, '-30%'],
          textStyle: {
            fontWeight: 'bolder',
            fontStyle: 'italic',
            color: 'auto',
            shadowColor: '#fff',
            shadowBlur: 10
          }
        },
        detail: {
          // backgroundColor: 'rgba(30,144,255,0.8)',
          // borderWidth: 1,
          borderColor: 'auto',
          shadowColor: '#fff',
          shadowBlur: 5,
          width: 80,
          height: 30,
          offsetCenter: [0, '80%'],
          textStyle: {
            fontSize: 20,
            // fontWeight: 'bolder',
            color: '#444'
          }
        },
        // title: {show: true, title: 'Ik'},
        name: 'IK',
        type: 'gauge',
        splitNumber: 2,
        min: 0,
        max: 0,
        // detail: { formatter: '{value}%' },
        data: [{value: 0}]
      }
    ]
  },
  ago: {
    name: 'AGO',
    title: {
      left: 'center',
      text: 'AVAILABLE AGO',
      textStyle: {
        fontWeight: 'bolder',
        color: CHARTCONFIG.ago,
        shadowColor: '#fff',
        shadowBlur: 10
      }
    },
    tooltip: {
      formatter: '{a} <br/>{b} : {c}'
    },
    toolbox: {
      feature: {
        saveAsImage: {show: true, title: 'Save Image'}
      }
    },
    series: [
      {
        axisLine: {
          lineStyle: {
            color: [[0.2, '#E46A7C'], [1, CHARTCONFIG.ago]],

            // color: [[0.29, 'lime'], [0.86, '#1e90ff'], [1, '#ff4500']],
            width: 5,
            shadowColor: '#fff',
            shadowBlur: 10
          }
        },
        axisLabel: {
          textStyle: {
            fontSize: 14,
            fontWeight: 'bolder',
            color: CHARTCONFIG.ik,
            shadowColor: '#fff',
            shadowBlur: 10
          }
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: 'auto',
            shadowColor: '#fff',
            shadowBlur: 10
          }
        },
        splitLine: {
          length: 20,
          lineStyle: {
            width: 3,
            color: 'c',
            shadowColor: '#fff',
            shadowBlur: 10
          }
        },
        pointer: {
          width: 5,
          shadowColor: '#fff',
          shadowBlur: 5
        },
        title: {
          offsetCenter: [0, '-30%'],
          textStyle: {
            fontWeight: 'bolder',
            fontStyle: 'italic',
            color: 'auto',
            shadowColor: '#fff',
            shadowBlur: 10
          }
        },
        detail: {
          // backgroundColor: 'rgba(30,144,255,0.8)',
          // borderWidth: 1,
          borderColor: 'auto',
          shadowColor: '#fff',
          shadowBlur: 5,
          width: 80,
          height: 30,
          offsetCenter: [0, '80%'],
          textStyle: {
            fontSize: 20,
            // fontWeight: 'bolder',
            color: '#444'
          }
        },
        // title: {show: true, title: 'Ik'},
        name: 'IK',
        type: 'gauge',
        splitNumber: 2,
        min: 0,
        max: 0,
        // detail: { formatter: '{value}%' },
        data: [{value: 0}]
      }
    ]
  },
  ik: {
    name: 'IK',
    title: {
      text: 'AVAILABLE IK',
      left: 'center',
      textStyle: {
        fontWeight: 'bolder',
        color: CHARTCONFIG.ik,
        shadowColor: '#fff',
        shadowBlur: 10
      }
    },
    tooltip: {
      formatter: '{a} <br/>{b} : {c}'
    },
    toolbox: {
      feature: {
        saveAsImage: {show: true, title: 'Save Image'}
      }
    },
    series: [
      {
        axisLine: {
          lineStyle: {
            color: [[0.2, '#E46A7C'], [1, CHARTCONFIG.ik]],

            // color: [[0.29, 'lime'], [0.86, '#1e90ff'], [1, '#ff4500']],
            width: 5,
            shadowColor: '#fff',
            shadowBlur: 10
          }
        },
        axisLabel: {
          textStyle: {
            fontSize: 14,
            fontWeight: 'bolder',
            color: CHARTCONFIG.ik,
            shadowColor: '#fff',
            shadowBlur: 10
          }
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: 'auto',
            shadowColor: '#fff',
            shadowBlur: 10
          }
        },
        splitLine: {
          length: 20,
          lineStyle: {
            width: 3,
            color: 'c',
            shadowColor: '#fff',
            shadowBlur: 10
          }
        },
        pointer: {
          width: 5,
          shadowColor: '#fff',
          shadowBlur: 5
        },
        title: {
          offsetCenter: [0, '-30%'],
          textStyle: {
            fontWeight: 'bolder',
            fontStyle: 'italic',
            color: 'auto',
            shadowColor: '#fff',
            shadowBlur: 10
          }
        },
        detail: {
          // backgroundColor: 'rgba(30,144,255,0.8)',
          // borderWidth: 1,
          borderColor: 'auto',
          shadowColor: '#fff',
          shadowBlur: 5,
          width: 80,
          height: 30,
          offsetCenter: [0, '80%'],
          textStyle: {
            fontSize: 20,
            // fontWeight: 'bolder',
            color: '#444'
          }
        },
        // title: {show: true, title: 'Ik'},
        name: 'IK',
        type: 'gauge',
        splitNumber: 2,
        min: 0,
        max: 0,
        // detail: { formatter: '{value}%' },
        data: [{value: 0}]
      }
    ]
  }
};
