import { VObject } from '@/lib/vails';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';

export const TaTemplateFormItemValidators: VObject[] = [
  {
    validate: (item: TaTemplateFormItem) =>
      new Promise<void>((resolve, reject) => {
        const multiple = item.options?.multiple;
        item.rules?.forEach(rule => {
          rule.type === 'array' &&
            ![
              'file',
              'image_single',
              'image_single_new',
              'image_picker',
              'video_single',
              'image',
              'checkbox',
            ].includes(item.type!) &&
            multiple === false &&
            reject();
        });
        resolve();
      }),
    message: '单选验证类型设置错误',
    fix: (item: TaTemplateFormItem) => {
      const multiple = item.options?.multiple;
      item.rules?.forEach(rule => {
        if (rule.type === 'array' && multiple === false) {
          if (item.type === 'api') rule.type = 'number';
          if (['select', 'checkbox', 'radio'].includes(item.type!)) rule.type = 'string';
        }
      });
    },
  },
  {
    validate: (item: TaTemplateFormItem) =>
      new Promise<void>((resolve, reject) => {
        const multiple = item.options?.multiple;
        item.rules?.forEach(rule => {
          rule.type !== 'array' && multiple === true && reject();
        });
        resolve();
      }),
    message: '多选验证类型设置错误',
    fix: (item: TaTemplateFormItem) => {
      const multiple = item.options?.multiple;
      item.rules?.forEach(rule => {
        if (rule.type !== 'array' && multiple === true) {
          rule.type = 'array';
        }
      });
    },
  },
];
