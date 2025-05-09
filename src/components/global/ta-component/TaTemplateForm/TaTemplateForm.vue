<script lang="ts">
import { VModel } from '@/lib/vails';
import { defineComponent, toRefs, PropType, ref, computed, provide, onMounted, inject } from 'vue';
import {
  TaTemplateFormItem,
  TaTemplateFormAccessibility,
  TaTemplateFormTheme,
} from '@/components/global/ta-component/ta-template-form-core/types';
import { useFormProvide } from '@/components/global/ta-component/ta-template-form-core/useForm';
import useOptionsConfig from '@/components/global/ta-component/ta-template-form-core/useOptionsConfig';
import useFieldComponentCollector from '../ta-template-form-core/useFieldComponentCollector';
import useAutoTemplateForm from '../ta-template-form-core/useAutoTemplateForm';
import { VObject } from '@/lib/vails/model';
import { useContextProvide } from '@/components/global/ta-component/ta-template-form-core/useContext';
import { useRoute } from 'vue-router';
import { merge } from 'lodash';
import { useSubFormCollector } from '../ta-template-form-core/useSubFormCollector';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';
import { fieldPrefixId } from './TaTemplateFormField.vue';
import { useAccessibilityProvide } from '../ta-template-form-core/useAccessibility';
import dayjs from 'dayjs';
import Schema from 'async-validator';
import { useFormNoProvide } from '../ta-template-form-core/useFormNo';

