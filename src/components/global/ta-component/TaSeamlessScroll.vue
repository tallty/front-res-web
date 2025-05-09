<script lang="ts">
import { defineComponent, toRefs } from 'vue';

// NOTE: 直接使用 slot copy 一份出来，会死循环，不知为何。

const TaSeamlessScroll = defineComponent({
  name: 'TaSeamlessScroll',
  components: {},
  props: {
    step: { type: Number, default: 0.1 },
  },
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
export default TaSeamlessScroll;
</script>

<template lang="pug">
TaSeamlessScrollCore(v-bind='$props')
  template(#default)
    slot
  template(#copy)
    .copy-container.w-full.h-full
      slot
</template>

<style lang="stylus" scoped></style>
