<script lang="ts">
import { ref, defineComponent, toRefs, onUpdated, onUnmounted } from 'vue';
import { onMounted } from '@vue/runtime-core';
import elementDetectorGenerator from 'element-resize-detector';

const TaSeamlessScrollCore = defineComponent({
  name: 'TaSeamlessScrollCore',
  components: {},
  props: {
    step: { type: Number, default: 0.1 },
  },
  setup(props) {
    const container = ref<any>(null);
    const hContainer = ref<any>(null);
    const hContainerHeight = ref(0);
    const offsetUnit = ref(0);
    const renderCount = ref(1);

    const setRenderCount = () => {
      if (container.value?.clientHeight && hContainer.value?.clientHeight) {
        offsetUnit.value = (hContainerHeight.value - container?.value.clientHeight) / 10;
        hContainerHeight.value = hContainer.value.clientHeight;
        renderCount.value = container?.value.clientHeight <= hContainer.value?.clientHeight ? 2 : 1;
      }
    };

    onMounted(setRenderCount);
    onMounted(() => {
      const elementDetector = elementDetectorGenerator({});
      elementDetector.listenTo(hContainer.value, setRenderCount);
      hContainer.value.addEventListener('wheel', onWheelChange);
    });

    const onWheelChange = (event: any) => {
      const animation = hContainer.value.getAnimations()[0];
      if (animation) {
        animation.currentTime += event.deltaY * 100;
      }
    };

    return {
      ...toRefs(props),
      hContainer,
      container,
      renderCount,
      hContainerHeight,
      offsetUnit,
    };
  },
});
export default TaSeamlessScrollCore;
</script>

<template lang="pug">
.ta-seamless-scroll-core.h-full(ref='container')
  //- v-for='i in renderCount',
    :class='{ scroll: i == 1 && renderCount > 1  }'
  .h-fit.w-full(
    ref='hContainer',
    :class='{ scroll: renderCount > 1  }'
    :style='{ "--distance": `${(hContainerHeight || 0) * step * 0.1}s`, "--offset-unit": offsetUnit }'
  )
    slot
    slot(v-if='renderCount > 1', name='copy')
</template>

<style lang="stylus" scoped>
.h-fit
  height fit-content

.scroll
  animation scroll var(--distance) linear infinite
  &:hover
    animation-play-state paused

@keyframes scroll
  for i in 0..10
    {10% * i}
      // margin-top "calc(%s * var(--offset-unit) * -1px)" % i
      transform "translateY(calc(%s * var(--offset-unit) * -1px))" % i
</style>