const TaTemplateForm = defineComponent({
  name: 'TaTemplateForm',
  components: {},
  props: {
    template: {
      type: [Object, String] as PropType<TaTemplateFormItem | string>,
      required: true,
    },
    record: { type: Object as PropType<VModel>, default: () => ({}) },
    skipValidate: { type: Boolean, default: false },
    modelValue: { type: Object, default: undefined },
    accessibility: { type: Array as PropType<TaTemplateFormAccessibility[]>, default: () => [] },
    registerSubForm: { type: Boolean, default: true },
    useDefaultTheme: { type: Boolean, default: false },
    hideEmpty: { type: Boolean, default: false },
    context: { type: Object, default: () => ({}) }, // 上下文
    showFormNo: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'templateFetched', 'syncValue'],
  setup(props, { emit }) {
    provide('isViewer', false);
    const openTime = dayjs().unix();
    const workflow = inject<any>('provideWorkflow'); // 为了特殊处理埋点事件
    onMounted(async () => {
      await fetchTemplate();
      emit('templateFetched', localTemplate.value);
      sendPoint();
      setDefaultValue();
    });
    // 发送埋点数据
    const sendPoint = () => {
      if (props.template) {
        const theme = localTemplate.value.options?.theme as TaTemplateFormTheme;
        (window as any)?.$trackCustomEvent?.('TablePage', {
          table_id: props.template,
          table_type:
            theme?.card?.title ||
            theme?.card?.content ||
            theme?.card?.files ||
            workflow?.value?.name,
          source: route.meta?.name || route.path,
        });
      }
    };
    const { localTemplate, fetchTemplate } = useAutoTemplateForm(props);

    const form = ref<any>(null);

    const { registerSubFormCollector, initSubFormCollector } = useSubFormCollector();

    const { subFormCollector } = initSubFormCollector();

    const submit = (
      callback?: {
        success?: (formData: VObject, localTemplate?: VObject) => void;
        fail?: (error: Error, localTemplate?: VObject) => void;
        skipValidate?: boolean;
      },
      editApi?: any,
    ) => {
      const shouldSkipValidation = props.skipValidate || callback?.skipValidate;
      if (shouldSkipValidation) {
        return new Promise((resolve, reject) => {
          try {
            (props.record.save ? props.record.save({}, editApi) : Promise.resolve({})).then(() => {
              resolve(props.record.formData);
            });
          } catch (e) {
            reject(e);
          }
        });
      }

      return validate()
        .then(async () => {
          const res = await (props.record.save
            ? props.record.save({}, editApi)
            : Promise.resolve({}));
          callback?.success && callback.success(res, { localTemplate, openTime });
          return props.record.formData;
        })
        .catch((error: any) => {
          if (error.errorFields && error.errorFields[0]) {
            const id = `${fieldPrefixId}${error.errorFields[0].name.join('-')}`;
            const node = document.getElementById(id);
            if (node) {
              scrollIntoView(node, {
                scrollMode: 'if-needed',
                block: 'nearest',
                behavior: 'smooth',
              });
            }
          }
          callback?.fail && callback.fail(error, { localTemplate });
          throw error;
        });
    };

    const optionsReactive = computed(() => localTemplate.value.options);
    useOptionsConfig(optionsReactive);

    const { addField, removeField, fieldComponents } = useFieldComponentCollector();

    const value = computed({
      get: () => {
        const result =
          typeof props.modelValue !== 'undefined' ? props.modelValue : props.record.formData;
        // merge(result, { '': {} });
        return result;
      },
      set: val => {
        if (typeof props.modelValue !== 'undefined') {
          emit('update:modelValue', val);
        } else {
          Object.assign(props.record.formData, val);
        }
      },
    });

    const validate = () => {
      return Promise.all([
        form.value?.validate(),
        ...subFormCollector.value.map((form: any) => form?.validate?.()),
      ]);
    };

    const validateWithoutRaiseError = async () => {
      const promise = new Promise(resolve => {
        const descriptor = fieldComponents.value.reduce((out: VObject, field: any) => {
          if (field.name && field.rules) {
            return {
              ...out,
              [field.name.join('.')]: field.rules,
            };
          }
          return out;
        }, {} as VObject);

        const validator = new Schema(descriptor);
        validator
          .validate(value.value)
          .then(() => {
            resolve(true);
          })
          .catch(() => {
            resolve(false);
          });
      });

      const result = await Promise.all([
        promise,
        ...subFormCollector.value.map((form: any) => form?.validateWithoutRaiseError?.()),
      ]);

      return result.reduce((a: boolean, b: boolean) => a && b, true);
    };

    const route = useRoute();
    const contextRef = computed(() => merge({}, value.value, props.context));
    const { context } = useContextProvide(contextRef, route);

    const setDefaultValue = () => {
      const formDefaultValue = value.value?.id
        ? localTemplate.value.model?.update_default_value
        : localTemplate.value.model?.create_default_value;
      if (formDefaultValue && Object.keys(formDefaultValue).length > 0) {
        merge(value.value, formDefaultValue);
      }
    };

    const accessibilityComputed = computed(() => props.accessibility || []);

    useAccessibilityProvide(accessibilityComputed);

    const scrollIntoViewByKey = (
      key: string,
      mode: 'if-needed' | 'always' | undefined = 'if-needed',
    ) => {
      const node = fieldComponents.value.find((comp: any) => comp.item.key === key)?.$el;
      if (node) {
        scrollIntoView(node, {
          scrollMode: mode,
          block: 'start',
          behavior: 'smooth',
        });
      }
    };

    const onSyncValue = (item: TaTemplateFormItem, name: string[], value: any) => {
      emit('syncValue', item, name, value);
    };

    return {
      ...toRefs(props),
      form,
      submit,
      addField,
      removeField,
      localTemplate,
      value,
      validate,
      registerSubFormCollector,
      subFormCollector,
      scrollIntoViewByKey,
      fieldComponents,
      // eslint-disable-next-line vue/no-dupe-keys
      context,
      fetchTemplate,
      validateWithoutRaiseError,
      onSyncValue,
    };
  },
  created() {
    useFormProvide(this);
    if (this.showFormNo) {
      useFormNoProvide(this);
    }
    if (this.registerSubForm) {
      this.registerSubFormCollector(this);
    }
  },
});
export default TaTemplateForm;
</script>

<template lang="pug">
.ta-template-form
  //- | formData: {{ value }}
  //- | context: {{ context }}
  //- | template {{ localTemplate }}
  //- | accessibility {{ accessibility }}
  a-form(
    ref='form',
    :model='value',
    :scrollToFirstError='true',
  )
    TaTemplateFormNormalLayout(:item='localTemplate', :useDefaultTheme='useDefaultTheme')
</template>

<style lang="stylus" scoped></style>
