<script lang="ts">
import {
  TaTemplateFormItem,
  TaTemplateFormRule,
} from '@/components/global/ta-component/ta-template-form-core/types';
import { cloneDeep, debounce, isEqual } from 'lodash';
import {
  computed,
  ComputedRef,
  defineComponent,
  inject,
  nextTick,
  PropType,
  ref,
  toRefs,
  watch,
} from 'vue';
import { IFile } from '../file/file';
import useFormField from '../ta-template-form-core/useFormField';
import { useFormFieldCustomModelKey } from '../ta-template-form-core/useFormFieldCustomModelKey';
import { useFormNoInject } from '../ta-template-form-core/useFormNo';
import { useJsonataInTaTemplateForm } from '../ta-template-form-core/useJsonata';
import { getTaTemplateFormFieldExtraPropsMap, getTaTemplateFormFieldMap } from './form/types';

export const fieldPrefixId = 'ta-template-form-field-id-';

const TaTemplateFormField = defineComponent({
  name: 'TaTemplateFormField',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    size: { type: String, default: 'default' },
    // ...formNoProps,
  },
  setup(props) {
    const {
      value: formValue,
      isViewer,
      hidden,
      disabled,
      headerLabelStyle,
      formComponent,
      valueKey,
      labelStyle,
      localOptionsConfig,
    } = useFormField(props);

    const { formNo } = useFormNoInject(computed(() => props.item));
    const { customModelKeyAccessorProps, multiKeyValidateRules } = useFormFieldCustomModelKey(
      props,
      formComponent,
    );

    const formSeq = computed(() => formComponent.seq);
    const accordionContext = inject('accordion', {}) as any;

    const fileAllFinished = ref(true);
    const fileAllSucceeded = ref(true);

    const localValue = ref(formValue.value);

    // 相同引用的 对象，会导致 isEqual 值为 true
    let oldFormValueCache: any = undefined;
    watch(
      formValue,
      val => {
        nextTick(() => {
          if (isEqual(val, localValue.value) || isEqual(val, oldFormValueCache)) {
            return;
          }

          localValue.value = cloneDeep(val);
          oldFormValueCache = cloneDeep(val);
        });
      },
      {
        deep: true,
      },
    );

    const onLocalValueChange = (val: any) => {
      setValueDebounce(cloneDeep(val));
    };

    const setValueDebounce = debounce((val: any) => {
      formValue.value = val;
    }, 200);

    let oldValueCache: any = undefined;
    // 直接改变引用对象的值，不会触发 update:value
    watch(
      localValue,
      newValue => {
        // 不同值，或 相同引用对象
        if (!isEqual(newValue, oldValueCache)) {
          onLocalValueChange(newValue);
          oldValueCache = cloneDeep(newValue);
        }
      },
      { deep: true },
    );

    const startUpload = () => {
      fileAllFinished.value = false;
    };

    const onFileUploaderAllSettle = (doneFiles: IFile[], errorFiles: IFile[]) => {
      fileAllFinished.value = true;
      if (errorFiles.length > 0) {
        fileAllSucceeded.value = false;
      } else {
        fileAllSucceeded.value = true;
      }
      setTimeout(() => {
        formComponent.form.validate([valueKey.value]);
      }, 400);
    };

    const fieldRef = ref<any>(null);

    const rules: ComputedRef<any[]> = computed(() => {
      // 如果字段隐藏且没有设置validateWhenHidden为true，则不验证
      if (hidden.value && !(props.item.options?.validateWhenHidden === true)) {
        return [];
      }

      return [
        ...(props.item.rules || [])
          .filter(
            (rule: TaTemplateFormRule) =>
              // 过滤掉 model_key 为空的 required 验证，交由其他自定义验证执行验证
              !(rule.required && name.value.filter((i: any) => i).length === 0) &&
              (props.item.model_key_configuration || []).length <= 0,
          )
          .map((rule: TaTemplateFormRule) => {
            const ruleDup = cloneDeep(rule);
            if (ruleDup.pattern) {
              ruleDup.pattern = new RegExp(ruleDup.pattern);
            }
            return ruleDup;
          }),
        {
          validator: () => {
            return new Promise<void>((resolve, reject) => {
              if (fileAllFinished.value) {
                resolve();
              } else {
                // eslint-disable-next-line prefer-promise-reject-errors
                reject('文件未上传完成');
              }
            });
          },
        },
        {
          validator: () => {
            return new Promise<void>((resolve, reject) => {
              if (fileAllSucceeded.value) {
                resolve();
              } else {
                // eslint-disable-next-line prefer-promise-reject-errors
                reject('有文件上传失败，请确认');
              }
            });
          },
        },
        {
          validator: () => {
            return new Promise<void>((resolve, reject) => {
              if (typeof fieldRef.value?.validate === 'function') {
                fieldRef.value
                  ?.validate()
                  .then(() => {
                    resolve();
                  })
                  .catch((errMsg: string) => {
                    reject(errMsg);
                  });
              } else {
                resolve();
              }
            });
          },
        },
        ...multiKeyValidateRules.value,
      ];
    });

    // 用于 antdv a-form-item 验证
    const name = computed(() => {
      const key = Array.isArray(valueKey.value) ? valueKey.value[0] : valueKey.value;
      return key && key.split('.').length > 1 ? key.split('.') : [key];
    });

    const cssClass = computed(() => ({
      'ta-template-form-field__no_label': !(props.item.name || props.item.options?.icon),
      'ta-template-form-field__horizontal': localOptionsConfig.value?.layout === 'horizontal',
      'ta-template-form-field__vertical':
        !localOptionsConfig.value?.layout || localOptionsConfig.value?.layout === 'vertical',
    }));

    const { insertContext } = useJsonataInTaTemplateForm();

    const isLayoutBorder = computed(() => {
      return isViewer && localOptionsConfig?.value?.layout_border;
    });

    const onSyncValue = (item: TaTemplateFormItem, value: any) => {
      formComponent.onSyncValue(item, name.value, value);
    };

    const formFieldComponentName = computed(() =>
      props.item.type ? getTaTemplateFormFieldMap(props.item)[props.item.type] : '',
    );

    const formFieldExtraProps = computed(() =>
      props.item.type ? getTaTemplateFormFieldExtraPropsMap(props.item)[props.item.type] : '',
    );

    return {
      ...toRefs(props),
      localValue,
      isViewer,
      isLayoutBorder,
      disabled,
      hidden,
      headerLabelStyle,
      accordionContext,
      onFileUploaderAllSettle,
      startUpload,
      rules,
      valueKey,
      name,
      formComponent,
      labelStyle,
      fieldRef,
      fieldPrefixId,
      cssClass,
      formSeq,
      insertContext,
      onSyncValue,
      formFieldComponentName,
      formFieldExtraProps,
      customModelKeyAccessorProps,
      onLocalValueChange,
      formNo,
    };
  },
  created() {
    if (this.accordionContext.addField) {
      this.accordionContext.addField(this);
    }
    if (this.formComponent.addField) {
      this.formComponent.addField(this);
    }
  },
  beforeUnmount() {
    if (this.accordionContext.removeField) {
      this.accordionContext.removeField(this);
    }
    if (this.formComponent.removeField) {
      this.formComponent.removeField(this);
    }
  },
});
export default TaTemplateFormField;
</script>

