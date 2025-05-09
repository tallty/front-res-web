import { PropType } from 'vue';
import {
  TaTemplateFormItem,
  TaTemplateFormAccessibility,
  TaTemplateFormStepsStep,
} from '@/components/global/ta-component/ta-template-form-core/types';
import { VObject, VModel } from '@/lib/vails/model/index';

export const TaTemplateFormWithActionsProps = {
  template: {
    type: [Object, String] as PropType<TaTemplateFormItem | string>,
    required: true,
  },
  record: { type: Object as PropType<VModel & VObject>, default: () => ({}) },
  modelValue: { type: Object, default: undefined },
  loading: { type: Boolean, default: false },
  title: { type: String, default: '表单' },
  canDelete: { type: Boolean, default: true },
  canTemporaryStorage: { type: Boolean, default: false },
  tempStoreLocation: { type: String, default: 'backend' },
  canSaveAndCreateNext: { type: Boolean, default: false },
  accessibility: { type: Array as PropType<TaTemplateFormAccessibility[]>, default: () => [] },
  skipValidate: { type: Boolean, default: false },
  okText: { type: String, default: '' },

  editable: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  steps: { type: Array as PropType<TaTemplateFormStepsStep[]>, default: () => [] },
  editApi: { type: Object as PropType<any>, default: null },
  isPlane: { type: Boolean, default: false },
  context: { type: Object, default: () => ({}) }, // 上下文
};
