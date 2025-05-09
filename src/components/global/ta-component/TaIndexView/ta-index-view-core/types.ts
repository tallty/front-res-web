import { VStore } from '@/lib/vails/store/index';
import VApi from '@/lib/vails/api/index';
import { VObject } from '@/lib/vails/model/index';
import { ColumnType } from 'ant-design-vue/lib/table/interface';
import { TaTemplateFormItem, TaTemplateFormStepsStep } from '../../ta-template-form-core/types';

export interface TaIndexViewTabSpecialInterface {
  key: string;
  label: string;
  num?: number;
  background?: string;
  color?: string;
  query?: VObject;
  // tab 切换时进入的 route
  route?: string;
  // tab 宽度
  width?: number;
  tags?: TaIndexViewTagInterface[];
  meta?: VObject;
}

export interface TaIndexViewTagSpecialInterface {
  key: string;
  label: string;
  num?: number;
  background?: string;
  color?: string;
  query?: VObject;
  route?: string;
  width?: number;
  meta?: VObject;
}

export interface TaIndexViewConfigInterface {
  store: VStore<any>;
  params?: VObject;
  statCondition?: {
    collection?: VObject;
    resource?: VObject;
  };
  interval?: number;
  api?: any;
  editApi?: VApi;
  pagination?: TaIndexViewPaginationConfigInterface;
  mode?: 'table' | 'list' | 'custom' | 'grouped_table' | 'grouped_list';
  // 树是否禁用父节点
  disable_tree_parent?: boolean;
  // recordName 用于搜索 tips 与 placeholder 显示
  recordName: string;
  // 是否显示 tab 的数字
  showCount?: boolean;
  // 多选框配置
  selection?: {
    showByDefault?: boolean;
    showSwitch?: boolean;
    notMultiple?: boolean;
    rowDisabled?: boolean;
    getCheckboxProps?: (record: VObject) => VObject;
  };
  //
  layout?: {
    direction?: {
      tabsLayout?: TaIndexViewLayoutDirection;
      tagsLayout?: TaIndexViewLayoutDirection;
    };
  };
  // 是否显示创建、导入、导出、member 方法、collection 方法
  actions?: TaIndexViewTableOldActionsInterface | TaIndexViewAction[];
  // 表格配置，基于 antd 表格
  table?: TaIndexViewTableConfigInterface;
  list?: TaIndexViewListConfigInterface;
  tree?: TaIndexViewTreeConfigInterface;
  splitCount?: number; // 兼容老版本
  // 详情配置
  detail?: {
    mode?: 'drawer' | 'dialog' | 'route' | 'window' | 'auto';
    url?: string;
    width?: number | string;
    mask?: boolean;
    hideTitle?: boolean;
  };
  form?: {
    mode?: 'drawer' | 'dialog' | 'route' | 'window' | 'auto';
    url?: string;
    width?: number | string;
    mask?: boolean;
    hideTitle?: boolean;
    temporaryStorage?: {
      enable?: boolean;
      location?: string;
    };
    closeConfirm?: boolean;
  };
  // 是否可拖动
  draggable?: boolean;
  // 是否滚动加载
  scrollLoading?: boolean;
  // 多选时使用的 key，默认为 id
  rowKey?: string;
  // 简单搜索配置
  searcherSimpleOptions?: TaIndexSearcherOptionInterface[];
  // 复杂搜索配置
  searcherComplicatedOptions?: TaIndexSearcherOptionInterface[];
  // 通用表单的 template
  template?: TaTemplateFormItem | string;
  batchUpdateTemplate?: TaTemplateFormItem | string;
  steps?: TaTemplateFormStepsStep[];
  // 创建编辑时的格式化函数，解码成 template 需要的格式
  // formDataDecode?: Function;
  // 编辑初始化 formData 时的格式化函数，组件内 onEdit 中使用，编码成 template 需要的格式
  formDataEncode?: (formData: VObject) => VObject;
}

// tab 类型由 tab special 类型 + config 类型
export type TaIndexViewTabInterface = TaIndexViewTabSpecialInterface &
  Partial<TaIndexViewConfigInterface>;

// tag 类型由 tag special 类型 + config 类型
export type TaIndexViewTagInterface = TaIndexViewTagSpecialInterface &
  Partial<TaIndexViewConfigInterface>;

export type TaIndexViewLayoutDirection =
  | 'left-to-right'
  | 'right-to-left'
  | 'top-to-bottom'
  | 'bottom-to-top';

