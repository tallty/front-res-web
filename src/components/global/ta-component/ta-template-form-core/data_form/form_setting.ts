import { VObject } from '@/lib/vails';
import {
  TaTemplateFormItem,
  TaTemplateFormLayoutTypeAry,
  TaTemplateFormModelKeyConfiguration,
  TaTemplateFormSelect,
  TaTemplateFormStepsStep,
} from '../types';
import { DataFormFormConfInterface, DataFormFormSettingInterface } from './types';
import useProcessFields from '../useProcessFields';

const { getIsFormEmpty, processField } = useProcessFields();

export class FormSetting {
  value: DataFormFormSettingInterface;

  constructor(value: DataFormFormSettingInterface) {
    this.value = value;
  }

  get steps(): TaTemplateFormStepsStep[] {
    return (this.value.setting?.confs || [])
      .map(
        (item: DataFormFormConfInterface): TaTemplateFormStepsStep =>
          item.options?.complete_component
            ? {
                title: '',
                type: 'dynamicComponent',
                modelKeyPrefix: `data_form_payload.data_form_${item.seq}_payload`,
                dynamicComponent: item.options.complete_component,
              }
            : {
                title: '',
                type: 'form',
                modelKeyPrefix: `data_form_payload.data_form_${item.seq}_payload`,
                form: item.conf?.form,
              },
      )
      .filter((item: VObject) => !!item.dynamicComponent || !getIsFormEmpty(item.form || {}));
  }

  seqExists(seq: string) {
    return this.value.setting?.confs?.some((conf: DataFormFormConfInterface) => conf.seq == seq);
  }

  get isEmpty() {
    return this.value.setting?.confs?.length === 0 || this.value.form_empty;
  }

  get simplePerfOptions(): TaTemplateFormSelect[] {
    return (this.value.setting?.confs || []).reduce(
      (out: TaTemplateFormSelect[], conf: DataFormFormConfInterface) => {
        const result: TaTemplateFormSelect[] = [];
        processField(
          conf.conf?.form || {},
          {},
          (i: TaTemplateFormItem) => {
            if (TaTemplateFormLayoutTypeAry.includes(i.type!)) return;
            if (i.model_key_configuration) {
              i.model_key_configuration.forEach((c: TaTemplateFormModelKeyConfiguration) => {
                result.push({
                  label: c.custom_label,
                  value: [i.model_key_prefix, c.model_key].filter(i => i).join('.'),
                  meta: { form_conf_seq: conf.seq },
                });
              });
            }
            result.push({
              label: i.name,
              value: [i.model_key_prefix, i.model_key].filter(i => i).join('.'),
              meta: { form_conf_seq: conf.seq },
            });
          },
          (i: TaTemplateFormItem, parent: TaTemplateFormItem) => parent.type !== 'list',
        );

        return [...out, ...result];
      },
      [],
    );
  }

  getDataFormOptions(name: string, metaFn = (args: VObject) => args): TaTemplateFormSelect[] {
    return (
      this.value?.setting?.confs?.map((conf: DataFormFormConfInterface, index: number) => ({
        label: conf.name ? `[${index + 1}][${name}]${conf.name}` : `[${index + 1}][${name}]`,
        value: conf.seq,
        meta: metaFn({
          form: conf.conf?.form,
        }),
      })) || []
    );
  }

  static get initFormSettingValue(): DataFormFormSettingInterface {
    return { setting: { confs: [], type: 'copy' } };
  }
}
