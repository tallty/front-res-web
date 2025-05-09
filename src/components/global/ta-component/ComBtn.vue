<script lang="ts">
import { ref, defineComponent, toRefs } from 'vue';
export default defineComponent({
  name: 'ComBtn',
  props: {
    value: { type: String, default: '' },
    bgColor: { type: String, default: '' },
    color: { type: String, default: '' },
    fontSize: { type: String, default: '' },
  },
  setup(props) {
    let msg = ref('');
    return {
      ...toRefs(props),
      msg,
    };
  },
});
</script>

<template lang="pug">
.btn-box.hover(v-if='value', :style='{ background: bgColor, color, fontSize }') {{ value }}
</template>

<style lang="stylus" scoped>
.btn-box
  color #1890FF
  background: rgba(60, 168, 245, 0.2);
  border-radius: 12px;
  font-size 14px
  padding 4px 10px
</style>
