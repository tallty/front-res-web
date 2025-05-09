<script lang="ts">
import { ref, defineComponent, toRefs, onMounted, nextTick, watch, computed, PropType } from 'vue';
import { Drawer, DrawerProps } from 'ant-design-vue';

const TaNoPaddingDrawer = defineComponent({
  name: 'TaNoPaddingDrawer',
  components: {},
  props: {
    ...(Drawer.props as unknown as Record<
      keyof DrawerProps,
      PropType<DrawerProps[keyof DrawerProps]>
    >),
  },
  setup(props, { emit, slots }) {
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
            // 去掉 drawer padding
            if (container.value && container.value.parentElement) {
              container.value.parentElement.style.padding = '0';
            }
          });
        }
      },
      { immediate: true },
    );

    return {
      ...toRefs(props),
      container,
      localVisible,
      slots,
    };
  },
});
export default TaNoPaddingDrawer;
</script>

<template lang="pug">
a-drawer(v-bind='$props', v-model:visible='localVisible')
  .ta-no-padding-drawer__body(ref='container')
    slot

  template(#title, v-if='slots.title')
    slot(name='title')

  template(#footer, v-if='slots.footer')
    slot(name='footer')
</template>

<style lang="stylus" scoped>
.ta-no-padding-drawer__body
  height 100%
  width 100%
</style>
