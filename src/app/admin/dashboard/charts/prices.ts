import {EChartOption} from "echarts";
import {CHARTCONFIG} from "./charts.config";

const upColor = "#ec0000";
const upBorderColor = "#8A0000";
const downColor = "#00da3c";
const downBorderColor = "#008F28";

export let singleFuelpricestat: EChartOption = {
  title: {
    text: "{{FUELTYPE}}",
    left: 0
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "cross"
    }
  },
  legend: {
    data: ["Price", "MA5", "MA10", "MA20", "MA30"]
  },
  grid: {
    // left: "10%",
    // right: "10%",
    // bottom: "15%"
  },
  xAxis: {
    type: "category",
    data: [],
    // data: data0.categoryData,
    scale: true,
    boundaryGap: false,
    axisLine: { onZero: false },
    splitLine: { show: false },
    splitNumber: 20,
    min: "dataMin",
    max: "dataMax",
    axisLabel: {
      color: CHARTCONFIG.textColor,
    },
  },
  yAxis: {
    scale: true,
    splitArea: {
      show: true
    }
  },
  dataZoom: [
    {
      type: "inside",
      start: 50,
      end: 100
    },
    {
      show: true,
      type: "slider",
      // y: 90,
      start: 50,
      end: 100
    }
  ],
  series: [
    // {
    // name: "Price",
    // type: "candlestick",
    // data: [],
    // // data: data0.values,
    // itemStyle: {
    //   normal: {
    //     color: upColor,
    //     color0: downColor,
    //     borderColor: upBorderColor,
    //     borderColor0: downBorderColor
    //   }
    // },
    // markPoint: {
    // label: {
    //   normal: {
    //     formatter(param) {
    //       return param != null ? Math.round(param.value) : "";
    //     }
    //   }
    // },
    // data: [
    //   {
    //     name: "highest value",
    //     type: "max",
    //     valueDim: "highest",
    //     itemStyle: {
    //       normal: {color: 'rgb(41,60,85)'}
    //     }
    //   },
    //   {
    //     name: "lowest value",
    //     type: "min",
    //     valueDim: "lowest",
    //     itemStyle: {
    //       normal: {color: 'rgb(41,60,85)'}
    //     }
    //   },
    //   {
    //     name: "average value on close",
    //     type: "average",
    //     valueDim: "close",
    //     itemStyle: {
    //       normal: {color: 'rgb(41,60,85)'}
    //     }
    //   }
    // ]
    // ,
    // tooltip: {
    //   formatter(param) {
    //     return param.name + "<br>" + (param.data.coord || "");
    //   }
    // }
    //   },
    //   markLine: {
    //     symbol: ["none", "none"],
    //     data: [
    //       [
    //         {
    //           name: "from lowest to highest",
    //           type: "min",
    //           valueDim: "lowest",
    //           symbol: "circle",
    //           symbolSize: 10,
    //           label: {
    //             normal: {show: false},
    //             emphasis: {show: false}
    //           }
    //         },
    //         {
    //           type: "max",
    //           valueDim: "highest",
    //           symbol: "circle",
    //           symbolSize: 10,
    //           label: {
    //             normal: {show: false},
    //             emphasis: {show: false}
    //           }
    //         }
    //       ],
    //       {
    //         name: "min line on close",
    //         type: "min",
    //         valueDim: "close"
    //       },
    //       {
    //         name: "max line on close",
    //         type: "max",
    //         valueDim: "close"
    //       }
    //     ]
    //   }
    // },
    // {
    //   name: "MA5",
    //   type: "line",
    //   data: [],

    //   // data: calculateMA(5),
    //   smooth: true,
    //   lineStyle: {
    //     // normal: {opacity: 0.5}
    //   }
    // },
    // {
    //   name: "MA10",
    //   type: "line",
    //   data: [],

    //   // data: calculateMA(10),
    //   smooth: true,
    //   lineStyle: {
    //     // normal: {opacity: 0.5}
    //   }
    // },
    // {
    //   name: "MA20",
    //   type: "line",
    //   data: [],

    //   // data: calculateMA(20),
    //   smooth: true,
    //   lineStyle: {
    //     // normal: {opacity: 0.5}
    //   }
    // },
    // {
    //   name: "MA30",
    //   type: "line",
    //   data: [],

    //   // data: [calculateMA(30)],
    //   smooth: true,
    //   lineStyle: {
    //     // normal: {opacity: 0.5}
    //   }
    // },

  ]
};
