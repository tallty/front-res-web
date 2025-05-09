<script lang="ts">
import { ref, defineComponent, toRefs, computed } from 'vue';
import useToast, {
  toastInterface,
} from '@/components/global/ta-component/TaIndexView/ta-index-view-core/useToast';

const TaMiniToasts = defineComponent({
  name: 'TaMiniToasts',
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
export default TaMiniToasts;
</script>

<template lang="pug">
transition(name='fade', mode='in-out')
  .ta-toasts.z-99999.flex-center(v-if='enableToasts.length > 0', class='bottom-3/8')
    transition-group(name='fade')
      TaToastMiniCard.mx-5(
        v-for='toast in enableToasts',
        :toast='toast',
        :key='toast.id',
        :class='{ "cursor-pointer": !!toast.callback }'
        @click.native='() => toast.callback()'
      )
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
