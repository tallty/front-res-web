<script lang="ts">
import { defineComponent, ref, toRefs } from 'vue';
import useToast from './TaIndexView/ta-index-view-core/useToast';

const TaPopoverConfirm = defineComponent({
  name: 'TaPopoverConfirm',
  props: {
    // visible: { type: Boolean, default: false },
    title: { type: String, default: '删除' },
    content: { type: [String, Array], default: '您确认继续执行此操作吗?' },
    placement: { type: String, default: 'bottom' },
    width: { type: Number, default: 248 },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    trigger: { type: String, default: 'click' },
    type: { type: String, default: 'danger' },
    okText: { type: String, default: '确认' },
    autoClose: { type: Boolean, default: true },
  },
  emits: ['confirm', 'close', 'update:visible'],
  setup(props, { emit }) {
    // const localVisible = computed({
    //   get: () => props.visible,
    //   set: val => emit('update:visible', val),
    // });

    const { toasts } = useToast();

    const toastConfirm = () => {
      new Promise<void>((resolve, reject) => {
        toasts.warning({
          title: props.title,
          content: props.content as any,
          buttonText: '确认',
          subButtonText: '我再想想',
          buttonCallback: (closeFn: () => void) => {
            closeFn();
            resolve();
          },
          subButtonCallback: reject,
        });
      }).then(() => {
        confirm();
      });
    };

    const localVisible = ref(false);

    const throttleDisabled = ref(false);

    const confirm = () => {
      if (throttleDisabled.value) return;
      throttleDisabled.value = true;

      emit('confirm');
      syncVisible(false);

      setTimeout(() => {
        throttleDisabled.value = false;
      }, 1000);
    };

    const syncVisible = (visible: boolean) => {
      if (props.autoClose) {
        localVisible.value = visible;
        if (!visible) {
          emit('close');
        }
      }
    };

    const onClose = () => {
      localVisible.value = false;
    };

    return {
      ...toRefs(props),
      localVisible,
      throttleDisabled,
      confirm,
      syncVisible,
      onClose,
      toasts,
      toastConfirm,
    };
  },
});

export default TaPopoverConfirm;
</script>

<template lang="pug">
a-popover(
  v-if='!(toasts && typeof content === "object")'
  :visible='localVisible',
  :placement='placement',
  trigger='click',
  @visibleChange='syncVisible'
)
  template(#content)
    .popover-card(:style='{ width: width + "px" }')
      .popover-header
        slot(name='title')
          span {{ title }}
        a-button.close(shape='circle', size='small', @click='onClose')
          template(#icon)
            TaIcon(type='CloseOutlined')
      .popover-content
        slot(name='content')
          span {{ content }}
      .popover-footer
        slot(name='footer')
          a-button(
            :type='type',
            block,
            size='large',
            @click.stop='confirm',
            :loading='loading',
            :disabled='throttleDisabled || disabled'
          )
            | {{ okText }}
  slot
div(v-else, @click.stop='toastConfirm')
  slot
</template>

<style lang="stylus" scoped>
.popover-card
  margin -12px -16px
  width 100%
  .popover-header
    position relative
    padding 15px 0px
    width 100%
    height 50px
    border-bottom 1px #E5E5E5 solid
    text-align center
    font-weight 500
    font-size 16px
    line-height 20px
    .close
      position absolute
      top 15px
      right 12px
      width 20px
      height 20px
      border none
      color #a6a6a6
      line-height 20px
      &:hover
        color $primary-color
  .popover-content
    padding 16px
    width 100%
  .popover-footer
    padding 12px 16px
    width 100%
    border-top 1px #E5E5E5 solid
</style>
