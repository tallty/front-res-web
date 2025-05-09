import { VObject } from '@/lib/vails';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';
import { TaTemplateFormItemValidators } from './validators';
import useProcessFields from '../../ta-template-form-core/useProcessFields';
import { Modal } from 'ant-design-vue';

const { processField } = useProcessFields();

export const TaTemplateFormItemValidate = (item: TaTemplateFormItem) => {
  return new Promise<void>((resolve, reject) => {
    const errorInfos: VObject[] = [];
    const promises: Promise<void>[] = [];

    processField(item, {}, async field => {
      TaTemplateFormItemValidators.forEach(validator => {
        promises.push(
          validator.validate(field).catch(() => {
            errorInfos.push({ field, validator });
          }),
        );
      });
    });

    Promise.all(promises)
      .then(() => {
        if (errorInfos.length > 0) {
          reject('存在设置错误');

          Modal.warning({
            title: '表单存在设置错误，是否自动修复？',
            content: errorInfos
              .map(({ field, validator }) => `${field.name} ${validator.message}`)
              .join('\n'),
            okText: '好的',
            onOk: () => {
              errorInfos.forEach(({ field, validator }) => {
                validator.fix(field);
              });
            },
          });
        } else {
          resolve();
        }
      })
      .catch(() => {
        reject('存在未知设置错误');
      });
  });
};
