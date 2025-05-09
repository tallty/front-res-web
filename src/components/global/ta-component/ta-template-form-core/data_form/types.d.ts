import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';
import { VObject } from '@/lib/vails';

export interface DataFormInterface {
  app_id?: number;
  create_user_id?: number;
  source_id?: number;
  record_id?: number;

  type: DataFormType;
  source_flag?: string;
  state?: string;
  payload: VObject;
  summary?: VObject;
  form_conf?: DataFormFormConfInterface;
  // new_form_conf?: DataFormFormConfInterface;
  options?: VObject;
  meta?: VObject;
  form_conf_seq: string;
  record?: VObject;
  record_type?: string;
}

export type DataFormType =
  | 'DataForm'
  | 'DataFormCreateRecord'
  | 'DataFormDestroyRecord'
  | 'DataFormRecordCreate'
  | 'DataFormUpdateRecord';

export interface DataFormFormSettingInterface {
  seq?: string;
  name?: string;
  layout?: string;
  setting: DataFormFormSettingSettingInterface;
  form_empty?: boolean;
}

export interface DataFormFormSettingSettingInterface {
  type: 'copy' | 'model_setting' | 'template';
  confs: DataFormFormConfInterface[];
  // type === 'model_setting'
  model_setting_identity?: string;
  setable_type?: string;
  setable_id?: string;
  // type === 'template'
  form_uuid?: string;
  extra_options?: VObject;
}

export interface DataFormFormConfInterface {
  seq?: string;
  name?: string;
  conf?: DataFormFormConfConfInterface;
  options?: {
    complete_component?: string;
    component?: string;
    configuration_component?: string;
  };
}

export interface DataFormFormConfConfInterface {
  type: 'copy' | 'model_setting' | 'template';
  form: TaTemplateFormItem;
  // type === 'model_setting'
  model_setting_identity?: string;
  conf_seq?: string;
  setable_type?: string;
  setable_id?: string;
  // type === 'template'
  template_uuid?: string;
}
