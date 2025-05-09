import { defineComponent, inject, ComputedRef, computed, provide } from 'vue';
import { VObject } from '@/lib/vails/model/index';
import { cloneDeep, merge } from 'lodash';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';
import useKey from '../../TaTemplateForm/designer/useKey';
import { useScreenDesignerConfigInject } from '@/components/global/ta-component/TaBuilder/builder/useScreenDesignerConfig';

export const SLOT_ARGUMENTS_KEY = 'defineTaBuilderCellComponentSlotArguments';

export const defineTaBuilderCellComponent = (sourceConfig: VObject) => {
  const mixin = {
    data() {
      return {
        __propsConfig: sourceConfig.props,
        __defaultTemplate: convertPropsConfigToTemplate(sourceConfig.props),
        __template: convertPropsConfigToTemplate(sourceConfig.props),
      };
    },
  };
  return defineComponent(
    merge(
      {},
      sourceConfig,
      {
        props: {
          slotArguments: { type: Object, default: () => ({}) },
          componentSchema: { type: Object, default: undefined },
        },
        setup(props: any, proxy: any) {
          // console.log('props.slotArguments', Object.keys(props.slotArguments || {}));
          const slotArguments = computed(() => props.slotArguments);
          provide(SLOT_ARGUMENTS_KEY, slotArguments);

          return sourceConfig.setup(props, proxy);
        },
      },
      {
        mixins: [mixin],
      },
    ),
  );
};

const { generateKey } = useKey();

const formTypeMap: VObject = {
  dataSource: 'select',
};

export const convertPropsConfigToTemplate = (propsConfig: VObject): TaTemplateFormItem => {
  const { dataSourceSelect } = useScreenDesignerConfigInject();

  const groupMapping: VObject = {};
  const lonelyFields: TaTemplateFormItem[] = [];
  Object.keys(propsConfig).forEach((key: string) => {
    const prop = propsConfig[key];

    if (prop.hidden) return;
    // if (prop.type.name === 'String') {

    const field: TaTemplateFormItem = {
      name: prop.label || prop.key,
      type: formTypeMap[prop.formType] || prop.formType || 'input',
      rules: [],
      model: { attr_type: prop.attrType || prop.type?.name || 'number' },
      options: {
        span: 24,
        defaultValue: typeof prop.default === 'function' ? prop.default() : prop.default,
        select: prop.formType === 'dataSource' ? dataSourceSelect.value : prop.select,
        fileSize: prop.formType === 'image_single' ? 20 : undefined,
      },
      fields: [convertPropsConfigToTemplate(prop.subProps || {})],
      key: generateKey({ type: 'string' }),
      model_key: key,
      conditions: [],
      model_key_prefix: typeof prop.modelKeyPrefix === 'string' ? prop.modelKeyPrefix : 'props',
    };
    if (prop.group) {
      if (!groupMapping[prop.group]) {
        groupMapping[prop.group] = [];
      }
      groupMapping[prop.group].push(field);
    } else {
      lonelyFields.push(field);
    }
    // }
    // return {};
  });

  return {
    key: 'layout',
    type: 'layout',
    fields: [
      ...lonelyFields,
      ...Object.keys(groupMapping).map((group: string, index: number) => ({
        key: generateKey({ type: `collapsed-group-${group}-${index}` }),
        name: group,
        model_key: generateKey({ type: `collapsed-group-${group}-${index}` }),
        type: 'layout',
        options: {
          collapse: true,
        },
        fields: groupMapping[group],
      })),
    ],
    options: {
      theme: 'none',
    },
  };
};
