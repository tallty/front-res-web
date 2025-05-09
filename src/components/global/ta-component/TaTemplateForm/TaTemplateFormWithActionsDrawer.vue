<script lang="ts">
import { defineComponent, toRefs, computed, PropType, ref, onMounted, nextTick } from 'vue';
import { TaTemplateFormWithActionsProps } from './TaTemplateFormWithActionsProps';
import { Drawer, DrawerProps } from 'ant-design-vue';
import { VObject } from '@/lib/vails';
import { useI18n } from 'vue-i18n';

const TaTemplateFormWithActionsDrawer = defineComponent({
  name: 'TaTemplateFormWithActionsDrawer',
  components: {},
  props: {
    // visible: { type: Boolean, default: false },
    closeConfirm: { type: Boolean, default: true },
    ...TaTemplateFormWithActionsProps,
    ...(Drawer.props as unknown as Record<
      keyof DrawerProps,
      PropType<DrawerProps[keyof DrawerProps]>
    >),
  },
  emits: [
    'update:visible',
    'update:editable',
    'success',
    'fail',
    'afterSave',
    'afterDelete',
    'afterSaveAndCreateNext',
    'cancel',
    'update:modelValue',
    'onTemporaryStorage',
  ],
  setup(props, { emit }) {
    const localEditable = computed({
      get: () => props.editable,
      set: val => emit('update:editable', val),
    });

    const localModelValue = computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val),
    });

    const localVisible = computed({
      get: () => props.visible,
      set: val => emit('update:visible', val),
    });

    const onSuccess = (opts?: { temporaryStorage: boolean }) => {
      emit('success', opts);
    };

    const onFail = () => {
      emit('fail');
    };

    const afterSave = (value: VObject) => {
      // localVisible.value = false;
      emit('afterSave', value);
    };

    const afterDelete = () => {
      // localVisible.value = false;
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

    const onCloseConfirm = () => {
      localVisible.value = false;
      visibleConfirmClose.value = false;
      onClose();
    };

    const visibleConfirmClose = ref(false);

    const onDrawerClose = (val: boolean) => {
      if (!val) {
        // 判断是否有改动
        if (
          props.closeConfirm &&
          props.record?.dirty &&
          Object.keys(props.record.dirty()).length > 0
        ) {
          visibleConfirmClose.value = true;
        } else {
          localVisible.value = val;
        }
      }
      // localVisible.value = visible;
    };

    const form = ref<any>(null);

    const bodyStyle = computed(() => ({
      backgroundColor: form.value?.backgroundColor,
    }));

    const localTaTemplateForm = computed(() => form.value?.form);

    const { t } = useI18n();
    return {
      ...toRefs(props),
      localVisible,
      form,
      onSuccess,
      onFail,
      onClose,
      onCancel,
      bodyStyle,
      visibleConfirmClose,
      onDrawerClose,
      localTaTemplateForm,
      localEditable,
      afterSave,
      afterDelete,
      afterSaveAndCreateNext,
      onCloseConfirm,
      onTemporaryStorage,
      localModelValue,

      t,
    };
  },
});
export default TaTemplateFormWithActionsDrawer;
</script>

<template lang="pug">
TaNoPaddingDrawer.ta-template-form-with-actions-drawer(
  v-if='localVisible',
  v-bind='{ ...$props, ["onUpdate:visible"]: undefined }'
  :visible='localVisible',
  :closeable='false',
  :title='title',
  :width='width || "1100px"',
  @update:visible='onDrawerClose'
  @close='onCancel',
)
  slot
    .drawer-body(:style='bodyStyle')
      TaTemplateFormWithActions.form(
        ref='form',
        v-bind='$props',
        v-model:modelValue='localModelValue',
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
    :title='t("taComponent.actionDrawer.title")',
    @ok='onCloseConfirm'
    :cancelText='t("taComponent.actionDrawer.cancel")',
    :okText='t("taComponent.actionDrawer.sure")'
  )
    span {{ t('taComponent.actionDrawer.text') }}
</template>

<style lang="stylus" scoped>
.drawer-body
  position relative
  display flex
  justify-content center
  align-items center
  width 100%
  height 100%
  .form
    padding 24px 0
    min-width 880px
    width 90%
    >>> .ta-template-form-with-actions__form
      overflow-y auto
      height calc(100vh - 55px - 68px - 48px)
  .anchors
    position absolute
    top 20px
    right 24px
</style>
