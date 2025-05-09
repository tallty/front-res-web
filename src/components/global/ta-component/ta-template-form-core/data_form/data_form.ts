import { FormSetting } from './form_setting';
import { DataFormFormSettingInterface, DataFormInterface } from './types';

export class DataForm {
  value: DataFormInterface;
  formSetting?: FormSetting;

  constructor(dataForm: DataFormInterface, formSetting?: DataFormFormSettingInterface) {
    this.value = dataForm;
    this.formSetting = formSetting ? new FormSetting(formSetting) : undefined;
  }

  get seq() {
    return this.value.form_conf_seq;
  }

  get formConf() {
    // return this.value.new_form_conf || this.value.form_conf;
    return this.value.form_conf;
  }

  get record() {
    return this.value.record;
  }

  get form() {
    return this.formConf?.conf?.form || {};
  }

  get formExists() {
    return (this.form?.fields?.length || 0) > 0;
  }

  get payload() {
    return this.value.payload;
  }

  get isEmpty() {
    return !this.payload || Object.keys(this.payload || {}).length == 0;
  }

  get isOldData() {
    if (!this.formSetting) return false;
    if (this.formSetting.isEmpty) return false;
    return !this.formSetting.seqExists(this.seq);
  }

  get customStatisticsComponent() {
    return this.formConf?.options?.component;
  }

  get customCompleteComponent() {
    return this.formConf?.options?.complete_component;
  }

  get customConfigruationComponent() {
    return this.formConf?.options?.configuration_component;
  }
}
