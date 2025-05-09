<script lang="ts">
import { VModel, VObject } from '@/lib/vails';
import { defineComponent, toRefs, PropType, provide, computed, onMounted, ref } from 'vue';
import { TaTemplateFormItem, TaTemplateFormAccessibility } from '../ta-template-form-core/types';
import { useFormProvide } from '../ta-template-form-core/useForm';
import useFieldComponentCollector from '../ta-template-form-core/useFieldComponentCollector';
import useAutoTemplateForm from '../ta-template-form-core/useAutoTemplateForm';
import { useContextProvide } from '../ta-template-form-core/useContext';
import { useRoute } from 'vue-router';
import { useAccessibilityProvide } from '../ta-template-form-core/useAccessibility';
import { useSubFormCollector } from '../ta-template-form-core/useSubFormCollector';
import { truncate, merge } from 'lodash';
import { useFormNoProvide } from '../ta-template-form-core/useFormNo';
import Schema from 'async-validator';

const TaTemplateFormViewer = defineComponent({
  name: 'TaTemplateFormViewer',
  components: {},
  props: {
    template: {
      type: [Object, String] as PropType<TaTemplateFormItem | string>,
      required: true,
    },
    record: { type: Object as PropType<VModel>, default: () => ({}) },
    modelValue: { type: Object, default: undefined },
    accessibility: { type: Array as PropType<TaTemplateFormAccessibility[]>, default: () => [] },
    useDefaultTheme: { type: Boolean, default: false },
    registerSubForm: { type: Boolean, default: true },
    hideEmpty: { type: Boolean, default: false },
    context: { type: Object, default: () => ({}) }, // 上下文
    skipMounted: { type: Boolean, default: false },
    showFormNo: { type: Boolean, default: false },
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
  setup(props) {
    provide('isViewer', true);

    onMounted(() => {
      if (!props.skipMounted) {
        fetchTemplate();
      }
    });

    const { localTemplate, fetchTemplate } = useAutoTemplateForm(props);

    const { addField, removeField, fieldComponents } = useFieldComponentCollector();

    const value = computed(() =>
      typeof props.modelValue !== 'undefined' ? props.modelValue : props.record.formData,
    );

    const route = useRoute();
    const contextRef = computed(() => merge({}, value.value, props.context));
    useContextProvide(contextRef, route);

    const accessibilityComputed = computed(() => props.accessibility || []);
    useAccessibilityProvide(accessibilityComputed);

    const form = ref<any>(null);
    const { registerSubFormCollector, initSubFormCollector } = useSubFormCollector();

    const { subFormCollector } = initSubFormCollector();
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

    return {
      ...toRefs(props),
      addField,
      removeField,
      value,
      localTemplate,
      form,
      registerSubFormCollector,
      validate,
      validateWithoutRaiseError,
    };
  },
});
export default TaTemplateFormViewer;
</script>

<template lang="pug">
.ta-template-form-viewer
  a-form(
    ref='form',
    :model='value',
    :layout='localTemplate.options?.layout',
    :scrollToFirstError='true',
  )
    TaTemplateFormNormalLayout(:item='localTemplate', :useDefaultTheme='useDefaultTheme')
</template>

<style lang="stylus" scoped></style>
