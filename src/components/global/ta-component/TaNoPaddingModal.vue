<script lang="ts">
import { ref, defineComponent, toRefs, nextTick, watch, computed, PropType } from 'vue';
import { Modal, ModalProps } from 'ant-design-vue';

const TaNoPaddingModal = defineComponent({
  name: 'TaNoPaddingModal',
  components: {},
  props: {
    ...(Modal.props as unknown as Record<keyof ModalProps, PropType<ModalProps[keyof ModalProps]>>),
    height: { type: String, default: undefined },
    modalStyle: { type: Object, default: () => ({}) },
    modalContentStyle: { type: Object, default: () => ({}) },
    headerStyle: { type: Object, default: () => ({}) },
    footerStyle: { type: Object, default: () => ({}) },
    antModalStyle: { type: Object, default: () => ({}) },
    cancelBtnName: { type: String, default: () => '取消' },
    okBtnName: { type: String, default: () => '确定' },
    showCancel: { type: Boolean, default: () => true },
    top: { type: String, default: undefined },
    maskClosable: { type: Boolean, default: () => true },
  },
  emits: ['update:visible', 'handleOk', 'handleCancel', 'ok', 'cancel'],
  setup(props, { emit }) {
    const container = ref<any>(null);
    const localVisible = computed({
      get: () => props.visible,
      set: val => emit('update:visible', val),
    });

    watch(
      () => props.visible,
      () => {
        if (props.visible) {
          nextTick(() => {
            // 去掉 Modal padding
            if (container.value && container.value.parentElement) {
              container.value.parentElement.style.padding = '0';

              Object.keys(props.modalStyle).forEach(
                key => (container.value.parentElement.style[key] = props.modalStyle[key]),
              );
            }

            if (
              container.value &&
              container.value.parentElement &&
              container.value.parentElement.parentElement
            ) {
              Object.keys(props.modalContentStyle).forEach(
                key =>
                  (container.value.parentElement.parentElement.style[key] =
                    props.modalContentStyle[key]),
              );

              const header =
                container.value.parentElement.parentElement.getElementsByClassName(
                  'ant-modal-header',
                )[0];

              if (header) {
                Object.keys(props.headerStyle).forEach(
                  key => (header.style[key] = props.headerStyle[key]),
                );
              }

              const footer =
                container.value.parentElement.parentElement.getElementsByClassName(
                  'ant-modal-footer',
                )[0];

              if (footer) {
                Object.keys(props.footerStyle).forEach(
                  key => (footer.style[key] = props.footerStyle[key]),
                );
              }
            }
            // 更改模态框定位
            if (
              container.value &&
              container.value.parentElement &&
              container.value.parentElement.parentElement &&
              container.value.parentElement.parentElement.parentElement
            ) {
              const antModalTop = props.top || '20px';
              const antModal = container.value.parentElement.parentElement.parentElement;
              antModal.style.top = antModalTop;
              antModal.style.maxHeight = `calc(100vh - ${
                Number.isNaN(Number(antModalTop)) ? antModalTop : `${antModalTop}px`
              })`;
              Object.keys(props.antModalStyle).forEach(
                key => (antModal.style[key] = props.antModalStyle[key]),
              );
              // container.value.parentElement.parentElement.parentElement.style.overflow = 'hidden';
            }
          });
        }
      },
      { immediate: true },
    );

    const handleOk = () => {
      emit('handleOk');
      emit('ok');
      emit('update:visible', false);
    };
    const handleCancel = () => {
      emit('handleCancel');
      emit('cancel');
      emit('update:visible', false);
    };

    return {
      ...toRefs(props),
      container,
      localVisible,
      handleCancel,
      handleOk,
    };
  },
});
export default TaNoPaddingModal;
</script>

<template lang="pug">
a-modal.ta-no-padding-modal(v-bind='$props', v-model:visible='localVisible',:maskClosable='maskClosable')
  .ta-no-padding-modal__body(ref='container')
    slot

  template(#title)
    slot(name='title')

  template(#footer, v-if='$slots.footer')
    slot(name='footer')
  template(#footer, v-else)
    a-button(v-if="showCancel", @click="handleCancel") {{cancelBtnName || '取消'}}
    a-button.btn-ok(type="primary", @click="handleOk") {{okBtnName || '确定'}}
</template>

<style lang="stylus">
.ta-no-padding-modal
  .ant-modal-footer
    .ant-btn
      border-radius 8px !important
</style>

<style lang="stylus" scoped>

.ta-no-padding-modal__body
  height 100%
  width 100%

.btn-ok
  background $primary-color
</style>