<template lang="pug">
.ta-template-form-field(
  v-show='!hidden',
  :id='`${formSeq}${fieldPrefixId}${name}`',
  :class='cssClass'
)
  .label-component.whitespace-pre-line(v-if='item.type === "label"', :style='labelStyle')
    | {{ insertContext(item.name) }}
  a-form-item.ta-form-item(
    v-else,
    :name='name',
    :colon='false',
    :rules='rules',
    :class='isLayoutBorder ? "ta-template-form-field__Border" : undefined'
  )
    template(#label)
      .label.w-full.font-medium.whitespace-pre-line.flex.items-center(
        v-if='item.name || item.options?.icon'
      )
        TaIcon.label-icon(v-if='item.options?.icon', :type='item.options.icon')
        .label-text.items-center.truncate.w-full(
          :style='headerLabelStyle',
          :class='{ "viewer-label": isViewer }'
        )
          a-tooltip
            template(#title)
              | {{ insertContext(item.name) }}
            .w-full.break-words.whitespace-pre-wrap.text-left
              span(v-if='formNo') {{ formNo }}-
              | {{ insertContext(item.name) }}
          a-tooltip(v-if='item.options?.info', :title='item.options.info')
            TaIcon.ml-2.info-icon.h-4.w-4.text-gray-400(type='solid/information-circle')

    a-form-item.ta-template-form-field__item(v-if='formFieldComponentName')
      component(
        :is='formFieldComponentName',
        ref='fieldRef',
        v-model:value='localValue',
        v-model:payload='formComponent.value',
        v-model:template='formComponent.localTemplate',
        :item='item',
        :disabled='disabled',
        :size='size',
        v-bind='{ ...formFieldExtraProps, ...customModelKeyAccessorProps, ...item.options?.props }',
        @syncValue='onSyncValue',
        @start='startUpload',
        @allSettle='onFileUploaderAllSettle',
        @update:value='onLocalValueChange'
      )
</template>

<style lang="stylus" scoped>
.label
  margin-left 12px
  .label-icon, .label-text
    margin-right 4px
.viewer-label
  color #8c8c8c
.ta-template-form-field
  width 100%
  display block
  padding 12px
  .label-component
    // min-height 40px
    background rgb(243, 244, 246)
    background var(--label-background-color, rgba($primary-color, 0.1))
    display flex
    align-items center
    padding 10px 20px
    margin-bottom 20px
    margin-top 20px
    color #383838
  .ta-template-form-field__Border
    border 1px solid #E5E7EB
    padding 6px 4px
    border-radius 8px
    >>>.ant-form-item-required::before
      display none !important
.ta-template-form-field__vertical
  .ta-form-item
    // flex-direction column !important
    display block
  >>> .ant-form-item-control
    flex none
  >>> .ant-form-item-no-colon
    width 100%
  .ta-template-form-field__item
    margin-left 12px
    margin-bottom 0
.ta-template-form-field__horizontal
  .ta-form-item
    flex-direction row !important
.ta-template-form-field__no_label
  padding 0
  >>> .ant-form-item-label
    display none
.ta-form-item
  display flex
  margin 0
  >>>.ant-form-item-control-wrapper
    flex 1
</style>
