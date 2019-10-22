import {CHARTCONFIG} from "./charts.config";
import {EChartOption} from "echarts";

export let saleStats: EChartOption = {
  toolbox: {
    show: true,
    left: "left",
    feature: {
      // dataZoom: { show: true },
      dataView: {show: true, readOnly: false, title: "   Raw Data", lang: ["Raw Data", "Close", null]},
      magicType: {
        show: true,
        type: ["line", "stack", "tiled"],
        title: {line: "Line", stack: "stack", tiled: "tiles"}
      },
      restore: {show: true, title: "Refresh"},
      saveAsImage: {show: true, title: "Save Image"}
    }
  },
  legend: {
    show: true,
    x: "right",
    y: "top",
    textStyle: {
      color: CHARTCONFIG.textColor
    },
    data: ["Trend", "PMS", "AGO", "IK"]
  },
  grid: {
    x: 60,
    y: 80,
    borderWidth: 0
  },
  tooltip: {
    show: true,
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
    textStyle: {}
  },
  xAxis: [
    {
      type: "category",
      axisLine: {
        show: true,
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: CHARTCONFIG.textColor,
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: CHARTCONFIG.splitLineColor
        }
      },
      data: []
    }
  ],
  yAxis: [
    {
      type: "value",
      name: "* 1000",
      nameLocation: "end",
      axisLabel: {
        color: CHARTCONFIG.textColor,
        formatter: (qty) => qty / 1000,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: CHARTCONFIG.splitLineColor
        }
      }
    }
  ],
  dataZoom: [
    {
      type: "inside",
      start: 50,
      end: 100
    },
    {
      show: true,
      type: "slider",

      start: 50,
      end: 100
    }
  ],
  series: [
    {
      name: "Trend",
      type: "line",
      lineStyle: {
        normal: {
          color: CHARTCONFIG.gray
        }
      },
      areaStyle: {
        normal: {
          color: CHARTCONFIG.gray
        },
        emphasis: {}
      },
      data: [],
      legendHoverLink: false,
      z: 1
    },

    {
      animation: true,
      name: "PMS",
      type: "bar",
      stack: "traffic",
      itemStyle: {
        normal: {
          color: CHARTCONFIG.pms, // '#8BC34A', // Light Green 500
          barBorderRadius: 0
        },
        emphasis: {
          // color: CHARTCONFIG.success
        }
      },
      barCategoryGap: "60%",
      data: [],

      // data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      legendHoverLink: false,
      z: 2
    },
    {
      animation: true,
      name: "AGO",
      type: "bar",
      stack: "traffic",
      smooth: true,
      itemStyle: {
        normal: {
          color: CHARTCONFIG.ago, // '#03A9F4', // Light Blue 500
          barBorderRadius: 0
        },
        emphasis: {
          // color: CHARTCONFIG.primary
        }
      },
      barCategoryGap: "60%",
      data: [],
      symbol: "none",
      legendHoverLink: false,
      z: 2
    },
    {
      animation: true,
      name: "IK",
      type: "bar",
      stack: "traffic",
      smooth: true,
      itemStyle: {
        normal: {
          color: CHARTCONFIG.ik, // '#4FC3F7', // Light Blue 300
          barBorderRadius: 0
        },
        emphasis: {
          // color: CHARTCONFIG.info
        }
      },
      barCategoryGap: "60%",
      data: [],
      symbol: "none",
      legendHoverLink: false,
      z: 2
    }
  ]
};
