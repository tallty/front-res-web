<script lang="ts">
import { defineComponent, toRefs, computed, PropType, ref, onMounted, nextTick } from 'vue';
import { Modal, ModalProps } from 'ant-design-vue';
import { TaTemplateFormWithActionsProps } from './TaTemplateFormWithActionsProps';
import { VObject } from '@/lib/vails';

const TaTemplateFormWithActionsModal = defineComponent({
  name: 'TaTemplateFormWithActionsModal',
  components: {},
  props: {
    // visible: { type: Boolean, default: false },
    closeConfirm: { type: Boolean, default: false },
    ...TaTemplateFormWithActionsProps,
    ...(Modal.props as unknown as Record<keyof ModalProps, PropType<ModalProps[keyof ModalProps]>>),
  },
  emits: [
    'update:visible',
    'update:editable',
    'close',
    'success',
    'fail',
    'afterSave',
    'afterDelete',
    'afterSaveAndCreateNext',
    'cancel',
    'onTemporaryStorage',
  ],
  setup(props, { emit }) {
    const localEditable = computed({
      get: () => props.editable,
      set: val => emit('update:editable', val),
    });

    const localVisible = computed({
      get: () => props.visible,
      set: val => emit('update:visible', val),
    });

    const onSuccess = () => {
      emit('success');
    };

    const onFail = () => {
      emit('fail');
    };

    const afterSave = (value: VObject) => {
      emit('afterSave', value);
    };

    const afterDelete = () => {
      emit('afterDelete');
    };

    const afterSaveAndCreateNext = (opts?: { keepDataOnNext: boolean }) => {
      emit('afterSaveAndCreateNext', opts);
    };

    const onTemporaryStorage = () => {
      emit('onTemporaryStorage');
    };

    const onClose = () => {
      localVisible.value = false;
    };

    const onCancel = () => {
      emit('cancel');
    };

    const visibleConfirmClose = ref(false);

    const onModalClose = (visible: boolean) => {
      if (!visible) {
        // 判断是否有改动
        if (
          props.closeConfirm &&
          props.record?.dirty &&
          Object.keys(props.record.dirty()).length > 0
        ) {
          visibleConfirmClose.value = true;
        } else {
          localVisible.value = visible;
        }
      }
      // localVisible.value = visible;
    };

    const form = ref<any>(null);

    const bodyStyle = computed(() => ({
      backgroundColor: form.value?.backgroundColor || 'white',
    }));

    const localTaTemplateForm = computed(() => form.value?.form);

    return {
      ...toRefs(props),
      localVisible,
      form,
      onSuccess,
      onFail,
      onClose,
      bodyStyle,
      visibleConfirmClose,
      onModalClose,
      localTaTemplateForm,
      localEditable,
      afterSave,
      afterDelete,
      afterSaveAndCreateNext,
      onTemporaryStorage,
      onCancel,
    };
  },
});
export default TaTemplateFormWithActionsModal;
</script>

<template lang="pug">
TaNoPaddingModal.ta-template-form-with-actions-modal(
  v-if='localVisible',
  :visible='localVisible',
  :closeable='false',
  :title='title',
  :footer='null',
  :bodyStyle='{ overflow: "auto", height: "fit-content" }',
  :modalContentStyle='{ "border-radius": "0.75rem", overflow: "hidden" }',
  width='50vw',
  v-bind='{ ...$props, ["onUpdate:visible"]: undefined }',
  @update:visible='onModalClose'
  @close='onCancel',
)
  slot
    .modal-body(:style='bodyStyle')
      TaTemplateFormWithActions.form(
        ref='form',
        v-bind='$props',
        v-model:editable='localEditable',
        @fail='onFail',
        @success='onSuccess',
        @close='onClose',
        @afterSave='afterSave',
        @afterDelete='afterDelete',
        @afterSaveAndCreateNext='afterSaveAndCreateNext',
        @onTemporaryStorage='onTemporaryStorage',
      )
      TaTemplateFormAnchors.anchors(
        :formComponent='localTaTemplateForm'
      )
  a-modal(
    v-model:visible='visibleConfirmClose'
    title='放弃保存',
    @ok='onClose'
  )
    span 表单有改动，放弃后数据将不会被保存
</template>

<style lang="stylus" scoped>
.modal-body
  position relative
  display flex
  justify-content center
  align-items center
  width 100%
  height 100%
  .form
    width 100%
    >>> .ta-template-form-with-actions__form
      overflow-y auto
      max-height calc(100vh - 55px - 68px - 48px - 40px)
      height fit-content

    >>> .step-content > .form
      width 100%
      margin 0
      height fit-content

    >>> .ta-template-form-steps__shell
      height fit-content

    >>> .ta-template-form-steps__shell > .content
      height fit-content

    >>> .actions
      margin-bottom 0
  .anchors
    position absolute
    top 20px
    right 24px
</style>