export interface TaIndexSearcherOptionInterface {
  key: string;
  label: string;
  type: 'number' | 'string' | 'select' | 'time' | 'date' | 'dynamicComponent';
  select?: { label: string; value: any }[];
  options?: { label: string; query: VObject }[];
  multiple?: boolean;
  group?: string;
  hide_custom?: boolean;
  use_range?: boolean;
  component?: string;
  complicatedHidden?: boolean;
  simpleHidden?: boolean;
}

export interface TaIndexImportHeader {
  _id?: string;
  key: string;
  name: string | null;
  primary_key?: boolean;
}
export interface TaIndexViewTableOldActionsInterface {
  create?: boolean;
  update?: boolean;
  delete?: boolean;
  import?:
    | {
        importHeaders?: TaIndexImportHeader[];
      }
    | boolean;
  export?:
    | {
        exportTemplate?: TaTemplateFormItem;
      }
    | boolean;
}

export interface TaIndexViewAction {
  key: string;
  label?: string;
  enabled: boolean;
  icon?: string;
  confirm?: boolean;
  action_type?: 'selectable' | 'collection' | 'member';
  callback?: (params: any) => void;
  options?: VObject & { confirmText?: any };
  collapsed?: boolean;
  exportFilename?: string | (() => string);
}

export interface TaIndexViewFetchDataOptsInterface {
  silence?: boolean;
}

export interface TaIndexViewPaginationConfigInterface {
  hide?: boolean; // 是否隐藏
  perPage?: number; // 每页条数
  showPageSizeChanger?: boolean; // 是否显示每页数量的切换
  hideOnSinglePage?: boolean; // 在只有一页时隐藏分页
  showSizeChanger?: boolean; // 是否显示每页数量的切换
  pageSizeOptions?: string[]; // 每页数量切换的待选项
  emptyText?: string; // 空内容时显示文字
  showTotal?: (total: number, range: number[]) => string; // 总页数显示回调
}

export interface TaIndexViewTableConfigInterface {
  autoOff?: boolean;
  rowKey?: string;
  rowSelection?: VObject | null;
  customRow?: (record: VObject, index: number) => any;
  scroll?: VObject | null;
  rowClassName?: (...args: any[]) => any | string;
  // emptyText?: string;
  size?: string;
  paginationSize?: string;
  bordered?: boolean;
  showHeader?: boolean;
  rowSelectionType?: 'radio' | 'checkbox';
  columns?: (ColumnType | TaIndexTableColumnInterface)[];
  pushColumns?: (ColumnType | TaIndexTableColumnInterface)[];
  // filters: dataIndex => value ary
  filtersProcessor?: (filters: VObject) => VObject;
  titleClassName?: string;
  titleStyle?: VObject;
  colClassName?: string;
  colStyle?: VObject;
  tableLayout?: 'auto' | 'fixed';
  // 是否开启无缝滚动
  seamlessScroll?: boolean;
  skin?: string;
  actionColumnFixed?: boolean;
  expandedRowRender?: boolean;
  childrenColumnName?: string;
}

export interface TaIndexTablePaginationInterface {
  current: number;
  pageSize: number;
  total: number;
}

export interface TaIndexTableColumnInterface {
  title: string;
  dataIndex: string;
  width: number;
  fixed?: 'right' | 'left';
  align?: 'right' | 'left' | 'center';
}

export interface TaIndexTableSorterInterface {
  order?: string;
  field?: string;
  columnKey?: string;
  column?: VObject;
}

export interface TaIndexViewListConfigInterface {
  // 列表视图时，一行分为几块
  splitCount?: number;
  scroll?: { x: string; y: string }; // '10vw' or 'auto'
  emptyKey?: string;
  gap?: number;
  gapColumn?: number;
}

export interface TaIndexViewTreeConfigInterface {
  //
  selectableFn: (record: VObject) => boolean;
}

export interface TaIndexTreeItem {
  idKey: number | string | null;
  parentKey?: number | string | null;
  label: string;
  record: any;
  count?: number;
  tag?: string;
  tag_color?: string;
  icon?: string;
  selectable?: boolean;
  create?: {
    template?: TaTemplateFormItem | string;
    store?: any;
    encodeFormData?: (item: TaIndexTreeItem) => VObject;
    callback?: (node: TaIndexTreeItem) => void;
  };
  update?: {
    template?: TaTemplateFormItem | string;
    store?: any;
    callback?: (node: TaIndexTreeItem) => void;
  };
  delete?:
    | {
        callback?: (node: TaIndexTreeItem) => void;
      }
    | boolean;
  meta?: VObject;
}
