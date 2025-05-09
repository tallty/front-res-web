import {
  TaTemplateFormCondition,
  TaTemplateFormItem,
} from '@/components/global/ta-component/ta-template-form-core/types';
import { TaFile } from '../file/servers';

export interface TaBuilderCssc {
  x?: number;
  y?: number;
  h?: number;
  w?: number;
  zIndex?: number;
  itemsAlgin?: string;
  justifyContent?: string;
  flexDirections?: string;
}

export interface TaBuilderComponent {
  key: string;
  name: string;
  parent_key: string | null;
  css?: string;
  cssc: TaBuilderCssc;
  component?: string;
  children?: TaBuilderComponent[]; // 将会被塞到 props 的 default slot
  props?: Record<string, TaBuilderProp>;
  events?: TaBuilderEvent[];
  slot?: string; // 所属的 slot key 名称，也会塞到 props 的对应 slot 里
  is_slot_root?: boolean;
  // index?: number;
}

export type TaBuilderProp = TaBuilderSimpleProp | TaBuilderComplexProp | TaBuilderSlotProp;

export type TaBuilderSimpleProp = string | number | boolean | any[] | Record<string, any>;

export interface TaBuilderComplexProp {
  type: 'value' | 'function' | 'expression';
  value: any;
  required: boolean;
}
export interface TaBuilderSlotProp {
  type: 'slot';
  condition: TaTemplateFormCondition;
  value: TaBuilderComponent[];
}

export const propIsSlotProp = (prop: TaBuilderProp): prop is TaBuilderSlotProp =>
  typeof prop === 'object' && prop !== null && !Array.isArray(prop) && prop.type === 'slot';

export const propIsComplexProp = (prop: TaBuilderProp): prop is TaBuilderComplexProp =>
  typeof prop === 'object' &&
  prop !== null &&
  !Array.isArray(prop) &&
  ['value', 'function', 'expression'].includes(prop.type);

export const propIsSimpleProp = (prop: TaBuilderProp): prop is TaBuilderSimpleProp =>
  !propIsSlotProp(prop) && !propIsComplexProp(prop);

export interface TaBuilderConfiguration {
  treeStruct: TaBuilderConfigurationTreeStruct;
  flatData: TaBuilderComponent[];
  template: TaTemplateFormItem;
}

export interface TaBuilderConfigurationTreeStruct {
  key: string;
  children: TaBuilderConfigurationTreeStruct[];
}

export interface TaBuilderEvent {
  mode?: 'page_setting' | 'href' | 'route' | 'change_value' | 'close' | 'file';
  page_setting_id?: number;
  url?: string;
  key?: string;
  value?: any;
  limit_size_attribute?: 'width' | 'height';
  limit_size_value?: number;
  offset_top?: string;
  location_href?: boolean;
  attachments?: TaFile[];
}
