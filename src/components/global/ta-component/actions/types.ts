import { VObject } from '@/lib/vails';

export enum TaPipelineType {
  DataForm = 'data_form',
  Jsonata = 'jsonata',
  Function = 'function',
  SourceMethod = 'source_method',
  Editor = 'editor',
  None = 'none',
}

export interface TaPipeline {
  type: TaPipelineType;
  // data_form
  form_conf_seq?: string;
  // jsonata
  formula?: string;
  // function
  name?: string;
  callback_class_name?: string;
  callback_method?: string;
  callback_params?: VObject;
  // source_method
  method?: string;
  // editor
  config?: VObject;
}

export enum TaConditionType {
  Lifecycle = 'lifecycle',
  Group = 'group',
  User = 'user',
  Old = 'old',
  BpmAction = 'bpm_action',
  MultiBpmAction = 'multi_bpm_action',
}

export interface TaCondition {
  type: TaConditionType;
  // lifecycle
  lifecycle?: string;
  // group
  actions_relation_type?: 'and' | 'or';
  actions?: TaAction[];
  // user
  user_rule?: VObject;
  user_method?: string;
  // old
  rule?: VObject;
  // bpm_action
  action?: string;
  // lifecycle?: string;
}

export interface TaAction {
  pipeline: TaPipeline;
  condition: TaCondition;
  trigger?: TaTrigger;
}

export enum TaTriggerType {
  ActiveRecord = 'active_record',
  DataFormRecordMethod = 'data_form_record_method',
  Function = 'function',
  SourceMethod = 'source_method',
  BpmCreateInstance = 'Bpm::Attr::Action::Trigger::TriggerCreateInstance',
  BpmCreateToken = 'Bpm::Attr::Action::Trigger::TriggerCreateToken',
  BpmSmsNotify = 'Bpm::Attr::Action::Trigger::TriggerSmsNotify',
  PerfUnitDefine = 'unit_define',
}

export interface TaTrigger {
  type: TaTriggerType;
  name?: string;
  // active_record
  parent_klass?: string;
  parent_id?: string;
  parent_form_conf_seq?: string;
  association?: string;
  klass?: string;
  default_values?: VObject;
  // data_form_record_method
  callback_method?: string;
  callback_params?: VObject;
  // function
  callback_class_name?: string;
  // callback_method?: string;
  // callback_params?: VObject;
  // source_method
  // callback_method?: string;
  // callback_params?: VObject;
}
