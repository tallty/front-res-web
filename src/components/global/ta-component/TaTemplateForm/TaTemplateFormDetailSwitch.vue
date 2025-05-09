<script lang="ts">
import { VModel } from '@/lib/vails';
import { defineComponent, toRefs, computed, PropType, ref } from 'vue';
import {
  TaTemplateFormItem,
  TaTemplateFormStepsStep,
} from '@/components/global/ta-component/ta-template-form-core/types';
import TaTemplateForm from './TaTemplateForm.vue';
import { message } from 'ant-design-vue';
import { VObject } from '@/lib/vails/model';

// NOTE: 已启用，请使用 TaTemplateFormWithAction 或 TaTemplateFormWithActionDrawer

const TaTemplateFormDetailSwitch = defineComponent({
  name: 'TaTemplateFormDetailSwitch',
  components: {
    TaTemplateForm,
  },
  emits: [
    'update:visible',
    'update:editable',
    'afterSave',
    'afterDelete',
    'afterSaveAndCreateNext',
  ],
  props: {
    visible: { type: Boolean, default: false },
    template: {
      type: [Object, String] as PropType<TaTemplateFormItem | string>,
      required: true,
    },
    record: { type: Object as PropType<VModel & VObject>, required: true },
    modelValue: { type: Object, default: null },
    title: { type: String, default: '表单' },
    editable: { type: Boolean, default: true },
    steps: { type: Array as PropType<TaTemplateFormStepsStep[]>, default: () => [] },
  },
  setup(props, { emit }) {
    const localVisible = computed({
      get: () => props.visible,
      set: val => emit('update:visible', val),
    });
    const localEditable = computed({
      get: () => props.editable,
      set: val => emit('update:editable', val),
    });

    const form = ref<any>(null);
    const stepsForm = ref<any>(null);

    const onClose = () => (localVisible.value = false);

    const onSave = (successCallback?: () => void) =>
      (form.value || stepsForm.value).submit({
        success: (data: VObject) => {
          onCancelEditable();
          message.success('修改成功');
          if (typeof successCallback === 'function') {
            successCallback();
          } else {
            if (!props.record.id || (data && data.id && data.id !== props.record.id)) {
              // 当前创建，关闭
              localVisible.value = false;
            }
            emit('afterSave');
          }
        },
        fail: () => message.error('修改失败'),
      });

    const onDelete = () =>
      props.record
        .delete()
        .then(() => {
          message.success('删除成功');
          localVisible.value = false;
          emit('afterDelete');
        })
        .catch(() => message.error('删除失败'));

    const onCancelEditable = () => {
      localEditable.value = false;
      if (!props.record.formData.id) {
        onClose();
      }
    };

    const onEdit = () => (localEditable.value = true);

    const randomKey = ref(Date.now());
    const onSaveAndCreateNext = () => {
      onSave(() => {
        // change key to re-render form, to fresh useForm
        randomKey.value = Date.now();
        emit('afterSaveAndCreateNext');
      });
    };

    return {
      ...toRefs(props),
      localVisible,
      localEditable,
      onSave,
      onDelete,
      onEdit,
      onClose,
      onCancelEditable,
      form,
      stepsForm,
      onSaveAndCreateNext,
      randomKey,
    };
  },
});
export default TaTemplateFormDetailSwitch;
</script>

<template lang="pug">
.ta-template-form-detail-switch
  template(v-if='localEditable')
    //- | record.formData {{ record.formData }}
    .content
      TaTemplateForm(
        v-if='steps.length === 0'
        :key='randomKey',
        ref='form',
        :template='template',
        :record='record',
        v-model='modelValue'
      )
      TaTemplateFormSteps(
        v-else,
        :key='randomKey',
        :steps='steps',
        ref='stepsForm',
        :record='record',
        v-model:values='record.formData'
        :actionable='false',
        :clickable='true'
      )
    .footer
      .footer-content
        .actions
          a-button.button(type='primary', @click='onSaveAndCreateNext') 保存并创建下一个
          a-button.button(type='primary', @click='onSave') {{ record.id ? "保存" : "创建" }}
          a-button.cancel(@click='onCancelEditable') 取消
  template(v-else)
    .content
      TaTemplateFormViewer(
        v-if='steps.length === 0'
        :template='template',
        :record='record',
        :modelValue='modelValue'
      )
      TaTemplateFormSteps(
        v-else,
        :steps='steps',
        :record='record',
        :values='record.formData'
        :disabled='true',
        :clickable='true'
        :actionable='false',
      )
    .footer
      .footer-content
        .actions
          a-button.button(type='primary', @click='onEdit') 编辑
          TaPopoverConfirm(title='删除', content='确定删除该记录吗？', placement='top', @confirm='onDelete')
            a-button.button.delete(type='danger') 删除
          a-button.cancel(@click='onClose') 取消
</template>

<style lang="stylus" scoped>
.ta-template-form-detail-switch
  .content
    padding 0 20px 30px 20px
    overflow auto
  .footer
    position absolute
    background white
    bottom 0
    left 0
    right 0
    display flex
    justify-content flex-end
    .footer-content
      width 800px
      padding 17px 40px
      .actions
        display flex
        .button
          margin-right 20px
        .delete
          color #FF4141
          background white
          border 1px solid #FF4141
      // .cancel
      //   background #CCCCCC
      //   color white
</style>
