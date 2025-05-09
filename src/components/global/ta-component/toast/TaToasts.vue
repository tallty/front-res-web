<script lang="ts">
import { ref, defineComponent, toRefs, computed } from 'vue';
import useToast, {
  toastInterface,
} from '@/components/global/ta-component/TaIndexView/ta-index-view-core/useToast';

const TaToasts = defineComponent({
  name: 'TaToasts',
  components: {},
  props: {},
  setup(props) {
    const { toasts } = useToast();

    const enableToasts = computed(() =>
      toasts.value.filter((toast: toastInterface) => !toast._cancelTime),
    );

    return {
      ...toRefs(props),
      enableToasts,
    };
  },
});
export default TaToasts;
</script>

<template lang="pug">
.mask.bg-dark-900.fixed.top-0.left-0.w-screen.h-screen.z-9998.opacity-80(v-if='enableToasts.length > 0')
transition(name='fade', mode='in-out')
  .ta-toasts.fixed.inset-auto.z-9999.flex.flex-col.items-center.w-full.h-full(v-if='enableToasts.length > 0', class='top-1/8')
    .overflow-y-auto(class='max-h-6/8')
      transition-group(name='fade')
        TaToastCard.mx-5(v-for='toast in enableToasts', :toast='toast', :key='toast.id', @click.native='toast.callback')
</template>

<style lang="stylus" scoped>
.fade-enter-active, .fade-leave-active
  transition all 0.3s

.fade-enter-from, .fade-leave-to
  opacity 0

.fade-enter-from
  // transform translateY(100px)
.fade-leave-to
  // transform translateY(-100px)
</style>
