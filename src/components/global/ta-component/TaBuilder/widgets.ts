import { VObject } from '@/lib/vails';
import { TaBuilderComponent } from './types';

export const widgetsWithGroup: VObject[] = [
  {
    name: '图层',
    component: 'TaLayer',
    cssc: {
      w: 200,
      h: 100,
    },
  },
  {
    name: '条件块',
    component: 'TaConditionLayer',
    cssc: {
      w: 200,
      h: 100,
    },
    props: {
      condition_1: {
        type: 'slot',
        value: [],
      },
    },
  },
  {
    name: '动态组件',
    component: 'TaScreenDynamicComponent',
    cssc: {
      w: 300,
      h: 100,
    },
  },
  // {
  //   name: '折线图',
  //   component: 'TaChartLine',
  //   cssc: {
  //     w: 100,
  //     h: 100,
  //   },
  // },
  {
    name: '图片',
    component: 'TaChartImage',
    cssc: {
      w: 100,
      h: 100,
    },
  },
  {
    name: '文字数字',
    widgets: [
      {
        name: '键值对',
        component: 'TaScreenKeyValue',
        cssc: {
          w: 300,
          h: 100,
        },
      },
      {
        name: '滚动数字',
        component: 'TaScreenScrollNumber',
        cssc: {
          w: 300,
          h: 100,
        },
      },
      {
        name: '文字',
        component: 'TaScreenText',
        cssc: {
          w: 100,
          h: 100,
        },
      },
    ],
  },
  {
    name: '图标',
    component: 'TaScreenIcon',
    cssc: {
      w: 50,
      h: 50,
    },
  },
  {
    name: '折线图',
    widgets: [
      {
        name: '通用折线图',
        component: 'TaScreenLineChart',
        cssc: {
          w: 300,
          h: 300,
        },
        img: '',
      },
      {
        name: '基础折线图',
        component: 'ComBasePolyLineDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '基础平滑折线图',
        component: 'ComBaseSmoothPolyLineDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '基础面积图',
        component: 'ComBaseAreaLineDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '基础平滑面积图',
        component: 'ComBaseSmoothAreaLineDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '折线图堆叠',
        component: 'ComBaseStackPolyLineDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '堆叠面积图',
        component: 'ComBaseStackAreaPolyLineDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '平滑折线图堆叠',
        component: 'ComBaseSmoothStackLineDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '平滑堆叠面积图',
        component: 'ComBaseSmoothStacAreakLineDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '带数据折线图',
        component: 'ComBasePolyLabelLineDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '带标记点折线图',
        component: 'ComBaseMarkPointLineDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '基础混合柱状折线图',
        component: 'ComScreenBaseBarLineDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
    ],
  },
  {
    name: '条形图',
    widgets: [
      {
        name: '通用条形图',
        component: 'TaScreenBarChart',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '3d条形图',
        component: 'TaScreen3DBarChart',
        cssc: {
          w: 600,
          h: 600,
        },
      },
      {
        name: '基础(背景)柱状图',
        component: 'ComBaseBgBarDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '特殊柱状图',
        component: 'ComBaseSectionBarDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '多柱状图',
        component: 'ComBaseMultiBarDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '堆叠柱状图',
        component: 'ComBaseStackBarDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '方形立体堆叠柱状图',
        component: 'ComBaseStack3DBarDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '圆形立体堆叠柱状图',
        component: 'ComBaseRound3DBarDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '基础混合柱状折线图',
        component: 'ComScreenBaseBarLineDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '基础条形图',
        component: 'ComBaseHorizontalBarDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '带数据条形图',
        component: 'ComLabelHorizontalBarDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '带背景数据条形图',
        component: 'ComBgHorizontalBarDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '堆叠条形图',
        component: 'ComStackHorizontalBarDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '正负条形图',
        component: 'ComNegativeHorizontalBarDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      // 排行条形图 rankingBar
      {
        name: '排行条形图',
        component: 'ComBaseRankingBarDesign',
        cssc: {
          w: 420,
          h: 208,
        },
      },
    ],
  },
  {
    name: '饼图',
    widgets: [
      {
        name: '通用饼图',
        component: 'TaScreenPieChart',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '半环与基础环形图',
        component: 'ComBaseHalfPieDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '玫瑰图',
        component: 'ComBaseRosePieDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '立体饼图',
        component: 'ComBase3DPieDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '立体环形图',
        component: 'ComBase3DDoughnutPieDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
    ],
  },
  {
    name: '仪表盘进度条',
    widgets: [
      {
        name: '进度条',
        component: 'TaScreenProgress',
        cssc: {
          w: 300,
          h: 100,
        },
      },
      {
        name: '小仪表盘',
        component: 'TaScreenGauge',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '百分比圆环仪表盘',
        component: 'ComBaseProgressDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '数值仪表盘',
        component: 'ComBaseGaugeNormalDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '数值仪表盘带边框',
        component: 'ComBaseGaugeBorderDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '圆形带刻度数值仪表盘',
        component: 'ComBaseGaugeOnlyLabelDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '圆形带指针单色仪表盘',
        component: 'ComBaseGaugePointerSingleDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '圆形带指针多色仪表盘',
        component: 'ComBaseGaugePointerMultiDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
    ],
  },
  {
    name: '力图',
    widgets: [
      {
        name: '多对多力图',
        component: 'ComBaseForceGraphAllDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '多对一力图',
        component: 'ComBaseForceGraphSingleDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
    ],
  },
  {
    name: '雷达图',
    widgets: [
      {
        name: '通用雷达图',
        component: 'TaScreenRadarChart',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '基础雷达图',
        component: 'ComBaseRadarDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '带数据标签的区域雷达图',
        component: 'ComBaseAreaRadarDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
    ],
  },
  {
    name: '瀑布图',
    widgets: [
      {
        name: '垂直组成瀑布图',
        component: 'ComBaseVerticalAddWaterFallDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '垂直变化瀑布图',
        component: 'ComBaseVerticalChangeWaterFallDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '水平组成瀑布图',
        component: 'ComBaseHorizontalAddWaterFallDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '水平变化瀑布图',
        component: 'ComBaseHorizontalChangeWaterFallDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
    ],
  },

  // 桑基图 sankey
  {
    name: '基础桑基图',
    component: 'ComBaseSankeyDesign',
    cssc: {
      w: 300,
      h: 300,
    },
  },

  // 桑基图 sankey
  {
    name: '基础漏斗图',
    component: 'ComBaseFunnelDesign',
    cssc: {
      w: 300,
      h: 300,
    },
  },
  {
    name: '地图',
    widgets: [
      // 区域连线和地图部分 lineMap
      {
        name: '区域连线的上海地图',
        component: 'ComBaseLineShanghaiMapDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '中国地图',
        component: 'TaScreenChinaMap',
        cssc: {
          w: 600,
          h: 600,
        },
      },
    ],
  },

  // 词云图部分
  {
    name: '基础词云图',
    component: 'ComBaseWordCloudDesign',
    cssc: {
      w: 300,
      h: 300,
    },
  },
  // 河流图部分
  {
    name: '基础河流图',
    component: 'ComBaseThemeRiverDesign',
    cssc: {
      w: 300,
      h: 300,
    },
  },
  {
    name: '列表',
    widgets: [
      {
        name: '滚动列表',
        component: 'ComSeamlessScroll',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: 'TaIndexView',
        component: 'TaScreenTaIndexView',
        cssc: {
          w: 300,
          h: 300,
        },
        props: {
          card: {
            type: 'slot',
            value: [],
          },
        },
      },
      {
        name: '列表',
        component: 'TaScreenList',
        cssc: {
          w: 600,
          h: 600,
        },
      },
    ],
  },
  {
    name: '表格',
    widgets: [
      {
        name: '滚动表格',
        component: 'TaScreenScrollTable',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: 'TaIndexView',
        component: 'TaScreenTaIndexView',
        cssc: {
          w: 300,
          h: 300,
        },
        props: {
          card: {
            type: 'slot',
            value: [],
          },
        },
      },
      {
        name: '表格',
        component: 'TaScreenTable',
        cssc: {
          w: 600,
          h: 300,
        },
      },
    ],
  },
  {
    name: 'popover',
    component: 'TaScreenPopover',
    cssc: {
      w: 300,
      h: 300,
    },
    props: {
      content: {
        type: 'slot',
        value: [],
      },
    },
  },

  {
    name: '时间轴',
    component: 'TaScreenTimeLine',
    cssc: {
      w: 300,
      h: 300,
    },
    props: {
      dot: {
        type: 'slot',
        value: [],
      },
    },
  },
  {
    name: '表单显示',
    component: 'TaScreenTaTemplateFormViewer',
    cssc: {
      w: 300,
      h: 300,
    },
    props: {},
  },

  {
    name: '桑基图',
    component: 'TaScreenSankeyChart',
    cssc: {
      w: 300,
      h: 300,
    },
  },
  {
    name: '水波图',
    component: 'ComBaseLiquidFillDesign',
    cssc: {
      w: 300,
      h: 300,
    },
  },
  {
    name: '散点图',
    component: 'ComScreenScatterDesign',
    cssc: {
      w: 300,
      h: 300,
    },
  },
  {
    name: '矩形图',
    component: 'ComScreenTreemapDesign',
    cssc: {
      w: 300,
      h: 300,
    },
  },
  {
    name: '气泡图',
    widgets: [
      {
        name: '基础气泡图',
        component: 'ComBaseBubbleDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
      {
        name: '多气泡图',
        component: 'ComBaseMultiBubbleDesign',
        cssc: {
          w: 300,
          h: 300,
        },
      },
    ],
  },

  {
    name: '玉钰图',
    component: 'ComScreenBaseJadeDesign',
    cssc: {
      w: 300,
      h: 300,
    },
  },
  {
    name: '其它-数量显示',
    widgets: [
      {
        name: '数量环形图',
        component: 'ComSpinCircleBaseDesign',
        cssc: {
          w: 460,
          h: 164,
        },
      },
      {
        name: '数量节点图',
        component: 'ComSpinRoundBaseDesign',
        cssc: {
          w: 484,
          h: 240,
        },
      },
      {
        name: '漏斗排布图',
        component: 'ComFunnelFixDesign',
        cssc: {
          w: 500,
          h: 600,
        },
      },
      {
        name: '气泡排布图',
        component: 'ComBubbleFixDesign',
        cssc: {
          w: 484,
          h: 240,
        },
      },
    ],
  },
  {
    name: '等级占比图',
    widgets: [
      {
        name: '自动排序版',
        component: 'ComBaseSortListDesign',
        cssc: {
          w: 484,
          h: 244,
        },
      },
      {
        name: '顺序版',
        component: 'ComBaseListDesign',
        cssc: {
          w: 484,
          h: 244,
        },
      },
    ],
  },
];

export const widgets: Partial<TaBuilderComponent>[] = [
  // {
  //   name: '图层',
  //   component: 'TaLayer',
  //   cssc: {
  //     w: 200,
  //     h: 100,
  //   },
  // },
  // {
  //   name: '条件块',
  //   component: 'TaConditionLayer',
  //   cssc: {
  //     w: 200,
  //     h: 100,
  //   },
  //   props: {
  //     condition_1: {
  //       type: 'slot',
  //       value: [],
  //     },
  //   },
  // },
  // {
  //   name: '折线图',
  //   component: 'TaChartLine',
  //   cssc: {
  //     w: 100,
  //     h: 100,
  //   },
  // },
  // {
  //   name: '图片',
  //   component: 'TaChartImage',
  //   cssc: {
  //     w: 100,
  //     h: 100,
  //   },
  // },
  // {
  //   name: '键值对',
  //   component: 'TaScreenKeyValue',
  //   cssc: {
  //     w: 300,
  //     h: 100,
  //   },
  // },
  // {
  //   name: '数字',
  //   component: 'TaScreenNumber',
  //   cssc: {
  //     w: 100,
  //     h: 100,
  //   },
  // },
  // {
  //   name: '滚动数字',
  //   component: 'TaScreenScrollNumber',
  //   cssc: {
  //     w: 300,
  //     h: 100,
  //   },
  // },
  // {
  //   name: '文字',
  //   component: 'TaScreenText',
  //   cssc: {
  //     w: 100,
  //     h: 100,
  //   },
  // },
  // {
  //   name: '图标',
  //   component: 'TaScreenIcon',
  //   cssc: {
  //     w: 50,
  //     h: 50,
  //   },
  // },
  // {
  //   name: '折线图',
  //   component: 'TaScreenLineChart',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '饼图',
  //   component: 'TaScreenPieChart',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '条形图',
  //   component: 'TaScreenBarChart',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '动态组件',
  //   component: 'TaScreenDynamicComponent',
  //   cssc: {
  //     w: 300,
  //     h: 100,
  //   },
  // },
  // {
  //   name: '进度条',
  //   component: 'TaScreenProgress',
  //   cssc: {
  //     w: 300,
  //     h: 100,
  //   },
  // },
  // {
  //   name: '表格',
  //   component: 'TaScreenTable',
  //   cssc: {
  //     w: 600,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '地图',
  //   component: 'TaScreenChinaMap',
  //   cssc: {
  //     w: 600,
  //     h: 600,
  //   },
  // },
  // {
  //   name: '3d条形图',
  //   component: 'TaScreen3DBarChart',
  //   cssc: {
  //     w: 600,
  //     h: 600,
  //   },
  // },
  // {
  //   name: '小仪表盘',
  //   component: 'TaScreenGauge',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '列表',
  //   component: 'TaScreenList',
  //   cssc: {
  //     w: 600,
  //     h: 600,
  //   },
  // },
  // {
  //   name: '桑基图',
  //   component: 'TaScreenSankeyChart',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '雷达图',
  //   component: 'TaScreenRadarChart',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '滚动列表',
  //   component: 'ComSeamlessScroll',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '滚动表格',
  //   component: 'TaScreenScrollTable',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: 'popover',
  //   component: 'TaScreenPopover',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  //   props: {
  //     content: {
  //       type: 'slot',
  //       value: [],
  //     },
  //   },
  // },
  // {
  //   name: 'TaIndexView',
  //   component: 'TaScreenTaIndexView',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  //   props: {
  //     card: {
  //       type: 'slot',
  //       value: [],
  //     },
  //   },
  // },
  // {
  //   name: '时间轴',
  //   component: 'TaScreenTimeLine',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  //   props: {
  //     dot: {
  //       type: 'slot',
  //       value: [],
  //     },
  //   },
  // },
  // {
  //   name: '表单显示',
  //   component: 'TaScreenTaTemplateFormViewer',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  //   props: {},
  // },
  // {
  //   name: '基础柱状图',
  //   component: 'ComScreenBaseBar',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '多柱状图',
  //   component: 'ComBaseMultiBarDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '堆叠柱状图',
  //   component: 'ComBaseStackBarDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '方形立体堆叠柱状图',
  //   component: 'ComBaseStack3DBarDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '圆形立体堆叠柱状图',
  //   component: 'ComBaseRound3DBarDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '基础混合柱状折线图',
  //   component: 'ComScreenBaseBarLineDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // 折线图部分
  // {
  //   name: '基础折线图',
  //   component: 'ComBasePolyLineDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '基础平滑折线图',
  //   component: 'ComBaseSmoothPolyLineDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '基础面积图',
  //   component: 'ComBaseAreaLineDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '基础平滑面积图',
  //   component: 'ComBaseSmoothAreaLineDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '折线图堆叠',
  //   component: 'ComBaseStackPolyLineDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '堆叠面积图',
  //   component: 'ComBaseStackAreaPolyLineDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '平滑折线图堆叠',
  //   component: 'ComBaseSmoothStackLineDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '平滑堆叠面积图',
  //   component: 'ComBaseSmoothStacAreakLineDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '带数据折线图',
  //   component: 'ComBasePolyLabelLineDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '带标记点折线图',
  //   component: 'ComBaseMarkPointLineDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // 词云图部分
  // {
  //   name: '基础词云图',
  //   component: 'ComBaseWordCloudDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // // 河流图部分
  // {
  //   name: '基础河流图',
  //   component: 'ComBaseThemeRiverDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // 饼图部分
  // {
  //   name: '半环与基础环形图',
  //   component: 'ComBaseHalfPieDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '玫瑰图',
  //   component: 'ComBaseRosePieDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // 雷达图部分
  // {
  //   name: '雷达图',
  //   component: 'ComBaseRadarDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '带数据标签的区域雷达图',
  //   component: 'ComBaseAreaRadarDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // 力图部分
  // {
  //   name: '多对多力图',
  //   component: 'ComBaseForceGraphAllDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '多对一力图',
  //   component: 'ComBaseForceGraphSingleDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // 区域连线和地图部分 lineMap
  // {
  //   name: '区域连线的上海地图',
  //   component: 'ComBaseLineShanghaiMapDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // 仪表盘进度条 progress
  // {
  //   name: '基础进度图',
  //   component: 'ComBaseProgressDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '数值仪表盘',
  //   component: 'ComBaseGaugeNormalDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '数值仪表盘带边框',
  //   component: 'ComBaseGaugeBorderDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '圆形带刻度数值仪表盘',
  //   component: 'ComBaseGaugeOnlyLabelDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '圆形带指针单色仪表盘',
  //   component: 'ComBaseGaugePointerSingleDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // {
  //   name: '圆形带指针多色仪表盘',
  //   component: 'ComBaseGaugePointerMultiDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // // 桑基图 sankey
  // {
  //   name: '基础桑基图',
  //   component: 'ComBaseSankeyDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // // 桑基图 sankey
  // {
  //   name: '基础漏斗图',
  //   component: 'ComBaseFunnelDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
  // // 排行条形图 rankingBar
  // {
  //   name: '排行条形图',
  //   component: 'ComBaseRankingBarDesign',
  //   cssc: {
  //     w: 420,
  //     h: 208,
  //   },
  // },
  // 条形图 horizontalBar
  // {
  //   name: '基础漏斗图',
  //   component: 'ComBaseHorizontalBarDesign',
  //   cssc: {
  //     w: 300,
  //     h: 300,
  //   },
  // },
];
