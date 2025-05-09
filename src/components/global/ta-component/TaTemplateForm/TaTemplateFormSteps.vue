<script lang="ts">
import { ref, defineComponent, toRefs, PropType, reactive, computed } from 'vue';
import {
  TaTemplateFormStepsStep,
  TaTemplateFormAccessibility,
} from '../ta-template-form-core/types';
import { VObject } from '@/lib/vails/model';
import { message } from 'ant-design-vue';
import { get, set, merge, cloneDeep, mergeWith } from 'lodash';
import dayjs from 'dayjs';
import { VModel } from '../../../../lib/vails/model/index';
import { useContextProvide } from '@/components/global/ta-component/ta-template-form-core/useContext';

const TaTemplateFormSteps = defineComponent({
  name: 'TaTemplateFormSteps',
  components: {},
  props: {
    record: { type: Object, default: () => ({}) },
    values: { type: [Array, Object], required: true },
    steps: { type: Array as PropType<TaTemplateFormStepsStep[]>, default: () => [] },
    // clickable 为 true 时，steps 可以随意切换，没有验证。
    clickable: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    actionable: { type: Boolean, default: true },
    onNextCallback: { type: Function, default: null },
    isPlane: { type: Boolean, default: false },
    accessibility: { type: Array as PropType<TaTemplateFormAccessibility[]>, default: () => [] },
    skipValidate: { type: Boolean, default: false },
    context: { type: Object, default: () => ({}) },
    vertical: { type: Boolean, default: false },
    stepHide: { type: Boolean, default: false },
  },
  emits: ['update:values', 'beforeComplete', 'complete', 'fail', 'cancel'],
  setup(props, { emit }) {
    const openTime = dayjs().unix();
    const localValues = computed<any>({
      get: () => {
        if (Array.isArray(props.values)) {
          return props.values;
          // return new Proxy(props.values, {
          //   get: (target: VObject[], key) =>
          //     target.map(
          //       (value: VObject) =>
          //         new Proxy(value, {
          //           set: (t, k, v) => {
          //             console.log('array item set', t, k, v);
          //             Reflect.set(t, k, v);
          //             return true;
          //           },
          //         })[key as string],
          //     ),
          //   set: (target, key, value) => {
          //     console.log('set', target, key, value);
          //     Reflect.set(target, key, value);
          //     return true;
          //   },
          // });
        }
        // 当 props.values 是对象时，表示每个 step 绑定的是同一个对象。
        // 此时 让 返回值 取任何值时，都返回 props.values 本身。
        return new Proxy(props.values, {
          get: target => target,
          set: (target, key, val) => {
            // console.log(val, 'set');

            mergeWith(target, cloneDeep(val), VModel.mergeWithCustomizer);
            return true;
          },
        });
      },
      set: val => {
        emit('update:values', val);
      },
    });

    const contextRef = computed(() => merge({}, props.context));
    // const route = useRoute();
    useContextProvide(contextRef, {});

    const formRefs = reactive(
      props.steps.reduce((out: VObject, step: TaTemplateFormStepsStep, index: number) => {
        if (step.type === 'form') {
          out[`form${index}`] = null;
        }
        return out;
      }, {} as VObject),
    );

    const getBindKey = (index: number) => props.steps[index].bindKey || 'modelValue';

    const onPrevious = () => {
      current.value--;
    };

    const onNext = async () => {
      const formRef = formRefs[`form${current.value}`];
      if (formRef) {
        await formRef
          .validate()
          .then(async () => {
            await props?.onNextCallback?.(current);
            current.value++;
          })
          .catch((e: any) => {
            console.error(e);
            if (e?.error_msg) {
              return message.error(e?.error_msg);
            }
            message.error('请完善表单');
          });
      } else {
        const componentRef = activeComponentRefs.value[current.value];
        await (typeof componentRef?.validate == 'function'
          ? componentRef.validate()
          : Promise.resolve()
        ).then(async () => {
          if (props.onNextCallback) {
            await props?.onNextCallback?.(current);
          } else {
            current.value++;
          }
        });
      }
    };

    const validate = (shouldSkipValidation = false) => {
      return shouldSkipValidation
        ? Promise.resolve({})
        : Promise.all([
            // ...Object.keys(formRefs).map(key => formRefs[key]?.validate()),
            ...activeComponentRefs.value.map(componentRef =>
              typeof componentRef?.validate == 'function'
                ? componentRef.validate()
                : Promise.resolve(),
            ),
          ]);
    };

    const onComplete = (editApi?: any, shouldSkipValidation = false, config: VObject = {}) => {
      emit('beforeComplete');
      return new Promise<void>((resolve, reject) => {
        validate(shouldSkipValidation)
          .then(() => {
            (typeof props.record.save === 'function'
              ? props.record.save(config, editApi)
              : Promise.resolve()
            )
              .then((res: VObject) => {
                emit('complete', { shouldSkipValidation });
                resolve(res as any);
              })
              .catch((error: any) => {
                reject(error);
              });
          })
          .catch(error => {
            message.error('请完善表单');
            emit('fail');
            reject(error);
          });
      });
    };

    const submit = (
      callback: {
        success?: (
          formData: VObject,
          opts: { steps: TaTemplateFormStepsStep[]; openTime: number },
        ) => void;
        fail?: (error: Error, opts: { steps: TaTemplateFormStepsStep[] }) => void;
        skipValidate?: boolean;
      },
      editApi?: any,
    ) => {
      const shouldSkipValidation = props.skipValidate || callback?.skipValidate;

      onComplete(editApi, shouldSkipValidation)
        .then((res: any) => {
          callback.success && callback.success(res, { steps: props.steps, openTime });
        })
        .catch(error => {
          callback.fail && callback.fail(error, { steps: props.steps });
          throw error;
        });
    };

    const onCancel = () => {
      emit('cancel');
    };

    const current = ref(0);

    const onUpdateCurrent = (val: number) => {
      if (props.clickable) current.value = val;
    };

    const getBindingValue = (index: number) => {
      if (props.steps[index]?.modelKeyPrefix) {
        if (!get(localValues.value[index], props.steps[index].modelKeyPrefix!)) {
          set(localValues.value[index], props.steps[index].modelKeyPrefix!, {});
        }
        // console.log(localValues.value[index], 'localValues.value[index]');
        // console.log(
        //   get(localValues.value[index], props.steps[index].modelKeyPrefix!),
        //   'get(localValues.value[index], props.steps[index].modelKeyPrefix!)',
        // );

        return new Proxy(get(localValues.value[index], props.steps[index].modelKeyPrefix!), {
          get: (target, key) => Reflect.get(target, key),
          set: (target, key, value) => {
            update(index, set({}, key, value));
            return true;
          },
        });
      } else {
        return localValues.value[index];
      }
    };

    const update = (index: number, value: any) => {
      // localValues.value[index] = props.steps[index].modelKeyPrefix
      //   ? set({}, props.steps[index].modelKeyPrefix!, value)
      //   : value;
      // console.log('update', value);

      const val = props.steps[index].modelKeyPrefix
        ? set({}, props.steps[index].modelKeyPrefix!, value)
        : value;
      mergeWith(localValues.value[index], cloneDeep(val), VModel.mergeWithCustomizer);
    };

    const activeComponentRefs = ref<any[]>([]);

    // const updateModelValue = (index: number, value: VObject) => {
    //   const target = getBindingValue(index);
    //   Object.assign(target, value);
    // };

    return {
      update,
      ...toRefs(props),
      localValues,
      formRefs,
      ...toRefs(formRefs),
      current,
      getBindKey,
      onPrevious,
      onNext,
      onComplete,
      onCancel,
      onUpdateCurrent,
      submit,
      activeComponentRefs,
      validate,
      getBindingValue,
      // context,
      // updateModelValue,
    };
  },
});
export default TaTemplateFormSteps;
</script>

