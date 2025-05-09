<script lang="ts">
import { VModel } from '@/lib/vails';
import { defineComponent, toRefs, computed, ref, onMounted } from 'vue';
import {
  TaTemplateFormStepsStep,
  defaultThemeBackgroundColor,
} from '@/components/global/ta-component/ta-template-form-core/types';
import { VObject } from '@/lib/vails/model';
import { message, Modal } from 'ant-design-vue';
import defaultTheme from './defaultTheme';
import { get, set, cloneDeep } from 'lodash';
import { TaTemplateFormWithActionsProps } from './TaTemplateFormWithActionsProps';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';
import SparkMD5 from 'spark-md5';
import { useI18n } from 'vue-i18n';

const TaTemplateFormWithActions = defineComponent({
  name: 'TaTemplateFormWithActions',
  components: {},
  props: {
    showFormNo: { type: Boolean, default: false },
    ...TaTemplateFormWithActionsProps,
  },
  emits: [
    'close',
    'success',
    'fail',
    'update:editable',
    'update:modelValue',
    'afterSave',
    'afterDelete',
    'afterSaveAndCreateNext',
    'update:modelValue',
    'onTemporaryStorage',
  ],
  setup(props, { emit }) {
    const route = useRoute();
    const localEditable = computed({
      get: () => props.editable,
      set: val => emit('update:editable', val),
    });

    const localLoading = computed(() => props.loading || props.record?.store?.loading?.value);

    const form = ref<any>(null);
    const viewer = ref<any>(null);
    const stepsForm = ref<any>(null);
    const onSuccessEventTrack = (sensorsdata: VObject) => {
      (window as any)?.$trackCustomEvent?.('SubmitTable', {
        template: props.template,
        localTemplate: sensorsdata.localTemplate,
        record: props.record,
        source: route.meta?.name || route.path,
        time_consuming: dayjs().unix() - sensorsdata.openTime,
      });
    };
    const onErrorEventTrack = (errorInfo: VObject, sensorsdata: VObject) => {
      (window as any)?.$trackCustomEvent?.('FillError', {
        errorInfo,
        template: props.template,
        localTemplate: sensorsdata.localTemplate,
      });
    };
    const onSave = (successCallback?: () => void) => {
      const idWas = props.record?.id;
      (form.value || stepsForm.value).submit(
        {
          success: (data: VObject, sensorsdata: VObject) => {
            onSuccessEventTrack(sensorsdata);
            onCancelEditable();
            if (Object.keys(props.record || {}).length > 0) {
              if (!idWas || (data && data.id && data.id !== idWas)) {
                message.success('创建成功');
              } else {
                message.success('修改成功');
              }
            }

            if (clearStorageAfterSave.value) window.localStorage.removeItem(templateSeq.value);

            if (typeof successCallback === 'function') {
              successCallback();
            } else {
              if (!props.record?.id || (data && data.id && data.id !== props.record.id)) {
                // 当前创建，关闭
                onClose();
              }
              emit('success');
              emit('afterSave', localValue.value);
            }
          },
          fail: (error: any, sensorsdata: VObject) => {
            console.log(error);
            emit('fail', error);
            if (error?.errorFields?.[0]?.errors?.[0]) {
              onErrorEventTrack(error, sensorsdata);
              message.error(error.errorFields?.[0]?.errors?.[0]);
            } else {
              message.error('修改失败');
            }
          },
        },
        props.editApi,
      );
    };

    const onClose = () => {
      emit('close');
    };

    const onDelete = () =>
      props.record
        ?.delete()
        ?.then(() => {
          message.success('删除成功');
          onClose();
          emit('afterDelete');
        })
        ?.catch(() => message.error('删除失败'));

    const onCancelEditable = () => {
      localEditable.value = false;
      // if (!props.record?.formData?.id) {
      onClose();
      // }
    };

    const onEdit = () => (localEditable.value = true);

    const randomKey = ref(Date.now());
    const keepDataOnNext = ref(false);
    const changeKeepDataOnNext = (bool: boolean) => {
      keepDataOnNext.value = bool;
    };

    const onSaveAndCreateNext = () => {
      onSave(() => {
        // change key to re-render form, to fresh useForm
        randomKey.value = Date.now();
        emit('afterSaveAndCreateNext', { keepDataOnNext: keepDataOnNext.value });
      });
    };

    const templateSeq = computed(() => SparkMD5.hash(JSON.stringify(props.template) || ''));
    const clearStorageAfterSave = ref(false);

    const onTemporaryStorage = () => {
      if (props.tempStoreLocation === 'frontend') {
        window.localStorage.setItem(templateSeq.value, JSON.stringify(localValue.value));
        message.success('已暂存');
        emit('onTemporaryStorage');
        return;
      }

      if (
        props.record?.storageConfigCache &&
        typeof props.record?.storageConfigCache === 'function'
      ) {
        props.record.storageConfigCache('onTemporaryStorage', true);
      }

      (form.value || stepsForm.value).submit(
        {
          success: () => {
            message.success('操作成功');
            emit('success', { temporaryStorage: true });
          },
          fail: () => {
            message.error('请检查表单信息');
            emit('fail');
          },
          skipValidate: true,
        },
        props.editApi,
      );
    };

    const localTemplate = computed(() => form.value?.localTemplate || viewer.value?.localTemplate);

    const backgroundColor = computed(
      () =>
        localTemplate.value?.options?.theme?.background?.color ||
        defaultTheme.value?.background?.color ||
        defaultThemeBackgroundColor,
    );

    const getStepBindKey = (step: TaTemplateFormStepsStep) => {
      return [step.type === 'form' ? step.bindKey : null].filter(i => i).join('.');
    };

    const localValue = computed({
      get: () => {
        const result =
          typeof props.modelValue !== 'undefined' ? props.modelValue : props.record.formData;
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

    const stepsBindValues = computed({
      get: () =>
        props.steps.map((step: TaTemplateFormStepsStep) => {
          const bindKey = getStepBindKey(step);
          if (bindKey) {
            if (
              get(localValue.value, bindKey) === null ||
              get(localValue.value, bindKey) === undefined
            ) {
              set(localValue.value, bindKey, {});
            }
            return get(localValue.value, bindKey);
          } else {
            return localValue.value;
          }
        }),

      set: val => {
        props.steps.forEach((step: TaTemplateFormStepsStep, index: number) => {
          const bindKey = getStepBindKey(step);
          bindKey
            ? set(localValue.value, bindKey, val[index])
            : Object.assign(localValue.value, val[index]);
        });
      },
    });

    const loadTemporaryStorage = () => {
      const item = JSON.parse(window.localStorage.getItem(templateSeq.value) as string);
      if (
        props.canTemporaryStorage &&
        props.tempStoreLocation === 'frontend' &&
        item &&
        localEditable &&
        !props.record.id
      ) {
        Modal.confirm({
          title: '是否从暂存中读取数据?',
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            localValue.value = item;
            clearStorageAfterSave.value = true;
          },
        });
      }
    };
    const { t } = useI18n();

    onMounted(() => {
      loadTemporaryStorage();
    });

    const tempStorageEnable = computed(() => {
      return (
        props.canTemporaryStorage &&
        (props.tempStoreLocation !== 'frontend' ||
          (props.tempStoreLocation === 'frontend' && !props.record.id))
      );
    });

    const validate = () => {
      return (form.value || stepsForm.value)?.validate?.();
    };

    return {
      ...toRefs(props),
      localValue,
      form,
      onSave,
      onClose,
      onTemporaryStorage,
      backgroundColor,
      localTemplate,
      localEditable,
      onDelete,
      onEdit,
      onCancelEditable,
      viewer,
      stepsForm,
      onSaveAndCreateNext,
      randomKey,
      localLoading,
      keepDataOnNext,
      stepsBindValues,
      tempStorageEnable,
      validate,
      changeKeepDataOnNext,

      t,
    };
  },
});
export default TaTemplateFormWithActions;
</script>

<template lang="pug">
.ta-template-form-with-actions
  template(v-if='localEditable && !disabled')
    TaTemplateForm.ta-template-form-with-actions__form(
      v-if='steps.length === 0'
      v-model='localValue',
      ref='form',
      :key='randomKey',
      :template='template',
      :record='record',
      :skipValidate='skipValidate',
      :accessibility='accessibility'
      :context='context',
      :showFormNo='showFormNo'
    )
    TaTemplateFormSteps.ta-template-form-with-actions__form(
      v-else,
      ref='stepsForm',
      :key='randomKey',
      :steps='steps',
      :record='record',
      v-model:values='stepsBindValues'
      :actionable='false',
      :clickable='true'
      :isPlane='isPlane',
      :context='context',
      :accessibility='accessibility'
    )
    .actions.relative
      .absolute.left-4.h-full.flex.items-center.w-40(v-if='canSaveAndCreateNext')
        a-checkbox(v-model:checked='keepDataOnNext') {{ t('taComponent.form.saveNew') }}
      a-button.button(@click='onCancelEditable') {{ t('taComponent.form.cancel') }}
      a-button.button(v-if='tempStorageEnable', @click='onTemporaryStorage') {{ t('taComponent.form.save') }}
      a-button.button(
        v-if='canSaveAndCreateNext',
        type='primary',
        :loading='localLoading',
        @click='onSaveAndCreateNext'
      )  {{ t('taComponent.form.saveNext') }}
      a-button.button(
        type='primary',
        :loading='localLoading',
        @click='onSave'
      ) {{ okText || (record.id ? t('taComponent.form.submit') : t('taComponent.form.create')) }}
  template(v-else)
    TaTemplateFormViewer.ta-template-form-with-actions__form(
      v-if='steps.length === 0'
      ref='viewer',
      :template='template',
      :record='record',
      :modelValue='modelValue'
      :context='context',
      :showFormNo='showFormNo'
    )
    TaTemplateFormSteps.ta-template-form-with-actions__form(
      v-else,
      :steps='steps',
      :record='record',
      :values='stepsBindValues'
      :disabled='true',
      :clickable='true'
      :actionable='false',
      :isPlane='isPlane',
      :context='context',
    )
    .actions
      TaPolicyResource(
        :store='record.store',
        :resource_id="record.id",
        actionKey='update',
      )
        a-button.button(
          v-if='!disabled',
          type='primary',
          :loading='localLoading'
          @click='onEdit',
        ) {{t('taComponent.form.edit')}}
      TaPolicyResource(
        :store='record.store',
        :resource_id="record.id",
        actionKey='delete',
      )
        TaPopoverConfirm(
          v-if='!disabled && canDelete',
          :title="t('taComponent.form.delete')",
          :content="t('taComponent.form.deleteConfirm')",
          placement='top',
          @confirm='onDelete'
        )
          a-button.button.delete(type='danger', :loading='localLoading') {{t('taComponent.form.delete')}}
      a-button.button.cancel(@click='onClose') {{t('taComponent.form.close')}}
</template>

<style lang="stylus" scoped>
.ta-template-form-with-actions
  .ta-template-form-with-actions__form
    overflow-y auto
    height 100%
  .actions
    display flex
    justify-content center
    align-items center
    margin 12px 0 -16px 0
    height 68px
    border-radius 12px
    background white
    .button
      margin-right 16px
      min-width 100px
      height 40px
      border-radius 4px
</style>