<template lang="pug">
.ta-template-form-steps.flex.flex-col(:class='{ "!flex-row": vertical }')
  slot(v-if='!isPlane', name='steps', :current='current', :click='onUpdateCurrent')
    .steps.flex-center(v-show='!stepHide')
      .steps-content(class='w-1/2')
        a-steps.flex-center(:current='current', size='default', @update:current='onUpdateCurrent')
          a-step(v-for='(step, index) in steps', :title='step.title')
  .ta-template-form-steps__shell.flex-grow.h-0.flex.flex-col(:class='{ "!h-full": vertical, "w-0": vertical }')
    .content.flex-grow.h-0.flex.flex-col.overflow-auto
      template(v-for='(step, index) in steps')
        .step-content(v-show='isPlane || index === current', :class='{ "!h-full": vertical }')
          template(v-if='steps[index].type === "form"')
            TaTemplateFormViewer.form(
              v-if='disabled || step.mode === "show"',
              :ref='(el) => activeComponentRefs[index] = el',
              :modelValue='getBindingValue(index)',
              :template='steps[index].form',
              :accessibility='accessibility',
            )
            TaTemplateForm.form(
              v-else
              :ref='(el) => { activeComponentRefs[index] = el; formRefs[`form${index}`] = el; }',
              :modelValue='getBindingValue(index)',
              :template='steps[index].form'
              :context='context',
              :accessibility='accessibility'
            )
            //- @update:modelValue='update(index, $event)'
            //- :useDefaultTheme='false',

            //- :useDefaultTheme='false',
          template(v-else-if='steps[index].type === "dynamicComponent"')
            component(
              :is='steps[index].dynamicComponent',
              :ref='(el) => activeComponentRefs[index] = el',
              v-bind:[getBindKey(index)]='getBindingValue(index)',
              :disabled='disabled',
              v-on:[`update:${getBindKey(index)}`]='update(index, $event)',
              v-bind='steps[index].options?.props'
            )
          template(v-else-if='steps[index].type === "slot"')
            slot(
              :name='steps[index].key'
              v-bind:[getBindKey(index)]='getBindingValue(index)',
              :disabled='disabled',
            )

    slot(v-if='actionable', name='actions', :actions='{ onPrevious, onNext, onComplete, onCancel, validate }', :current='current')
      .step-actions.flex-shrink-0
        a-button.button(v-if='current > 0' @click='onPrevious') 上一步
        a-button.button(v-if='current < steps.length - 1', type='primary', @click='onNext') 下一步
        a-button.button(v-if='current === steps.length - 1', type='primary', @click='() => onComplete()') 提交
        a-button.button(@click='onCancel') 取消
</template>

<style lang="stylus" scoped>
.ta-template-form-steps
  width 100%
  height 100%
  display flex
  >>> .ant-steps-item-finish
    .ant-steps-icon
      top -4px
  .steps
    padding 10px 30px
    display flex
    justify-content center
    width 100%
  .content
    display flex
    width 100%
    .step-content
      // padding 20px 0 20px 0
      width 100%
      display flex
      justify-content center
      .form
        width 70%
        margin-top 24px
  .step-actions
    display flex
    justify-content flex-end
    border-top 1px solid #f0f0f0
    padding 12px
    // margin 0 -24px -12px -24px
    .button
      margin-left 12px
</style>
